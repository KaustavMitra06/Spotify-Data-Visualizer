"use client"

import { useEffect, useState } from "react"
import { useSpotify } from "@/components/spotify-provider"
import { getPlaylists } from "@/lib/spotify"
import { Card } from "@/components/ui/card"
import { Music, Lock, Globe } from "lucide-react"
import Link from "next/link"

export default function PlaylistsPage() {
  const { token } = useSpotify()
  const [playlists, setPlaylists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    getPlaylists(token, 50)
      .then((data) => setPlaylists(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Your Playlists</h1>
        <p className="text-muted-foreground">Manage and explore your playlists</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {playlists.map((playlist) => (
            <Link key={playlist.id} href={`/dashboard/playlists/${playlist.id}`}>
              <Card className="group bg-card border-border overflow-hidden cursor-pointer transition-all hover:bg-secondary/50 hover:scale-[1.02]">
                <div className="aspect-square relative">
                  {playlist.images?.[0]?.url ? (
                    <img
                      src={playlist.images[0].url || "/placeholder.svg"}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <Music className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-card-foreground truncate">{playlist.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {playlist.public ? (
                      <Globe className="w-3 h-3 text-muted-foreground" />
                    ) : (
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground">{playlist.tracks?.total || 0} tracks</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
