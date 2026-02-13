"use client"

import { SpotifyProvider, useSpotify } from "@/components/spotify-provider"
import { LoginScreen } from "@/components/login-screen"
import { redirect } from "next/navigation"
import { useEffect } from "react"

function HomeContent() {
  const { token, isLoading } = useSpotify()

  useEffect(() => {
    if (!isLoading && token) {
      redirect("/dashboard")
    }
  }, [token, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    )
  }

  return <LoginScreen />
}

export default function Home() {
  return (
    <SpotifyProvider>
      <HomeContent />
    </SpotifyProvider>
  )
}
