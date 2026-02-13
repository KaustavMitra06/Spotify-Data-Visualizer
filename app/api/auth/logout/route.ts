import { NextResponse } from "next/server"
import { clearAuthCookies } from "@/lib/spotify-server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true })
  clearAuthCookies(response)
  return response
}

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url))
  clearAuthCookies(response)
  return response
}
