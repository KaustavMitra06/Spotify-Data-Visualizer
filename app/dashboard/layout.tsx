"use client"

import { SpotifyProvider, useSpotify } from "@/components/spotify-provider"
import { DashboardNav } from "@/components/dashboard-nav"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const { token, isLoading } = useSpotify()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/")
    }
  }, [token, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    )
  }

  if (!token) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="ml-64 p-8">{children}</main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SpotifyProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SpotifyProvider>
  )
}
