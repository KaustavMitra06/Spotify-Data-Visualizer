"use client"

import { useEffect, useState } from "react"
import { useSpotify } from "@/components/spotify-provider"
import { getRecentlyPlayed } from "@/lib/spotify"
import { TrackRow } from "@/components/track-row"
import { TrackDetailModal } from "@/components/track-detail-modal"
import { Card } from "@/components/ui/card"

export default function RecentPage() {
  const { token } = useSpotify()
  const [tracks, setTracks] = useState<any[]>([])
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    getRecentlyPlayed(token, 50)
      .then((data) => setTracks(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Recently Played</h1>
        <p className="text-muted-foreground">Your listening history</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      ) : (
        <Card className="bg-card border-border">
          <div className="p-2">
            {tracks.map((item, i) => (
              <TrackRow
                key={`${item.track.id}-${item.played_at}`}
                track={item.track}
                index={i + 1}
                playedAt={item.played_at}
                onClick={() => setSelectedTrack(item.track.id)}
              />
            ))}
          </div>
        </Card>
      )}

      <TrackDetailModal trackId={selectedTrack} onClose={() => setSelectedTrack(null)} />
    </div>
  )
}
