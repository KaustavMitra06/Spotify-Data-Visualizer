"use client"

import type { MouseEvent } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ExternalLink, Play, Clock } from "lucide-react"

interface TrackRowProps {
  track: {
    id: string
    name: string
    album: {
      images: { url: string }[]
      name: string
    }
    artists: { name: string; id: string }[]
    duration_ms: number
    preview_url?: string
    external_urls?: { spotify?: string }
  }
  index: number
  playedAt?: string
  onClick?: () => void
}

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function formatPlayedAt(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function TrackRow({ track, index, playedAt, onClick }: TrackRowProps) {
  const openSpotify = (event: MouseEvent) => {
    event.stopPropagation()
    if (track.external_urls?.spotify) {
      window.open(track.external_urls.spotify, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-4 p-3 rounded-lg transition-colors cursor-pointer hover:bg-secondary/50",
      )}
      onClick={onClick}
    >
      <div className="w-8 text-center">
        <span className="text-muted-foreground group-hover:hidden">{index}</span>
        <Play className="w-4 h-4 text-foreground hidden group-hover:block mx-auto fill-foreground" />
      </div>

      <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
        {track.album?.images?.[0]?.url ? (
          <img
            src={track.album.images[0].url || "/placeholder.svg"}
            alt={track.album.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-lg text-muted-foreground">{track.name.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">{track.name}</h4>
        <p className="text-sm text-muted-foreground truncate">{track.artists?.map((a) => a.name).join(", ")}</p>
      </div>

      <div className="hidden md:block flex-1 min-w-0">
        <p className="text-sm text-muted-foreground truncate">{track.album?.name}</p>
      </div>

      {playedAt ? (
        <div className="text-sm text-muted-foreground w-20 text-right">{formatPlayedAt(playedAt)}</div>
      ) : (
        <div className="flex items-center gap-1 text-sm text-muted-foreground w-16 justify-end">
          <Clock className="w-3 h-3" />
          {formatDuration(track.duration_ms)}
        </div>
      )}

      <div className="flex items-center gap-2">
        {track.preview_url && (
          <audio
            controls
            preload="none"
            className="hidden lg:block w-32 h-8"
            onClick={(event) => event.stopPropagation()}
            src={track.preview_url}
          />
        )}
        {track.external_urls?.spotify && (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={openSpotify}
            aria-label={`Open ${track.name} in Spotify`}
            title="Open in Spotify"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
