"use client"

import { useEffect, useState } from "react"
import { FlaskConical } from "lucide-react"
import { isDemoMode, setDemoMode } from "@/lib/demo-mode"

export function DemoBanner() {
  const [demo, setDemo] = useState(false)

  useEffect(() => {
    setDemo(isDemoMode())
  }, [])

  if (!demo) return null

  const handleConnect = () => {
    setDemoMode(false)
    window.location.href = "/api/auth/login"
  }

  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-foreground">
        <FlaskConical className="w-4 h-4 text-primary flex-shrink-0" />
        <span>
          <span className="font-semibold">Guest preview</span> — this is a sample profile so you can explore every
          screen. Real Spotify login shows your own data (approved accounts).
        </span>
      </div>
      <button
        type="button"
        onClick={handleConnect}
        className="text-sm font-medium text-primary hover:underline sm:ml-auto text-left whitespace-nowrap"
      >
        Log in with Spotify →
      </button>
    </div>
  )
}
