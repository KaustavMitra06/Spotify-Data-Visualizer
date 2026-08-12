import { NextResponse } from "next/server"
import { getValidAccessToken, setAuthCookies } from "@/lib/spotify-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type TrackContext = {
  id: string
  name: string
  artists: string
  album?: string
  popularity?: number
}

type ChatMessage = {
  role: "assistant" | "user"
  content: string
  trackIds?: string[]
}

function parseJsonObject(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    return match ? JSON.parse(match[0]) : null
  }
}

function normalizeStringArray(value: unknown, limit: number) {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, limit)
}

function buildPrompt(prompt: string, tracks: TrackContext[], messages: ChatMessage[]) {
  const usedTrackIds = new Set(messages.flatMap((message) => message.trackIds || []))
  return JSON.stringify({
    userRequest: prompt,
    recentConversation: messages,
    availableTracks: tracks.map((track) => ({
      ...track,
      alreadySuggested: usedTrackIds.has(track.id),
    })),
    instructions: [
      "If the user wants picks from the current batch, choose trackIds from availableTracks.",
      "If the user wants different/new songs beyond the batch, create 1-3 concise Spotify search queries.",
      "Do not invent final song titles. Search queries are allowed; real songs will come from Spotify Search.",
      "Prefer tracks that were not already suggested.",
    ],
    responseShape: {
      message: "one short conversational explanation",
      trackIds: ["0 to 4 ids from availableTracks"],
      searchQueries: ["0 to 3 Spotify search queries for finding different real tracks"],
    },
  })
}

function fallbackSearchQueries(prompt: string, tracks: TrackContext[]) {
  const query = prompt.toLowerCase()
  const artists = Array.from(
    new Set(
      tracks
        .flatMap((track) => track.artists.split(",").map((artist) => artist.trim()))
        .filter(Boolean),
    ),
  )
  const styleTerms = []

  if (query.includes("chill") || query.includes("study") || query.includes("focus") || query.includes("calm")) {
    styleTerms.push("chill", "lofi", "acoustic")
  } else if (query.includes("upbeat") || query.includes("party") || query.includes("gym") || query.includes("energy")) {
    styleTerms.push("upbeat", "dance", "high energy")
  } else if (query.includes("sad") || query.includes("moody") || query.includes("late night")) {
    styleTerms.push("sad", "moody", "late night")
  } else if (query.includes("discover") || query.includes("different") || query.includes("new") || query.includes("obscure")) {
    styleTerms.push("underground", "new", "indie")
  }

  const artistQueries = artists.slice(0, 3).map((artist) => `artist:${artist}`)
  const styleQueries = styleTerms.map((term) => `${term} ${artists[0] || "music"}`)
  return [...styleQueries, ...artistQueries, prompt].filter(Boolean).slice(0, 3)
}

async function callOpenAi(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are a concise Spotify discovery assistant. Return only valid JSON with keys message, trackIds, and searchQueries.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
      max_output_tokens: 600,
    }),
  })

  if (!response.ok) {
    throw new Error((await response.text()) || "OpenAI request failed.")
  }

  const data = await response.json()
  return (
    data.output_text ||
    data.output
      ?.flatMap((item: any) => item.content || [])
      ?.map((content: any) => content.text || "")
      ?.join("")
  )
}

async function callOllama(prompt: string) {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434"
  const model = process.env.OLLAMA_MODEL || "llama3.2"

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      messages: [
        {
          role: "system",
          content:
            "You are a concise Spotify discovery assistant. Return only valid JSON with keys message, trackIds, and searchQueries.",
        },
        { role: "user", content: prompt },
      ],
      options: {
        temperature: 0.9,
      },
    }),
  })

  if (!response.ok) {
    throw new Error((await response.text()) || "Ollama request failed.")
  }

  const data = await response.json()
  return data.message?.content || data.response || ""
}

async function callLlm(prompt: string) {
  const openAiText = await callOpenAi(prompt)
  if (openAiText) {
    return { provider: "OpenAI", text: openAiText }
  }

  const ollamaText = await callOllama(prompt)
  return { provider: "Ollama", text: ollamaText }
}

async function searchSpotifyTracks(request: Request, queries: string[], excludedIds: Set<string>) {
  if (queries.length === 0) return { tracks: [] as any[], refreshed: null as Awaited<ReturnType<typeof getValidAccessToken>>["refreshed"] }

  const { accessToken, refreshed } = await getValidAccessToken(request)
  if (!accessToken) return { tracks: [], refreshed }

  const foundTracks: any[] = []
  const seen = new Set(excludedIds)

  for (const query of queries.slice(0, 3)) {
    const params = new URLSearchParams({ q: query, type: "track", limit: "5" })
    const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) continue
    const data = await response.json()
    for (const track of data.tracks?.items || []) {
      if (!track?.id || seen.has(track.id)) continue
      seen.add(track.id)
      foundTracks.push(track)
      if (foundTracks.length >= 8) break
    }
    if (foundTracks.length >= 8) break
  }

  return { tracks: foundTracks, refreshed }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    prompt?: string
    tracks?: TrackContext[]
    messages?: ChatMessage[]
  }

  const prompt = body.prompt?.trim()
  const tracks = (body.tracks || []).filter((track) => track.id && track.name).slice(0, 40)
  const messages = (body.messages || []).slice(-10)

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 })
  }

  const allowedTrackIds = new Set(tracks.map((track) => track.id))
  const usedTrackIds = new Set(messages.flatMap((message) => message.trackIds || []))
  const excludedIds = new Set([...allowedTrackIds, ...usedTrackIds])

  try {
    let llm: { provider: string; text: string } | null = null
    let llmError: unknown = null

    try {
      llm = await callLlm(buildPrompt(prompt, tracks, messages))
    } catch (error) {
      llmError = error
    }

    if (!llm) {
      const searchQueries = fallbackSearchQueries(prompt, tracks)
      const { tracks: searchedTracks, refreshed } = await searchSpotifyTracks(request, searchQueries, excludedIds)
      const response = NextResponse.json({
        provider: "Spotify Search",
        message:
          searchedTracks.length > 0
            ? "I could not reach a local or hosted LLM, so I searched Spotify directly for different real tracks."
            : `I could not reach a local or hosted LLM, and Spotify Search did not return new tracks. ${llmError instanceof Error ? llmError.message : ""}`.trim(),
        trackIds: [],
        tracks: searchedTracks,
      })

      if (refreshed) {
        setAuthCookies(response, refreshed)
      }

      return response
    }

    const parsed = parseJsonObject(llm.text)
    const trackIds = normalizeStringArray(parsed?.trackIds, 4).filter((id) => allowedTrackIds.has(id))
    const searchQueries = normalizeStringArray(parsed?.searchQueries, 3)
    const { tracks: searchedTracks, refreshed } = await searchSpotifyTracks(
      request,
      searchQueries.length > 0 ? searchQueries : fallbackSearchQueries(prompt, tracks),
      excludedIds,
    )

    const response = NextResponse.json({
      provider: llm.provider,
      message:
        typeof parsed?.message === "string" && parsed.message.trim()
          ? parsed.message.trim()
          : searchedTracks.length > 0
            ? "I searched Spotify for some different real tracks that fit."
            : "I found a few tracks from the current batch that fit.",
      trackIds,
      tracks: searchedTracks,
    })

    if (refreshed) {
      setAuthCookies(response, refreshed)
    }

    return response
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No LLM provider is configured. Add OPENAI_API_KEY, or install Ollama and run a local model."
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
