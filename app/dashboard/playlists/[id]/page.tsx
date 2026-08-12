"use client"

import { useEffect, useState, use } from "react"
import { useSpotify } from "@/components/spotify-provider"
import {
  getPlaylist,
  getPlaylistWithItems,
  getPlaylistTracksPage,
  getRecommendations,
  createPlaylist,
  addTracksToPlaylist,
} from "@/lib/spotify"
import { TrackRow } from "@/components/track-row"
import { TrackDetailModal } from "@/components/track-detail-modal"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, Plus, Check, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { token, user } = useSpotify()
  const [playlist, setPlaylist] = useState<any>(null)
  const [tracks, setTracks] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [showRecs, setShowRecs] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const spotifyPlaylistUrl = playlist?.external_urls?.spotify || `https://open.spotify.com/playlist/${id}`
  const spotifyEmbedUrl = `https://open.spotify.com/embed/playlist/${id}`

  const loadPlaylistTrackPages = async () => {
    const pageSize = 100
    const firstPage = await getPlaylistTracksPage(token!, id, 0, pageSize)
    const allItems = [...(firstPage.items || [])]
    const total = typeof firstPage.total === "number" ? firstPage.total : allItems.length

    for (let offset = pageSize; offset < total; offset += pageSize) {
      const page = await getPlaylistTracksPage(token!, id, offset, pageSize)
      allItems.push(...(page.items || []))
      if (!page.next) break
    }

    return allItems
  }

  useEffect(() => {
    if (!token) return

    setLoading(true)
    setError(null)
    getPlaylistWithItems(token, id)
      .then(async (playlistData) => {
        setPlaylist(playlistData)
        const pagedItems = await loadPlaylistTrackPages()
        setTracks(pagedItems)

        const total = typeof playlistData?.tracks?.total === "number" ? playlistData.tracks.total : pagedItems.length
        if (pagedItems.length === 0 && total > 0) {
          setError("Spotify says this playlist has tracks, but did not return the track list for this app.")
        }
      })
      .catch(async (err) => {
        const status = (err as Error & { status?: number }).status
        if (status === 403) {
          try {
            const playlistData = await getPlaylistWithItems(token, id)
            setPlaylist(playlistData)
          } catch {}
          setError("Spotify blocked this app from reading the playlist track list. You can still inspect it in Spotify below.")
          return
        }
        try {
          const pagedItems = await loadPlaylistTrackPages()
          setTracks(pagedItems)
        } catch (inner) {
          const innerStatus = (inner as Error & { status?: number }).status
          if (innerStatus === 403) {
            setError("Spotify blocked this app from reading the playlist track list. You can still inspect it in Spotify below.")
            return
          }
          console.error(inner)
          setError("Could not load playlist tracks.")
          return
        }
        if (!playlist) {
          try {
            const playlistData = await getPlaylist(token, id, "name,tracks.total")
            setPlaylist(playlistData)
          } catch {}
        }
      })
      .finally(() => setLoading(false))
  }, [token, id])

  const handleGetRecommendations = async () => {
    if (!token || tracks.length === 0) return

    setLoadingRecs(true)
    setShowRecs(true)

    const seedTracks = tracks
      .slice(0, 5)
      .map((item) => item.track?.id)
      .filter(Boolean)

    try {
      const data = await getRecommendations(token, seedTracks, [], 20)
      setRecommendations(data.tracks || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingRecs(false)
    }
  }

  const handleSavePlaylist = async () => {
    if (!token || !user || recommendations.length === 0) return

    setSaving(true)
    try {
      const playlist = await createPlaylist(token, user.id, "Recommended Tracks", "Generated based on your playlist")
      const uris = recommendations.map((track) => track.uri)
      await addTracksToPlaylist(token, playlist.id, uris)
      setSaved(true)
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/playlists">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{playlist?.name || "Playlist Tracks"}</h1>
          <p className="text-muted-foreground">
            {typeof playlist?.tracks?.total === "number" ? playlist.tracks.total : tracks.length} tracks
          </p>
        </div>
        <Button
          onClick={handleGetRecommendations}
          disabled={loading || tracks.length === 0}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Get Recommendations
        </Button>
        <Button
          variant="outline"
          className="bg-transparent"
          onClick={() => window.open(spotifyPlaylistUrl, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in Spotify
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-card-foreground">Playlist Tracks</h2>
            </div>
            <div className="p-2 max-h-[600px] overflow-y-auto">
              {error ? (
                <div className="space-y-4 p-4">
                  <div className="text-sm text-muted-foreground">{error}</div>
                  <iframe
                    title={`${playlist?.name || "Spotify playlist"} embed`}
                    src={spotifyEmbedUrl}
                    width="100%"
                    height="380"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-md border-0"
                  />
                </div>
              ) : tracks.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No tracks found in this playlist.</div>
              ) : (
                tracks.map((item, i) =>
                  item.track ? (
                    <TrackRow
                      key={`${item.track.id}-${i}`}
                      track={item.track}
                      index={i + 1}
                      onClick={() => setSelectedTrack(item.track.id)}
                    />
                  ) : (
                    <div
                      key={`unavailable-${i}`}
                      className="flex items-center gap-4 p-3 rounded-lg text-sm text-muted-foreground"
                    >
                      <div className="w-8 text-center">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground">Unavailable track</div>
                        <div className="text-xs text-muted-foreground">
                          This item may be a local file or no longer available on Spotify.
                        </div>
                      </div>
                    </div>
                  ),
                )
              )}
            </div>
          </Card>

          {showRecs && (
            <Card className="bg-card border-border">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-card-foreground">Recommended Tracks</h2>
                {recommendations.length > 0 && (
                  <Button
                    size="sm"
                    onClick={handleSavePlaylist}
                    disabled={saving || saved}
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
                )}
              </div>
              <div className="p-2 max-h-[600px] overflow-y-auto">
                {loadingRecs ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                  </div>
                ) : (
                  recommendations.map((track, i) => (
                    <TrackRow key={track.id} track={track} index={i + 1} onClick={() => setSelectedTrack(track.id)} />
                  ))
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      <TrackDetailModal trackId={selectedTrack} onClose={() => setSelectedTrack(null)} />
    </div>
  )
}
