// Sample data that powers the no-login "demo" experience.
// Shapes mirror the Spotify Web API responses the UI expects, so the entire
// dashboard renders exactly as it would with a real connected account.
//
// Artist / track / album names are real so the demo reads like a genuine
// listening profile; a visible "Demo mode" banner keeps it clearly a sample.

/* ----------------------------------------------------------------------- */
/* helpers                                                                  */
/* ----------------------------------------------------------------------- */

function hash(value: string): number {
  let h = 7
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0
  }
  return h
}

// Deterministic 0..1 pseudo-random from a string seed.
function rand(seed: string): number {
  return (hash(seed) % 10000) / 10000
}

// Deterministic cover/photo art. Picsum returns a stable image per seed and
// works fine in the deployed app (external images are allowed; Next Image is
// configured `unoptimized`).
function img(seed: string, size = 400): string {
  return `https://picsum.photos/seed/sdv-${seed}/${size}/${size}`
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000
}

function searchUrl(text: string): string {
  return `https://open.spotify.com/search/${encodeURIComponent(text)}`
}

/* ----------------------------------------------------------------------- */
/* user                                                                     */
/* ----------------------------------------------------------------------- */

export const DEMO_USER = {
  id: "demo-user",
  display_name: "Jordan Ellis",
  email: "jordan.ellis@example.com",
  images: [{ url: img("avatar", 200) }],
  followers: { total: 428 },
  country: "US",
  product: "premium",
}

/* ----------------------------------------------------------------------- */
/* artists                                                                  */
/* ----------------------------------------------------------------------- */

type RawArtist = { id: string; name: string; genres: string[]; popularity: number; followers: number }

const RAW_ARTISTS: RawArtist[] = [
  { id: "a-tame-impala", name: "Tame Impala", genres: ["psychedelic pop", "indietronica"], popularity: 84, followers: 8420331 },
  { id: "a-dua-lipa", name: "Dua Lipa", genres: ["pop", "dance pop"], popularity: 92, followers: 39120044 },
  { id: "a-kendrick", name: "Kendrick Lamar", genres: ["hip hop", "west coast rap"], popularity: 93, followers: 31004512 },
  { id: "a-sza", name: "SZA", genres: ["r&b", "alternative r&b"], popularity: 90, followers: 15330210 },
  { id: "a-arctic", name: "Arctic Monkeys", genres: ["indie rock", "garage rock"], popularity: 88, followers: 22045990 },
  { id: "a-bon-iver", name: "Bon Iver", genres: ["indie folk", "chamber folk"], popularity: 74, followers: 3810225 },
  { id: "a-daft-punk", name: "Daft Punk", genres: ["french house", "electronic"], popularity: 82, followers: 9920117 },
  { id: "a-odesza", name: "ODESZA", genres: ["chillwave", "electronic"], popularity: 71, followers: 2210884 },
  { id: "a-fleetwood", name: "Fleetwood Mac", genres: ["classic rock", "soft rock"], popularity: 83, followers: 14550903 },
  { id: "a-glass-animals", name: "Glass Animals", genres: ["indie pop", "gauze pop"], popularity: 80, followers: 6120440 },
]

function buildArtist(raw: RawArtist) {
  return {
    id: raw.id,
    name: raw.name,
    genres: raw.genres,
    popularity: raw.popularity,
    followers: { total: raw.followers },
    images: [{ url: img(raw.id) }, { url: img(raw.id, 160) }],
    external_urls: { spotify: searchUrl(raw.name) },
    type: "artist",
    uri: `spotify:artist:${raw.id}`,
  }
}

const ARTISTS = RAW_ARTISTS.map(buildArtist)
const ARTIST_BY_ID = new Map(ARTISTS.map((a) => [a.id, a]))

/* ----------------------------------------------------------------------- */
/* tracks                                                                   */
/* ----------------------------------------------------------------------- */

type RawTrack = {
  id: string
  name: string
  artistId: string
  album: string
  year: number
  durationMs: number
  popularity: number
}

