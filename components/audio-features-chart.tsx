"use client"

import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts"

interface AudioFeaturesChartProps {
  features: {
    danceability: number
    energy: number
    speechiness: number
    acousticness: number
    instrumentalness: number
    liveness: number
    valence: number
  }
}

export function AudioFeaturesChart({ features }: AudioFeaturesChartProps) {
  const data = [
    { feature: "Danceability", value: features.danceability * 100 },
    { feature: "Energy", value: features.energy * 100 },
    { feature: "Speechiness", value: features.speechiness * 100 },
    { feature: "Acousticness", value: features.acousticness * 100 },
    { feature: "Instrumentalness", value: features.instrumentalness * 100 },
    { feature: "Liveness", value: features.liveness * 100 },
    { feature: "Valence", value: features.valence * 100 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="feature" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
        <Radar
          name="Audio Features"
          dataKey="value"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
