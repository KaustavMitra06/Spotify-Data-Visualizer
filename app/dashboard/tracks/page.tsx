"use client"

import { useEffect, useState } from "react"
import { useSpotify } from "@/components/spotify-provider"
import { getTopTracks } from "@/lib/spotify"
import { TrackCard } from "@/components/track-card"
import { TimeRangeSelector } from "@/components/time-range-selector"
import { TrackDetailModal } from "@/components/track-detail-modal"

export default function TracksPage() {
  const { token } = useSpotify()
  const [tracks, setTracks] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState("medium_term")
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    setLoading(true)
    getTopTracks(token, timeRange, 50)
      .then((data) => setTracks(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token, timeRange])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Top Tracks</h1>
          <p className="text-muted-foreground">Your most played songs</p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tracks.map((track, i) => (
            <TrackCard key={track.id} track={track} rank={i + 1} onClick={() => setSelectedTrack(track.id)} />
          ))}
        </div>
      )}

      <TrackDetailModal trackId={selectedTrack} onClose={() => setSelectedTrack(null)} />
    </div>
  )
}