const RAW_TRACKS: RawTrack[] = [
  { id: "t-less-i-know", name: "The Less I Know the Better", artistId: "a-tame-impala", album: "Currents", year: 2015, durationMs: 216320, popularity: 86 },
  { id: "t-let-it-happen", name: "Let It Happen", artistId: "a-tame-impala", album: "Currents", year: 2015, durationMs: 467440, popularity: 74 },
  { id: "t-levitating", name: "Levitating", artistId: "a-dua-lipa", album: "Future Nostalgia", year: 2020, durationMs: 203807, popularity: 89 },
  { id: "t-dont-start", name: "Don't Start Now", artistId: "a-dua-lipa", album: "Future Nostalgia", year: 2020, durationMs: 183290, popularity: 85 },
  { id: "t-humble", name: "HUMBLE.", artistId: "a-kendrick", album: "DAMN.", year: 2017, durationMs: 177000, popularity: 88 },
  { id: "t-money-trees", name: "Money Trees", artistId: "a-kendrick", album: "good kid, m.A.A.d city", year: 2012, durationMs: 386906, popularity: 83 },
  { id: "t-kill-bill", name: "Kill Bill", artistId: "a-sza", album: "SOS", year: 2022, durationMs: 153946, popularity: 91 },
  { id: "t-snooze", name: "Snooze", artistId: "a-sza", album: "SOS", year: 2022, durationMs: 201800, popularity: 87 },
  { id: "t-do-i-wanna", name: "Do I Wanna Know?", artistId: "a-arctic", album: "AM", year: 2013, durationMs: 272394, popularity: 88 },
  { id: "t-505", name: "505", artistId: "a-arctic", album: "Favourite Worst Nightmare", year: 2007, durationMs: 253586, popularity: 84 },
  { id: "t-holocene", name: "Holocene", artistId: "a-bon-iver", album: "Bon Iver, Bon Iver", year: 2011, durationMs: 337146, popularity: 72 },
  { id: "t-skinny-love", name: "Skinny Love", artistId: "a-bon-iver", album: "For Emma, Forever Ago", year: 2007, durationMs: 238520, popularity: 70 },
  { id: "t-get-lucky", name: "Get Lucky", artistId: "a-daft-punk", album: "Random Access Memories", year: 2013, durationMs: 369626, popularity: 81 },
  { id: "t-instant-crush", name: "Instant Crush", artistId: "a-daft-punk", album: "Random Access Memories", year: 2013, durationMs: 337560, popularity: 79 },
  { id: "t-line-of-sight", name: "Line of Sight", artistId: "a-odesza", album: "A Moment Apart", year: 2017, durationMs: 235520, popularity: 66 },
  { id: "t-dreams", name: "Dreams", artistId: "a-fleetwood", album: "Rumours", year: 1977, durationMs: 257946, popularity: 82 },
  { id: "t-the-chain", name: "The Chain", artistId: "a-fleetwood", album: "Rumours", year: 1977, durationMs: 271000, popularity: 80 },
  { id: "t-heat-waves", name: "Heat Waves", artistId: "a-glass-animals", album: "Dreamland", year: 2020, durationMs: 238805, popularity: 90 },
]

function buildTrack(raw: RawTrack) {
  const artist = ARTIST_BY_ID.get(raw.artistId)!
  return {
    id: raw.id,
    name: raw.name,
    uri: `spotify:track:${raw.id}`,
    duration_ms: raw.durationMs,
    popularity: raw.popularity,
    explicit: false,
    external_urls: { spotify: searchUrl(`${raw.name} ${artist.name}`) },
    artists: [{ id: artist.id, name: artist.name, external_urls: { spotify: searchUrl(artist.name) } }],
    album: {
      id: `al-${raw.id}`,
      name: raw.album,
      release_date: `${raw.year}-01-01`,
      images: [{ url: img(`al-${raw.id}`) }, { url: img(`al-${raw.id}`, 160) }],
      external_urls: { spotify: searchUrl(raw.album) },
    },
  }
}

const TRACKS = RAW_TRACKS.map(buildTrack)
const TRACK_BY_ID = new Map(TRACKS.map((t) => [t.id, t]))

/* ----------------------------------------------------------------------- */
/* audio features (deterministic, so radar charts look varied but stable)   */
/* ----------------------------------------------------------------------- */

function audioFeaturesFor(id: string) {
  const r = (k: string) => rand(`${id}:${k}`)
  return {
    id,
    danceability: round(0.3 + 0.6 * r("dance")),
    energy: round(0.3 + 0.6 * r("energy")),
    speechiness: round(0.03 + 0.22 * r("speech")),
    acousticness: round(r("acoustic")),
    instrumentalness: round(0.6 * r("instr") * r("instr")),
    liveness: round(0.05 + 0.3 * r("live")),
    valence: round(0.2 + 0.7 * r("valence")),
    tempo: Math.round(80 + 80 * r("tempo")),
    key: hash(`${id}:key`) % 12,
    mode: hash(`${id}:mode`) % 2,
    time_signature: 4,
    duration_ms: TRACK_BY_ID.get(id)?.duration_ms ?? 210000,
  }
}

