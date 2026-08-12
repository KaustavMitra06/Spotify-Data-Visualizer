"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { getCurrentUser } from "@/lib/spotify"
import { isDemoMode, setDemoMode } from "@/lib/demo-mode"

interface SpotifyUser {
  id: string
  display_name: string
  email: string
  images: { url: string }[]
  followers: { total: number }
  country: string
  product: string
}

interface SpotifyContextType {
  token: string | null
  user: SpotifyUser | null
  isLoading: boolean
  login: () => void
  logout: () => void
}

const SpotifyContext = createContext<SpotifyContextType | null>(null)

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<SpotifyUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser()
      setUser(userData)
      setToken("session")
    } catch {
      setToken(null)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    // A `?demo=1` link (e.g. from a resume) drops straight into demo mode.
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("demo") === "1") {
        setDemoMode(true)
      }
    }
    fetchUser().finally(() => setIsLoading(false))
  }, [fetchUser])

  const login = useCallback(() => {
    // Leaving the demo to connect a real account.
    setDemoMode(false)
    window.location.href = "/api/auth/login"
  }, [])

  const logout = useCallback(() => {
    if (isDemoMode()) {
      setDemoMode(false)
      setToken(null)
      setUser(null)
      window.location.href = "/"
      return
    }
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    setToken(null)
    setUser(null)
  }, [])

  return <SpotifyContext.Provider value={{ token, user, isLoading, login, logout }}>{children}</SpotifyContext.Provider>
}

export function useSpotify() {
  const context = useContext(SpotifyContext)
  if (!context) {
    throw new Error("useSpotify must be used within a SpotifyProvider")
  }
  return context
}
