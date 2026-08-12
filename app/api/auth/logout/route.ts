import { NextResponse } from "next/server"
import { clearAuthCookies } from "@/lib/spotify-server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true })
  clearAuthCookies(response)
  return response
}

export async function GET(request: Request) {
  const response = new NextResponse(
    [
      "<!doctype html>",
      "<html>",
      "<head>",
      '<meta charset="utf-8" />',
      '<meta http-equiv="refresh" content="0; url=/" />',
      "<title>Logged out</title>",
      "</head>",
      "<body>",
      '<p>Logged out. If you are not redirected, <a href="/">click here</a>.</p>',
      "</body>",
      "</html>",
    ].join(""),
    {
      headers: { "content-type": "text/html; charset=utf-8" },
    },
  )
  clearAuthCookies(response)
  return response
}
