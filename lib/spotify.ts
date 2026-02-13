export function getSpotifyAuthUrl() {
  return "/api/auth/login"
}

async function fetchSpotify(endpoint: string, options: RequestInit = {}) {
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
    const message = await res.text()
    throw new Error(message || `Spotify API error: ${res.status}`)
  }
  return res.json()
}

export async function getCurrentUser(_token?: string) {
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

export async function getRecommendations(_token: string, seedTracks: string[], seedArtists: string[] = [], limit = 20) {
  const params = new URLSearchParams({ limit: limit.toString() })
  if (seedTracks.length > 0) params.append("seed_tracks", seedTracks.slice(0, 5).join(","))
  if (seedArtists.length > 0) params.append("seed_artists", seedArtists.slice(0, 5 - seedTracks.length).join(","))
  return fetchSpotify(`/recommendations?${params.toString()}`)
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
