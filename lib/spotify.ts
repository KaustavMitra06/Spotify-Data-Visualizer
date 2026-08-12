import { isDemoMode } from "@/lib/demo-mode"
import { DEMO_USER, getDemoResponse } from "@/lib/demo-data"

export function getSpotifyAuthUrl() {
  return "/api/auth/login"
}

async function fetchSpotify(endpoint: string, options: RequestInit = {}) {
  if (isDemoMode()) {
    return getDemoResponse(endpoint, options)
  }
  const headers = new Headers(options.headers)
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  const res = await fetch(`/api/spotify${endpoint}`, {
    ...options,
    headers,
    cache: "no-store",
  })
  if (!res.ok) {
    const retryAfter = res.headers.get("retry-after")
    const message = await res.text()
    const error = new Error(message || `Spotify API error: ${res.status}`) as Error & { status?: number }
    error.status = res.status
    if (retryAfter) {
      ;(error as Error & { retryAfter?: number }).retryAfter = Number(retryAfter)
    }
    throw error
  }
  return res.json()
}

export async function getCurrentUser(_token?: string) {
  if (isDemoMode()) {
    return DEMO_USER
  }
  const res = await fetch("/api/auth/me", { cache: "no-store" })
  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || `Spotify API error: ${res.status}`)
  }
  return res.json()
}

export async function getTopArtists(_token: string, timeRange = "medium_term", limit = 20) {
  return fetchSpotify(`/me/top/artists?time_range=${timeRange}&limit=${limit}`)
}

export async function getTopTracks(_token: string, timeRange = "medium_term", limit = 20) {
  return fetchSpotify(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`)
}

export async function getRecentlyPlayed(_token: string, limit = 50) {
  return fetchSpotify(`/me/player/recently-played?limit=${limit}`)
}

export async function getAudioFeatures(_token: string, trackIds: string[]) {
  return fetchSpotify(`/audio-features?ids=${trackIds.join(",")}`)
}

export async function getTrack(_token: string, trackId: string) {
  return fetchSpotify(`/tracks/${trackId}`)
}

export async function getPlaylists(_token: string, limit = 50) {
  return fetchSpotify(`/me/playlists?limit=${limit}`)
}

export async function getPlaylistTracks(_token: string, playlistId: string) {
  return fetchSpotify(`/playlists/${playlistId}/tracks`)
}

export async function getPlaylistTracksPage(_token: string, playlistId: string, offset = 0, limit = 100) {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  })
  return fetchSpotify(`/playlists/${playlistId}/tracks?${params.toString()}`)
}

export async function getPlaylist(_token: string, playlistId: string, fields?: string) {
  const suffix = fields ? `?fields=${encodeURIComponent(fields)}` : ""
  return fetchSpotify(`/playlists/${playlistId}${suffix}`)
}

export async function getPlaylistTrackCount(_token: string, playlistId: string) {
  const data = await getPlaylist(_token, playlistId, "tracks.total")
  const total = data?.tracks?.total
  const numeric = typeof total === "number" ? total : total != null ? Number(total) : null
  return Number.isFinite(numeric) ? numeric : null
}

export async function getPlaylistWithItems(_token: string, playlistId: string) {
  const fields = [
    "name",
    "owner(id,display_name)",
    "external_urls",
    "images",
    "tracks.total",
  ].join(",")
  return getPlaylist(_token, playlistId, fields)
}

export async function getRecommendations(_token: string, seedTracks: string[], seedArtists: string[] = [], limit = 20) {
  const params = new URLSearchParams({ limit: limit.toString() })
  if (seedTracks.length > 0) params.append("seed_tracks", seedTracks.slice(0, 5).join(","))
  if (seedArtists.length > 0) params.append("seed_artists", seedArtists.slice(0, 5 - seedTracks.length).join(","))
  return fetchSpotify(`/recommendations?${params.toString()}`)
}

export async function searchTracks(_token: string, query: string, limit = 20) {
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: limit.toString(),
  })
  return fetchSpotify(`/search?${params.toString()}`)
}

export async function createPlaylist(_token: string, userId: string, name: string, description = "") {
  return fetchSpotify(`/users/${userId}/playlists`, {
    method: "POST",
    body: JSON.stringify({ name, description, public: false }),
  })
}

export async function addTracksToPlaylist(_token: string, playlistId: string, uris: string[]) {
  return fetchSpotify(`/playlists/${playlistId}/tracks`, {
    method: "POST",
    body: JSON.stringify({ uris }),
  })
}
