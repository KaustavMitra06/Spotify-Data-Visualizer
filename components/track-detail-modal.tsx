"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AudioFeaturesChart } from "./audio-features-chart"
import { AudioFeatureBar } from "./audio-feature-bar"
import { useSpotify } from "./spotify-provider"
import { getAudioFeatures, getTrack } from "@/lib/spotify"
import { ExternalLink, Music, Clock } from "lucide-react"

interface TrackDetailModalProps {
  trackId: string | null
  onClose: () => void
}

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function getKeyName(key: number) {
  const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  return keys[key] || "Unknown"
}

export function TrackDetailModal({ trackId, onClose }: TrackDetailModalProps) {
  const { token } = useSpotify()
  const [track, setTrack] = useState<any>(null)
  const [features, setFeatures] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [featuresUnavailable, setFeaturesUnavailable] = useState(false)

  useEffect(() => {
    if (!trackId || !token) return

    setLoading(true)
    setTrack(null)
    setFeatures(null)
    setFeaturesUnavailable(false)

    getTrack(token, trackId)
      .then(async (trackData) => {
        setTrack(trackData)
        try {
          const featuresData = await getAudioFeatures(token, [trackId])
          setFeatures(featuresData.audio_features?.[0] ?? null)
        } catch (error) {
          console.warn("Audio features unavailable for this track.", error)
          setFeaturesUnavailable(true)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [trackId, token])

  if (!trackId) return null

  return (
    <Dialog open={!!trackId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl bg-card border-border text-card-foreground max-h-[90vh] overflow-y-auto">
        {!track && !features && <DialogTitle className="sr-only">Track details</DialogTitle>}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
          </div>
        ) : track ? (
          <>
            <DialogHeader>
              <div className="flex gap-6">
                <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                  {track.album?.images?.[0]?.url ? (
                    <img
                      src={track.album.images[0].url || "/placeholder.svg"}
                      alt={track.album.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <Music className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-2xl font-bold truncate text-foreground">{track.name}</DialogTitle>
                  <p className="text-lg text-muted-foreground mt-1">
                    {track.artists?.map((a: any) => a.name).join(", ")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {track.album?.name} • {new Date(track.album?.release_date).getFullYear()}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatDuration(track.duration_ms)}
                    </div>
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => window.open(track.external_urls?.spotify, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in Spotify
                    </Button>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {features ? (
              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4 text-foreground">Audio Features</h3>
                  <AudioFeaturesChart features={features} />
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Track Analysis</h3>
                  <AudioFeatureBar label="Danceability" value={features.danceability} />
                  <AudioFeatureBar label="Energy" value={features.energy} color="bg-chart-3" />
                  <AudioFeatureBar label="Valence (Happiness)" value={features.valence} color="bg-chart-4" />
                  <AudioFeatureBar label="Acousticness" value={features.acousticness} color="bg-chart-2" />
                  <AudioFeatureBar label="Instrumentalness" value={features.instrumentalness} color="bg-chart-5" />

                  <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{Math.round(features.tempo)}</p>
                      <p className="text-xs text-muted-foreground">BPM</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{getKeyName(features.key)}</p>
                      <p className="text-xs text-muted-foreground">{features.mode === 1 ? "Major" : "Minor"}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{features.time_signature}/4</p>
                      <p className="text-xs text-muted-foreground">Time Sig</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : featuresUnavailable ? (
              <div className="mt-6 rounded-md border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
                Spotify did not allow audio analysis for this track, but the song link and metadata are still available.
              </div>
            ) : null}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
