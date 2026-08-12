"use client"

import type { FormEvent } from "react"
import { useEffect, useState } from "react"
import { useSpotify } from "@/components/spotify-provider"
import {
  getTopTracks,
  getTopArtists,
  getRecentlyPlayed,
  getRecommendations,
  searchTracks,
  createPlaylist,
  addTracksToPlaylist,
} from "@/lib/spotify"
import { isDemoMode } from "@/lib/demo-mode"
import { getDemoAssistantReply } from "@/lib/demo-data"
import { TrackCard } from "@/components/track-card"
import { TrackDetailModal } from "@/components/track-detail-modal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RefreshCw, Plus, Check, Sparkles, Bot, Send } from "lucide-react"

type ChatMessage = {
  role: "assistant" | "user"
  content: string
  trackIds?: string[]
}

function getTrackArtists(track: any) {
  return (track.artists || []).map((artist: any) => artist.name).join(", ")
}

function formatTrackList(tracks: any[]) {
  return tracks.map((track) => `${track.name} by ${getTrackArtists(track)}`).join("; ")
}

function hashText(value: string) {
  return value.split("").reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7)
}

function getUsedTrackIds(messages: ChatMessage[]) {
  return new Set(messages.flatMap((message) => message.trackIds || []))
}

function rankWithPromptVariety(prompt: string, tracks: any[]) {
  const seed = hashText(`${prompt}:${tracks.length}`)
  return tracks
    .map((track, index) => ({
      track,
      score: ((seed + index * 37 + hashText(track.id || track.name || "")) % 1000) / 1000,
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ track }) => track)
}

function pickTracksForPrompt(prompt: string, tracks: any[], usedIds: Set<string>) {
  const query = prompt.toLowerCase()
  const availableTracks = tracks.filter((track) => !usedIds.has(track.id))
  const candidateTracks = availableTracks.length >= 3 ? availableTracks : tracks
  const artistMatches = candidateTracks.filter((track) =>
    (track.artists || []).some((artist: any) => artist.name.toLowerCase().includes(query)),
  )

  if (artistMatches.length > 0) return rankWithPromptVariety(prompt, artistMatches).slice(0, 3)

  if (query.includes("popular") || query.includes("familiar") || query.includes("safe")) {
    return [...candidateTracks]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0) || hashText(`${prompt}:${a.id}`) - hashText(`${prompt}:${b.id}`))
      .slice(0, 3)
  }

  if (query.includes("new") || query.includes("discover") || query.includes("deep") || query.includes("different")) {
    return [...candidateTracks]
      .sort((a, b) => (a.popularity || 0) - (b.popularity || 0) || hashText(`${prompt}:${b.id}`) - hashText(`${prompt}:${a.id}`))
      .slice(0, 3)
  }

  if (query.includes("chill") || query.includes("study") || query.includes("focus") || query.includes("calm")) {
    const quieterTracks = candidateTracks.filter((track) => (track.popularity || 0) < 75)
    return rankWithPromptVariety(prompt, quieterTracks.length > 0 ? quieterTracks : candidateTracks).slice(0, 3)
  }

  if (query.includes("upbeat") || query.includes("party") || query.includes("gym") || query.includes("energy")) {
    const upbeatTracks = candidateTracks.filter((track) => (track.popularity || 0) >= 45)
    return rankWithPromptVariety(prompt, upbeatTracks.length > 0 ? upbeatTracks : candidateTracks).slice(0, 3)
  }

  if (query.includes("surprise") || query.includes("random") || query.includes("anything")) {
    return rankWithPromptVariety(`${prompt}:${Date.now()}`, candidateTracks).slice(0, 3)
  }

  return rankWithPromptVariety(prompt, candidateTracks).slice(0, 3)
}

