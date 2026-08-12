import { NextResponse } from "next/server"
import {
  buildSpotifyAuthUrl,
  getSpotifyRedirectUrl,
  setAuthPopupCookie,
  setAuthStateCookie,
} from "@/lib/spotify-server"

export const runtime = "nodejs"

function createState() {
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const redirectUrl = getSpotifyRedirectUrl()
  const requestHost = request.headers.get("host")

  if (requestHost && requestHost !== redirectUrl.host) {
    return NextResponse.redirect(new URL(`${url.pathname}${url.search}`, redirectUrl.origin))
  }

  const state = createState()
  const authUrl = buildSpotifyAuthUrl(state)
  const response = NextResponse.redirect(authUrl)
  setAuthStateCookie(response, state)
  const popup = url.searchParams.get("popup")
  if (popup === "1") {
    setAuthPopupCookie(response, "1")
  } else {
    setAuthPopupCookie(response, "")
  }
  return response
}
