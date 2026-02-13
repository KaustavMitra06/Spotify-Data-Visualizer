"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { getCurrentUser } from "@/lib/spotify"

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
    fetchUser().finally(() => setIsLoading(false))
  }, [fetchUser])

  const login = useCallback(() => {
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
        fetchUser().finally(() => setIsLoading(false))
      }
    }, 500)
  }, [fetchUser])

  const logout = useCallback(() => {
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
