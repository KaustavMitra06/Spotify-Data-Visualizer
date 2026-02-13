import { NextResponse } from "next/server"
import { clearAuthCookies, getValidAccessToken, setAuthCookies } from "@/lib/spotify-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { accessToken, refreshed } = await getValidAccessToken(request)

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const res = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const body = await res.text()
    const response = new NextResponse(body, {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
    })

    if (res.status === 401) {
      clearAuthCookies(response)
      return response
    }

    if (refreshed) {
      setAuthCookies(response, refreshed)
    }

    return response
  } catch {
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    clearAuthCookies(response)
    return response
  }
}