/* ----------------------------------------------------------------------- */
/* recently played                                                          */
/* ----------------------------------------------------------------------- */

// A fixed base time keeps timestamps stable and avoids Date.now() nondeterminism.
const RECENT_BASE = Date.parse("2026-01-15T21:30:00Z")

function buildRecentlyPlayed(limit: number) {
  const order = [
    "t-heat-waves", "t-kill-bill", "t-levitating", "t-do-i-wanna", "t-less-i-know",
    "t-snooze", "t-humble", "t-505", "t-get-lucky", "t-dreams",
    "t-money-trees", "t-instant-crush", "t-holocene", "t-line-of-sight", "t-dont-start",
    "t-the-chain", "t-let-it-happen", "t-skinny-love",
  ]
  const items = order.map((id, i) => ({
    track: TRACK_BY_ID.get(id)!,
    played_at: new Date(RECENT_BASE - i * 27 * 60 * 1000).toISOString(),
  }))
  return { items: items.slice(0, limit) }
}

/* ----------------------------------------------------------------------- */
/* playlists                                                                */
/* ----------------------------------------------------------------------- */

type RawPlaylist = {
  id: string
  name: string
  description: string
  isPublic: boolean
  trackIds: string[]
}

const RAW_PLAYLISTS: RawPlaylist[] = [
  { id: "p-late-night", name: "Late Night Drive", description: "Smooth synths for empty highways.", isPublic: false,
    trackIds: ["t-less-i-know", "t-instant-crush", "t-line-of-sight", "t-505", "t-holocene", "t-let-it-happen", "t-the-chain"] },
  { id: "p-focus-flow", name: "Focus Flow", description: "Low-distraction tracks for deep work.", isPublic: false,
    trackIds: ["t-holocene", "t-line-of-sight", "t-skinny-love", "t-let-it-happen", "t-instant-crush"] },
  { id: "p-weekend", name: "Weekend Warmup", description: "Turn it up before you go out.", isPublic: true,
    trackIds: ["t-levitating", "t-dont-start", "t-heat-waves", "t-get-lucky", "t-humble", "t-kill-bill"] },
  { id: "p-indie", name: "Indie Discoveries", description: "Guitars, hooks, and a little fuzz.", isPublic: true,
    trackIds: ["t-do-i-wanna", "t-505", "t-less-i-know", "t-heat-waves", "t-skinny-love"] },
  { id: "p-throwback", name: "Throwback Classics", description: "Songs that never left rotation.", isPublic: false,
    trackIds: ["t-dreams", "t-the-chain", "t-money-trees", "t-get-lucky"] },
  { id: "p-morning", name: "Morning Coffee", description: "Ease into the day.", isPublic: false,
    trackIds: ["t-snooze", "t-holocene", "t-instant-crush", "t-dreams", "t-skinny-love", "t-line-of-sight"] },
]

function buildPlaylistSummary(raw: RawPlaylist) {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    public: raw.isPublic,
    collaborative: false,
    owner: { id: DEMO_USER.id, display_name: DEMO_USER.display_name },
    images: [{ url: img(`pl-${raw.id}`, 300) }],
    tracks: { total: raw.trackIds.length },
    external_urls: { spotify: searchUrl(raw.name) },
    uri: `spotify:playlist:${raw.id}`,
  }
}

const PLAYLISTS = RAW_PLAYLISTS.map(buildPlaylistSummary)
const PLAYLIST_BY_ID = new Map(RAW_PLAYLISTS.map((p) => [p.id, p]))

function playlistTracksResponse(playlistId: string, offset: number, limit: number) {
  const raw = PLAYLIST_BY_ID.get(playlistId)
  const ids = raw ? raw.trackIds : []
  const slice = ids.slice(offset, offset + limit)
  const items = slice.map((id) => ({
    added_at: new Date(RECENT_BASE).toISOString(),
    track: TRACK_BY_ID.get(id)!,
  }))
  return {
    items,
    total: ids.length,
    limit,
    offset,
    next: offset + limit < ids.length ? `next` : null,
  }
}

/* ----------------------------------------------------------------------- */
/* top artists / tracks (rotate per time range so the tabs differ)         */
/* ----------------------------------------------------------------------- */

function rotate<T>(arr: T[], by: number): T[] {
  const n = arr.length
  const k = ((by % n) + n) % n
  return [...arr.slice(k), ...arr.slice(0, k)]
}

