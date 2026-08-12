"use client"

import { useEffect, useRef, useState } from "react"
import { useSpotify } from "@/components/spotify-provider"
import { getPlaylists, getPlaylistTrackCount } from "@/lib/spotify"
import { Card } from "@/components/ui/card"
import { Music, Lock, Globe } from "lucide-react"
import Link from "next/link"

function readPlaylistTrackTotal(playlist: any) {
  const total = playlist?.tracks?.total
  const numeric = typeof total === "number" ? total : total != null ? Number(total) : null
  return Number.isFinite(numeric) ? numeric : undefined
}

export default function PlaylistsPage() {
  const { token, user } = useSpotify()
  const [playlists, setPlaylists] = useState<any[]>([])
  const [trackCounts, setTrackCounts] = useState<Record<string, number | null>>({})
  const [loading, setLoading] = useState(true)
  const countsInFlight = useRef(false)
  const [countStatus, setCountStatus] = useState<"idle" | "loading" | "rate-limited" | "done">("idle")
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(null)

  const loadCountsForPlaylists = async (playlistItems: any[]) => {
    if (!token || !user || playlistItems.length === 0 || countsInFlight.current) return
    const ownedPlaylistItems = playlistItems.filter((playlist) => playlist.owner?.id === user.id)
    const missingCounts = ownedPlaylistItems.filter((playlist) => {
      const fromPlaylist = readPlaylistTrackTotal(playlist)
      return trackCounts[playlist.id] === undefined && fromPlaylist === undefined
    })
    if (missingCounts.length === 0) {
      setCountStatus("done")
      return
    }

    countsInFlight.current = true
    setCountStatus("loading")
    setRetryAfterSeconds(null)

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    for (const playlist of missingCounts) {
      try {
        const total = await getPlaylistTrackCount(token, playlist.id)
        setTrackCounts((prev) => ({ ...prev, [playlist.id]: total }))
      } catch (err) {
        const status = (err as Error & { status?: number }).status
        if (status === 429) {
          const retryAfter = (err as Error & { retryAfter?: number }).retryAfter
          setRetryAfterSeconds(Number.isFinite(retryAfter) ? (retryAfter as number) : 60)
          setCountStatus("rate-limited")
          countsInFlight.current = false
          return
        }
        setTrackCounts((prev) => ({ ...prev, [playlist.id]: null }))
      }
      await sleep(500)
    }

    countsInFlight.current = false
    setCountStatus("done")
  }

  useEffect(() => {
    if (!token || !user) return

    getPlaylists(token, 50)
      .then(async (data) => {
        const items = data.items || []
        setPlaylists(items)
        setTrackCounts((prev) => ({
          ...prev,
          ...Object.fromEntries(
            items
              .map((playlist: any) => [playlist.id, readPlaylistTrackTotal(playlist)] as const)
              .filter(([, total]) => total !== undefined),
          ),
        }))
        await loadCountsForPlaylists(items)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token, user?.id])

  const loadCounts = async () => {
    await loadCountsForPlaylists(playlists)
  }

  const ownedPlaylists = user ? playlists.filter((playlist) => playlist.owner?.id === user.id) : []
  const hiddenCount = playlists.length - ownedPlaylists.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Your Playlists</h1>
        <p className="text-muted-foreground">Manage and explore your playlists. Click a playlist to view tracks.</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={loadCounts}
          disabled={countStatus === "loading"}
          className="px-3 py-1.5 rounded-md text-sm bg-secondary text-foreground hover:bg-secondary/80 disabled:opacity-50"
        >
          {countStatus === "loading" ? "Loading counts..." : "Load track counts"}
        </button>
        {countStatus === "rate-limited" && (
          <span className="text-sm text-muted-foreground">
            Rate limited. Try again in {retryAfterSeconds ?? 60}s.
          </span>
        )}
        {countStatus === "done" && <span className="text-sm text-muted-foreground">Counts loaded.</span>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      ) : (
        <>
          {hiddenCount > 0 && (
            <Card className="bg-card border-border p-4 text-sm text-muted-foreground">
              {hiddenCount} playlist{hiddenCount === 1 ? "" : "s"} hidden. Spotify now only allows listing tracks for
              playlists you own.
            </Card>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {ownedPlaylists.map((playlist) => (
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
                    <span className="text-sm text-muted-foreground">
                      {trackCounts[playlist.id] ?? readPlaylistTrackTotal(playlist) ?? "—"}{" "}
                      tracks
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
