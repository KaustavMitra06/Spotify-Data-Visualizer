"use client"

import { useEffect, useState } from "react"
import { useSpotify } from "@/components/spotify-provider"
import { getTopTracks, getTopArtists, getRecommendations, createPlaylist, addTracksToPlaylist } from "@/lib/spotify"
import { TrackCard } from "@/components/track-card"
import { TrackDetailModal } from "@/components/track-detail-modal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RefreshCw, Plus, Check, Sparkles } from "lucide-react"

export default function RecommendationsPage() {
  const { token, user } = useSpotify()
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [seedInfo, setSeedInfo] = useState<{ artists: string[]; tracks: string[] }>({ artists: [], tracks: [] })

  const fetchRecommendations = async () => {
    if (!token) return

    setLoading(true)
    setSaved(false)

    try {
      const [topTracks, topArtists] = await Promise.all([
        getTopTracks(token, "short_term", 5),
        getTopArtists(token, "short_term", 5),
      ])

      const seedTracks = (topTracks.items || []).slice(0, 3).map((t: any) => t.id)
      const seedArtists = (topArtists.items || []).slice(0, 2).map((a: any) => a.id)

      setSeedInfo({
        artists: (topArtists.items || []).slice(0, 2).map((a: any) => a.name),
        tracks: (topTracks.items || []).slice(0, 3).map((t: any) => t.name),
      })

      const data = await getRecommendations(token, seedTracks, seedArtists, 20)
      setRecommendations(data.tracks || [])
    } catch (error) {
      console.error(error)
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

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
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