function rangeOffset(timeRange: string): number {
  if (timeRange === "short_term") return 0
  if (timeRange === "long_term") return 4
  return 2 // medium_term
}

/* ----------------------------------------------------------------------- */
/* recommendations                                                          */
/* ----------------------------------------------------------------------- */

function recommendationsResponse(limit: number) {
  // Bias toward tracks that feel like "discoveries" relative to the top list.
  const pool = rotate(TRACKS, 9)
  return { tracks: pool.slice(0, Math.min(limit, pool.length)) }
}

/* ----------------------------------------------------------------------- */
/* demo recommendation assistant                                            */
/* ----------------------------------------------------------------------- */
/* Stands in for the LLM route while in guest mode: picks tracks from the   */
/* sample catalog by matching the prompt to each track's audio features, so */
/* the assistant returns real, mood-aware results with no API key.          */

type Mood = { keys: string[]; label: string; target: Record<string, number> }

const MOODS: Mood[] = [
  { keys: ["chill", "relax", "calm", "study", "focus", "sleep", "late night", "wind down", "mellow", "coffee", "quiet"],
    label: "laid-back", target: { energy: 0.25, danceability: 0.45, valence: 0.45, acousticness: 0.6 } },
  { keys: ["upbeat", "party", "gym", "workout", "energy", "energetic", "hype", "dance", "pump", "run", "drive", "fast"],
    label: "high-energy", target: { energy: 0.9, danceability: 0.85, valence: 0.7 } },
  { keys: ["happy", "feel good", "feel-good", "sunny", "good mood", "joy", "bright", "summer"],
    label: "feel-good", target: { valence: 0.9, energy: 0.6, danceability: 0.65 } },
  { keys: ["sad", "moody", "melancholy", "rainy", "heartbreak", "cry", "emotional", "lonely", "blue"],
    label: "moody", target: { valence: 0.2, energy: 0.35, acousticness: 0.6 } },
  { keys: ["instrumental", "background", "no vocals", "concentrate", "deep work"],
    label: "instrumental-leaning", target: { instrumentalness: 0.5, speechiness: 0.05, energy: 0.4 } },
]

function detectMood(query: string): Mood | null {
  for (const mood of MOODS) {
    if (mood.keys.some((k) => query.includes(k))) return mood
  }
  return null
}

function featureDistance(features: Record<string, number>, target: Record<string, number>): number {
  const keys = Object.keys(target)
  let sum = 0
  for (const k of keys) sum += Math.abs((features[k] ?? 0) - target[k])
  return keys.length ? sum / keys.length : 0
}

export type DemoAssistantReply = { provider: string; message: string; trackIds: string[]; tracks: any[] }

export function getDemoAssistantReply(prompt: string, messages: { trackIds?: string[] }[] = []): DemoAssistantReply {
  const query = prompt.toLowerCase()
  const usedIds = new Set(messages.flatMap((m) => m.trackIds || []))

  // Artist request takes priority.
  const artist = ARTISTS.find((a) => query.includes(a.name.toLowerCase()))
  let pool = TRACKS
  let intro: string

  if (artist) {
    pool = TRACKS.filter((t) => t.artists[0].id === artist.id)
    intro = `Here's more from ${artist.name}`
  } else {
    const mood = detectMood(query)
    const wantsPopular = /popular|familiar|hits|classic|safe|known/.test(query)
    const wantsDiscovery = /new|discover|deep|underrated|different|surprise|obscure|hidden/.test(query)

    let scored = TRACKS.map((t) => {
      const f = audioFeaturesFor(t.id)
      let score = mood ? 1 - featureDistance(f, mood.target) : 0.5
      if (wantsPopular) score += (t.popularity / 100) * 0.5
      if (wantsDiscovery) score += (1 - t.popularity / 100) * 0.5
      // Small deterministic jitter keyed to the prompt so repeats vary.
      score += (rand(`${query}:${t.id}`) - 0.5) * 0.15
      return { t, score }
    })
    scored.sort((a, b) => b.score - a.score)
    pool = scored.map((s) => s.t)

    if (mood) intro = `For a ${mood.label} mood, try these`
    else if (wantsPopular) intro = "Here are some crowd-pleasers"
    else if (wantsDiscovery) intro = "Here are a few off the beaten path"
    else intro = "Here's a set that fits"
  }

  // Prefer tracks not already suggested; fall back to the pool if exhausted.
  const fresh = pool.filter((t) => !usedIds.has(t.id))
  const picks = (fresh.length >= 3 ? fresh : pool).slice(0, 3)

  if (picks.length === 0) {
    return { provider: "Demo assistant", message: "I couldn't find a match in the sample library — try a mood like chill, upbeat, happy, or a discovery pick.", trackIds: [], tracks: [] }
  }

  const list = picks.map((t) => `${t.name} by ${t.artists[0].name}`).join(", ")
  return {
    provider: "Demo assistant",
    message: `${intro}: ${list}. Tap any title to see its audio breakdown, or ask for another vibe.`,
    trackIds: [],
    tracks: picks,
  }
}