function buildAssistantReply(prompt: string, tracks: any[], messages: ChatMessage[]) {
  if (tracks.length === 0) {
    return {
      content: "Load recommendations first, then I can help narrow them down.",
      trackIds: [],
    }
  }

  const usedIds = getUsedTrackIds(messages)
  const picks = pickTracksForPrompt(prompt, tracks, usedIds)
  if (picks.length === 0) {
    return {
      content: "I could not find a tight match in this batch. Try asking for something like chill, upbeat, popular, or discovery.",
      trackIds: [],
    }
  }

  const allAlreadyUsed = picks.every((track) => usedIds.has(track.id))
  const prefix = allAlreadyUsed
    ? "I have looped through the fresh options, so here is a different angle from the same pool:"
    : "Here is a fresh set from this batch:"

  return {
    content: `${prefix} ${formatTrackList(picks)}.`,
    trackIds: picks.map((track) => track.id),
  }
}

function uniqueTracks(tracks: any[], excludedIds = new Set<string>()) {
  const seen = new Set<string>()
  return tracks.filter((track) => {
    if (!track?.id || seen.has(track.id) || excludedIds.has(track.id)) return false
    seen.add(track.id)
    return true
  })
}

async function getFallbackRecommendations(token: string, artistNames: string[], excludedTrackIds: string[]) {
  const excluded = new Set(excludedTrackIds)
  const searches = await Promise.all(
    artistNames.slice(0, 4).map((artist) => searchTracks(token, `artist:${artist}`, 8).catch(() => null)),
  )

  const tracks = searches.flatMap((result) => result?.tracks?.items || [])
  return uniqueTracks(tracks, excluded).slice(0, 20)
}

async function getLlmRecommendationReply(prompt: string, tracks: any[], messages: ChatMessage[]) {
  if (isDemoMode()) {
    // Guest mode has no LLM backend; use the local mood-aware demo assistant.
    return getDemoAssistantReply(prompt, messages)
  }
  const response = await fetch("/api/ai/recommendations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      messages,
      tracks: tracks.map((track) => ({
        id: track.id,
        name: track.name,
        artists: getTrackArtists(track),
        album: track.album?.name,
        popularity: track.popularity,
      })),
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || "Could not get AI recommendation.")
  }

  return (await response.json()) as { provider?: string; message: string; trackIds: string[]; tracks?: any[] }
}

