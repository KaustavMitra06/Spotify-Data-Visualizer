"use client"

import { useEffect } from "react"

export default function CallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const isPopup = params.get("popup") === "1"
    if (isPopup) {
      if (window.opener && !window.opener.closed) {
        window.opener.location.replace("/dashboard")
      }
      window.close()
      return
    }
    window.location.replace("/dashboard")
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Connecting to Spotify...</p>
      </div>
    </div>
  )
}
