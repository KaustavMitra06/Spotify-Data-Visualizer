import { NextResponse } from "next/server"

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI

const SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-top-read",
  "user-read-recently-played",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
].join(" ")

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
}

const ACCESS_TOKEN_COOKIE = "spotify_access_token"
const REFRESH_TOKEN_COOKIE = "spotify_refresh_token"
const EXPIRES_AT_COOKIE = "spotify_token_expires_at"
export const AUTH_STATE_COOKIE = "spotify_auth_state"
export const AUTH_POPUP_COOKIE = "spotify_auth_popup"

type TokenRefresh = {
  accessToken: string
  refreshToken?: string
  expiresIn: number
}

function assertSpotifyEnv() {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REDIRECT_URI) {
    throw new Error("Missing Spotify environment variables")
  }
}

function basicAuthHeader() {
  assertSpotifyEnv()
  const credentials = `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  return `Basic ${Buffer.from(credentials).toString("base64")}`
}

export function buildSpotifyAuthUrl(state: string) {
  assertSpotifyEnv()
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID!,
    response_type: "code",
    redirect_uri: SPOTIFY_REDIRECT_URI!,
    scope: SCOPES,
    state,
    show_dialog: "true",
  })
  return `https://accounts.spotify.com/authorize?${params.toString()}`
}

export async function exchangeCodeForTokens(code: string) {
  assertSpotifyEnv()
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: SPOTIFY_REDIRECT_URI!,
  })

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  })

  if (!res.ok) {
    throw new Error(`Spotify token exchange failed: ${res.status}`)
  }

  const data = (await res.json()) as {
    access_token: string
    refresh_token?: string
    expires_in: number
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  } satisfies TokenRefresh
}

export async function refreshAccessToken(refreshToken: string) {
  assertSpotifyEnv()
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  })

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  })

  if (!res.ok) {
    throw new Error(`Spotify token refresh failed: ${res.status}`)
  }

  const data = (await res.json()) as {
    access_token: string
    refresh_token?: string
    expires_in: number
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  } satisfies TokenRefresh
}

export function setAuthCookies(response: NextResponse, tokens: TokenRefresh) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: tokens.expiresIn,
  })
  response.cookies.set(EXPIRES_AT_COOKIE, (Date.now() + tokens.expiresIn * 1000).toString(), {
    ...COOKIE_OPTIONS,
    maxAge: tokens.expiresIn,
  })
  if (tokens.refreshToken) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 30,
    })
  }
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 })
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 })
  response.cookies.set(EXPIRES_AT_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 })
  response.cookies.set(AUTH_STATE_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 })
  response.cookies.set(AUTH_POPUP_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 })
}

export function setAuthStateCookie(response: NextResponse, state: string) {
  response.cookies.set(AUTH_STATE_COOKIE, state, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 10,
  })
}

export function setAuthPopupCookie(response: NextResponse, value: string) {
  response.cookies.set(AUTH_POPUP_COOKIE, value, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 10,
  })
}

export function readTokenCookies(request: Request) {
  const cookies = request.headers.get("cookie") ?? ""
  if (!cookies.trim()) {
    return { accessToken: undefined, refreshToken: undefined, expiresAt: undefined, state: undefined }
  }

  const parsed: Record<string, string> = {}
  for (const pair of cookies.split(";")) {
    if (!pair.trim()) continue
    const [rawKey, ...rawValue] = pair.trim().split("=")
    if (!rawKey) continue
    parsed[rawKey] = decodeURIComponent(rawValue.join("="))
  }

  const expiresAt = parsed[EXPIRES_AT_COOKIE] ? Number(parsed[EXPIRES_AT_COOKIE]) : undefined

  return {
    accessToken: parsed[ACCESS_TOKEN_COOKIE],
    refreshToken: parsed[REFRESH_TOKEN_COOKIE],
    expiresAt,
    state: parsed[AUTH_STATE_COOKIE],
    popup: parsed[AUTH_POPUP_COOKIE],
  }
}

export async function getValidAccessToken(request: Request) {
  const tokens = readTokenCookies(request)
  const isExpired = !tokens.expiresAt || Date.now() > tokens.expiresAt - 60_000

  if (tokens.accessToken && !isExpired) {
    return { accessToken: tokens.accessToken, refreshed: null as TokenRefresh | null }
  }

  if (!tokens.refreshToken) {
    return { accessToken: null, refreshed: null as TokenRefresh | null }
  }

  const refreshed = await refreshAccessToken(tokens.refreshToken)
  return { accessToken: refreshed.accessToken, refreshed }
}