export default function RecommendationsPage() {
  const { token, user } = useSpotify()
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [seedInfo, setSeedInfo] = useState<{ artists: string[]; tracks: string[] }>({ artists: [], tracks: [] })
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [chatMode, setChatMode] = useState<"ai" | "fallback">("ai")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Ask for a vibe, situation, or mood and I will use AI to pick from this batch.",
    },
  ])

  const fetchRecommendations = async () => {
    if (!token) return

    setLoading(true)
    setSaved(false)
    setError(null)

    try {
      const [topTracks, topArtists] = await Promise.all([
        getTopTracks(token, "short_term", 5),
        getTopArtists(token, "short_term", 5),
      ])

      let seedTracks = (topTracks.items || []).slice(0, 3).map((t: any) => t.id)
      let seedArtists = (topArtists.items || []).slice(0, 2).map((a: any) => a.id)

      let seedArtistsNames = (topArtists.items || []).slice(0, 2).map((a: any) => a.name)
      let seedTracksNames = (topTracks.items || []).slice(0, 3).map((t: any) => t.name)

      if (seedTracks.length === 0) {
        const recent = await getRecentlyPlayed(token, 10)
        seedTracks = (recent.items || [])
          .map((item: any) => item?.track?.id)
          .filter(Boolean)
          .slice(0, 5)
        seedTracksNames = (recent.items || [])
          .map((item: any) => item?.track?.name)
          .filter(Boolean)
          .slice(0, 5)
      }

      if (seedTracks.length === 0 && seedArtists.length === 0) {
        setRecommendations([])
        setSeedInfo({ artists: [], tracks: [] })
        setError("Not enough listening history to generate recommendations yet.")
        return
      }

      setSeedInfo({
        artists: seedArtistsNames,
        tracks: seedTracksNames,
      })

      try {
        const data = await getRecommendations(token, seedTracks, seedArtists, 20)
        setRecommendations(data.tracks || [])
      } catch (error) {
        const status = (error as Error & { status?: number }).status
        if (status !== 403 && status !== 404) {
          throw error
        }

        const fallbackTracks = await getFallbackRecommendations(token, seedArtistsNames, seedTracks)
        setRecommendations(fallbackTracks)
        if (fallbackTracks.length === 0) {
          setError("Spotify recommendations are unavailable for this app, and the fallback search found no tracks.")
        }
      }
    } catch (error) {
      const status = (error as Error & { status?: number }).status
      if (status === 404) {
        setError("Recommendations are unavailable for this app right now.")
        return
      }
      console.error(error)
      setError("Could not load recommendations. This endpoint may be unavailable or blocked for your app.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [token])

  const handleSavePlaylist = async () => {
    if (!token || !user || recommendations.length === 0) return

    setSaving(true)
    try {
      const playlist = await createPlaylist(
        token,
        user.id,
        `Discover Weekly - ${new Date().toLocaleDateString()}`,
        "Personalized recommendations based on your listening history",
      )
      const uris = recommendations.map((track) => track.uri)
      await addTracksToPlaylist(token, playlist.id, uris)
      setSaved(true)
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleAssistantSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const prompt = chatInput.trim()
    if (!prompt || chatLoading) return

    const userMessage: ChatMessage = { role: "user", content: prompt }
    setChatInput("")
    setChatLoading(true)
    setMessages((current) => [...current, userMessage])

    try {
      const reply = await getLlmRecommendationReply(prompt, recommendations, messages)
      setChatMode("ai")
      if (reply.tracks && reply.tracks.length > 0) {
        setRecommendations((current) => uniqueTracks([...current, ...(reply.tracks || [])]))
      }
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: reply.provider ? `${reply.message} (${reply.provider})` : reply.message,
          trackIds: [...reply.trackIds, ...(reply.tracks || []).map((track) => track.id)],
        },
      ])
    } catch (error) {
      console.error(error)
      const fallbackReply = buildAssistantReply(prompt, recommendations, messages)
      setChatMode("fallback")
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `${fallbackReply.content} AI is not configured or failed, so I used the local picker for this one.`,
          trackIds: fallbackReply.trackIds,
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const tracksById = new Map(recommendations.map((track) => [track.id, track]))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recommendations</h1>
          <p className="text-muted-foreground">Personalized tracks based on your taste</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchRecommendations}
            disabled={loading}
            className="border-border text-foreground hover:bg-secondary bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={handleSavePlaylist}
            disabled={saving || saved || recommendations.length === 0}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save as Playlist"}
              </>
            )}
          </Button>
        </div>
      </div>

      {seedInfo.artists.length > 0 && (
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-card-foreground">Based on your favorites</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground">Artists:</span> {seedInfo.artists.join(", ")} •{" "}
            <span className="text-foreground">Tracks:</span> {seedInfo.tracks.join(", ")}
          </p>
        </Card>
      )}

      <Card className="bg-card border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-card-foreground">Recommendation Assistant</h3>
          {chatMode === "fallback" && <span className="text-xs text-muted-foreground">Local fallback</span>}
        </div>
        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={message.role === "user" ? "text-right" : "text-left"}>
              <div
                className={`inline-block max-w-[92%] rounded-md px-3 py-2 text-sm ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                }`}
              >
                {message.content}
              </div>
              {message.trackIds && message.trackIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.trackIds.map((trackId) => {
                    const track = tracksById.get(trackId)
                    if (!track) return null
                    return (
                      <Button
                        key={trackId}
                        type="button"
                        size="sm"
                        variant="outline"
                        className="bg-transparent"
                        onClick={() => setSelectedTrack(trackId)}
                      >
                        {track.name}
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        <form onSubmit={handleAssistantSubmit} className="mt-4 flex gap-2">
          <Input
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            placeholder="Try: what should I play while studying?"
            className="bg-background"
            disabled={chatLoading}
          />
          <Button type="submit" size="icon" aria-label="Send recommendation request" disabled={chatLoading}>
            <Send className={`w-4 h-4 ${chatLoading ? "animate-pulse" : ""}`} />
          </Button>
        </form>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      ) : error ? (
        <Card className="bg-card border-border p-6 text-muted-foreground">{error}</Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {recommendations.map((track) => (
            <TrackCard key={track.id} track={track} onClick={() => setSelectedTrack(track.id)} />
          ))}
        </div>
      )}

      <TrackDetailModal trackId={selectedTrack} onClose={() => setSelectedTrack(null)} />
    </div>
  )
}
