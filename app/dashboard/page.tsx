"use client"

import { useEffect, useState } from "react"
import { useSpotify } from "@/components/spotify-provider"
import { getTopArtists, getTopTracks, getRecentlyPlayed } from "@/lib/spotify"
import { ArtistCard } from "@/components/artist-card"
import { TrackCard } from "@/components/track-card"
import { TrackDetailModal } from "@/components/track-detail-modal"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Users, Music, Clock, ListMusic } from "lucide-react"

export default function DashboardPage() {
  const { token, user } = useSpotify()
  const [topArtists, setTopArtists] = useState<any[]>([])
  const [topTracks, setTopTracks] = useState<any[]>([])
  const [recentTracks, setRecentTracks] = useState<any[]>([])
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    Promise.all([
      getTopArtists(token, "short_term", 4),
      getTopTracks(token, "short_term", 4),
      getRecentlyPlayed(token, 8),
    ])
      .then(([artists, tracks, recent]) => {
        setTopArtists(artists.items || [])
        setTopTracks(tracks.items || [])
        setRecentTracks(recent.items || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.display_name?.split(" ")[0]}</h1>
        <p className="text-muted-foreground mt-1">{"Here's your Spotify profile at a glance"}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border p-4">
          <Users className="w-8 h-8 text-primary mb-2" />
          <p className="text-2xl font-bold text-card-foreground">{user?.followers?.total || 0}</p>
          <p className="text-sm text-muted-foreground">Followers</p>
        </Card>
        <Card className="bg-card border-border p-4">
          <Music className="w-8 h-8 text-chart-2 mb-2" />
          <p className="text-2xl font-bold text-card-foreground">{topTracks.length > 0 ? "Active" : "N/A"}</p>
          <p className="text-sm text-muted-foreground">Listening</p>
        </Card>
        <Card className="bg-card border-border p-4">
          <ListMusic className="w-8 h-8 text-chart-3 mb-2" />
          <p className="text-2xl font-bold text-card-foreground capitalize">{user?.product || "Free"}</p>
          <p className="text-sm text-muted-foreground">Account</p>
        </Card>
        <Card className="bg-card border-border p-4">
          <Clock className="w-8 h-8 text-chart-4 mb-2" />
          <p className="text-2xl font-bold text-card-foreground">{recentTracks.length}</p>
          <p className="text-sm text-muted-foreground">Recent Plays</p>
        </Card>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Top Artists This Month</h2>
          <Link href="/dashboard/artists" className="text-primary flex items-center gap-1 text-sm hover:underline">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topArtists.map((artist, i) => (
            <ArtistCard key={artist.id} artist={artist} rank={i + 1} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Top Tracks This Month</h2>
          <Link href="/dashboard/tracks" className="text-primary flex items-center gap-1 text-sm hover:underline">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topTracks.map((track, i) => (
            <TrackCard key={track.id} track={track} rank={i + 1} onClick={() => setSelectedTrack(track.id)} />
          ))}
        </div>
      </section>

      <TrackDetailModal trackId={selectedTrack} onClose={() => setSelectedTrack(null)} />
    </div>
  )
}
