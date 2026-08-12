import { NextResponse } from "next/server"
import { clearAuthCookies, getValidAccessToken, setAuthCookies } from "@/lib/spotify-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function proxy(request: Request, pathSegments: string[]) {
  const { accessToken, refreshed } = await getValidAccessToken(request)

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const upstreamUrl = `https://api.spotify.com/v1/${pathSegments.join("/")}${url.search}`
  const method = request.method.toUpperCase()
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  }

  const contentType = request.headers.get("content-type")
  if (contentType) {
    headers["Content-Type"] = contentType
  }

  const init: RequestInit = { method, headers }
  if (method !== "GET" && method !== "HEAD") {
    init.body = await request.text()
  }

  const res = await fetch(upstreamUrl, init)
  const body = await res.text()
  if (!res.ok) {
    console.error(
      "[spotify-proxy]",
      res.status,
      upstreamUrl,
      body.length > 500 ? `${body.slice(0, 500)}...` : body,
    )
  }
  const response = new NextResponse(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  })

  if (res.status === 401) {
    clearAuthCookies(response)
    return response
  }

  if (refreshed) {
    setAuthCookies(response, refreshed)
  }

  return response
}

async function readPathParams(context: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  const params = "then" in context.params ? await context.params : context.params
  return params.path
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  return proxy(request, await readPathParams(context))
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  return proxy(request, await readPathParams(context))
}

export async function PUT(request: Request, context: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  return proxy(request, await readPathParams(context))
}

export async function DELETE(request: Request, context: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  return proxy(request, await readPathParams(context))
}
