"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Play, Clock } from "lucide-react"

interface TrackCardProps {
  track: {
    id: string
    name: string
    album: {
      images: { url: string }[]
      name: string
    }
    artists: { name: string; id: string }[]
    duration_ms: number
    popularity: number
    preview_url?: string
    external_urls: { spotify: string }
  }
  rank?: number
  showDuration?: boolean
  onClick?: () => void
}

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function TrackCard({ track, rank, showDuration = true, onClick }: TrackCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden bg-card border-border cursor-pointer transition-all hover:bg-secondary/50",
        onClick && "hover:scale-[1.02]",
      )}
      onClick={onClick}
    >
      <div className="aspect-square relative">
        {track.album?.images?.[0]?.url ? (
          <img
            src={track.album.images[0].url || "/placeholder.svg"}
            alt={track.album.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-4xl text-muted-foreground">{track.name.charAt(0)}</span>
          </div>
        )}
        {rank && (
          <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <span className="text-sm font-bold text-foreground">#{rank}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <Play className="w-5 h-5 text-primary-foreground fill-primary-foreground ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-card-foreground truncate">{track.name}</h3>
        <p className="text-sm text-muted-foreground truncate">{track.artists?.map((a) => a.name).join(", ")}</p>
        {showDuration && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatDuration(track.duration_ms)}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
