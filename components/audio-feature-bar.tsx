"use client"

interface AudioFeatureBarProps {
  label: string
  value: number
  color?: string
}

export function AudioFeatureBar({ label, value, color = "bg-primary" }: AudioFeatureBarProps) {
  const percentage = Math.round(value * 100)

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-foreground font-medium">{label}</span>
        <span className="text-muted-foreground">{percentage}%</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
