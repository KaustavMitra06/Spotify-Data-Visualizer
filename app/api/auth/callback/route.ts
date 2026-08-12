import { NextResponse } from "next/server"
import {
  AUTH_STATE_COOKIE,
  AUTH_POPUP_COOKIE,
  exchangeCodeForTokens,
  clearAuthCookies,
  readTokenCookies,
  setAuthCookies,
} from "@/lib/spotify-server"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const redirectBase = process.env.SPOTIFY_REDIRECT_URI
    ? new URL(process.env.SPOTIFY_REDIRECT_URI)
    : url

  const { state: storedState, popup } = readTokenCookies(request)

  if (!code || !state || !storedState || state !== storedState) {
    const response = NextResponse.redirect(new URL("/?error=auth", redirectBase))
    clearAuthCookies(response)
    return response
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    const destination = popup === "1" ? "/callback?popup=1" : "/dashboard"
    const response = NextResponse.redirect(new URL(destination, redirectBase))
    setAuthCookies(response, tokens)
    response.cookies.set(AUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 })
    response.cookies.set(AUTH_POPUP_COOKIE, "", { path: "/", maxAge: 0 })
    return response
  } catch {
    const response = NextResponse.redirect(new URL("/?error=token", redirectBase))
    clearAuthCookies(response)
    return response
  }
}
