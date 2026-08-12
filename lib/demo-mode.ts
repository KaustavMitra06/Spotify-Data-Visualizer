// Lightweight client-side flag that puts the app into a no-login "demo" state.
// When active, the data layer (lib/spotify.ts) serves local sample fixtures
// instead of calling the real Spotify API, so anyone can explore the full UI
// without connecting a Spotify account (and without hitting Spotify's
// 25-user development-mode cap or its deprecated endpoints).

const KEY = "sdv_demo_mode"

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false
  try {
    if (window.localStorage.getItem(KEY) === "1") return true
  } catch {
    // localStorage can throw in private-mode/sandboxed contexts.
  }
  return typeof document !== "undefined" && document.cookie.includes(`${KEY}=1`)
}

export function setDemoMode(on: boolean): void {
  if (typeof window === "undefined") return
  try {
    if (on) window.localStorage.setItem(KEY, "1")
    else window.localStorage.removeItem(KEY)
  } catch {
    // Ignore storage failures; the cookie below is the fallback.
  }
  const maxAge = on ? 60 * 60 * 24 * 30 : 0
  document.cookie = `${KEY}=${on ? "1" : ""}; path=/; max-age=${maxAge}; samesite=lax`
}
