"use client"

import { Button } from "@/components/ui/button"
import { Music2, BarChart3, Clock, ListMusic, Sparkles } from "lucide-react"

export function LoginScreen() {
  const handleLogin = () => {
    const width = 520
    const height = 720
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2
    const popup = window.open(
      "/api/auth/login?popup=1",
      "spotify-login",
      `width=${width},height=${height},left=${left},top=${top}`,
    )

    if (!popup) {
      window.location.href = "/api/auth/login"
      return
    }

    popup.focus()
    const timer = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(timer)
        window.location.reload()
      }
    }, 500)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <Music2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-balance">Spotify Profile</h1>
          <p className="text-muted-foreground text-lg">Visualize your personalized Spotify data</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="bg-card p-4 rounded-xl border border-border">
            <BarChart3 className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-semibold">Top Artists</h3>
            <p className="text-sm text-muted-foreground">See who you listen to most</p>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border">
            <ListMusic className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-semibold">Top Tracks</h3>
            <p className="text-sm text-muted-foreground">Your favorite songs</p>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border">
            <Clock className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-semibold">Recent Plays</h3>
            <p className="text-sm text-muted-foreground">Track your history</p>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border">
            <Sparkles className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-semibold">Audio Analysis</h3>
            <p className="text-sm text-muted-foreground">Deep dive into tracks</p>
          </div>
        </div>

        <Button
          onClick={handleLogin}
          size="lg"
          className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Music2 className="w-5 h-5 mr-2" />
          Connect with Spotify
        </Button>

        <p className="text-xs text-muted-foreground">
          By connecting, you agree to share your Spotify data with this app
        </p>
      </div>
    </div>
  )
}