/* ----------------------------------------------------------------------- */
/* router                                                                   */
/* ----------------------------------------------------------------------- */

function paramInt(params: URLSearchParams, key: string, fallback: number): number {
  const raw = params.get(key)
  const n = raw ? Number(raw) : NaN
  return Number.isFinite(n) ? n : fallback
}

/**
 * Resolve a Spotify-relative endpoint (the part after `/api/spotify`) to demo
 * data. Mirrors the response shapes the real API returns for these routes.
 */
export function getDemoResponse(endpoint: string, options: RequestInit = {}): any {
  const method = (options.method || "GET").toUpperCase()
  const [path, query = ""] = endpoint.split("?")
  const params = new URLSearchParams(query)

  // Writes: pretend they succeed so "Save as Playlist" flows complete.
  if (method === "POST") {
    if (/\/users\/[^/]+\/playlists$/.test(path)) {
      return { id: `p-demo-${hash(path + query)}`, name: "Demo playlist", uri: "spotify:playlist:demo", external_urls: { spotify: "https://open.spotify.com" } }
    }
    if (/\/playlists\/[^/]+\/tracks$/.test(path)) {
      return { snapshot_id: "demo-snapshot" }
    }
    return { ok: true }
  }

  // /me/top/artists
  if (path === "/me/top/artists") {
    const limit = paramInt(params, "limit", 20)
    const time = params.get("time_range") || "medium_term"
    return { items: rotate(ARTISTS, rangeOffset(time)).slice(0, limit), total: ARTISTS.length, limit, offset: 0 }
  }

  // /me/top/tracks
  if (path === "/me/top/tracks") {
    const limit = paramInt(params, "limit", 20)
    const time = params.get("time_range") || "medium_term"
    return { items: rotate(TRACKS, rangeOffset(time)).slice(0, limit), total: TRACKS.length, limit, offset: 0 }
  }

  // /me/player/recently-played
  if (path === "/me/player/recently-played") {
    return buildRecentlyPlayed(paramInt(params, "limit", 20))
  }

  // /audio-features?ids=a,b,c
  if (path === "/audio-features") {
    const ids = (params.get("ids") || "").split(",").filter(Boolean)
    return { audio_features: ids.map((id) => audioFeaturesFor(id)) }
  }

  // /tracks/{id}
  if (path.startsWith("/tracks/")) {
    const id = path.split("/")[2]
    return TRACK_BY_ID.get(id) ?? TRACKS[0]
  }

  // /me/playlists
  if (path === "/me/playlists") {
    const limit = paramInt(params, "limit", 50)
    return { items: PLAYLISTS.slice(0, limit), total: PLAYLISTS.length, limit, offset: 0 }
  }

  // /recommendations
  if (path === "/recommendations") {
    return recommendationsResponse(paramInt(params, "limit", 20))
  }

  // /search
  if (path === "/search") {
    return { tracks: { items: rotate(TRACKS, 5).slice(0, paramInt(params, "limit", 20)) } }
  }

  // /playlists/{id}/tracks
  const tracksMatch = path.match(/^\/playlists\/([^/]+)\/tracks$/)
  if (tracksMatch) {
    return playlistTracksResponse(tracksMatch[1], paramInt(params, "offset", 0), paramInt(params, "limit", 100))
  }

  // /playlists/{id}  (optionally with ?fields=...)
  const playlistMatch = path.match(/^\/playlists\/([^/]+)$/)
  if (playlistMatch) {
    const summary = PLAYLISTS.find((p) => p.id === playlistMatch[1])
    if (summary) return summary
    // Unknown id: return a minimal but valid shape.
    return { id: playlistMatch[1], name: "Playlist", owner: { id: DEMO_USER.id, display_name: DEMO_USER.display_name }, images: [], tracks: { total: 0 }, external_urls: { spotify: "https://open.spotify.com" } }
  }

  // Fallback: empty-but-valid collection.
  return { items: [] }
}
