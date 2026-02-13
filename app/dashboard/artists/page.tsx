"use client"

import { useEffect, useState } from "react"
import { useSpotify } from "@/components/spotify-provider"
import { getTopArtists } from "@/lib/spotify"
import { ArtistCard } from "@/components/artist-card"
import { TimeRangeSelector } from "@/components/time-range-selector"

export default function ArtistsPage() {
  const { token } = useSpotify()
  const [artists, setArtists] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState("medium_term")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    setLoading(true)
    getTopArtists(token, timeRange, 50)
      .then((data) => setArtists(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token, timeRange])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Top Artists</h1>
          <p className="text-muted-foreground">Your most listened to artists</p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {artists.map((artist, i) => (
            <ArtistCard key={artist.id} artist={artist} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
