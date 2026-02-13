"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ArtistCardProps {
  artist: {
    id: string
    name: string
    images: { url: string }[]
    genres: string[]
    popularity: number
    followers: { total: number }
  }
  rank?: number
  onClick?: () => void
}

export function ArtistCard({ artist, rank, onClick }: ArtistCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden bg-card border-border cursor-pointer transition-all hover:bg-secondary/50",
        onClick && "hover:scale-[1.02]",
      )}
      onClick={onClick}
    >
      <div className="aspect-square relative">
        {artist.images?.[0]?.url ? (
          <img
            src={artist.images[0].url || "/placeholder.svg"}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-4xl text-muted-foreground">{artist.name.charAt(0)}</span>
          </div>
        )}
        {rank && (
          <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <span className="text-sm font-bold text-foreground">#{rank}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-card-foreground truncate">{artist.name}</h3>
        <p className="text-sm text-muted-foreground truncate">{artist.genres?.slice(0, 2).join(", ") || "Artist"}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1 flex-1 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${artist.popularity}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{artist.popularity}%</span>
        </div>
      </div>
    </Card>
  )
}
