"use client"

import { Button } from "@/components/ui/button"
import { setDemoMode } from "@/lib/demo-mode"
import {
  Music2,
  Users,
  Music,
  Clock,
  ListMusic,
  Sparkles,
  BarChart3,
  ArrowRight,
  Github,
  ShieldCheck,
  Play,
} from "lucide-react"

const REPO_URL = "https://github.com/KaustavMitra06/Spotify-Data-Visualizer"

const features = [
  { icon: Users, color: "text-primary", title: "Top Artists", body: "Your most-played artists across the last month, six months, or all time." },
  { icon: Music, color: "text-chart-2", title: "Top Tracks", body: "Ranked favorites with album art, each opening a full audio breakdown." },
  { icon: Clock, color: "text-chart-3", title: "Recently Played", body: "A live feed of your listening history, pulled straight from Spotify." },
  { icon: ListMusic, color: "text-chart-4", title: "Playlists", body: "Browse and open any playlist, with track lists and recommendations." },
  { icon: Sparkles, color: "text-chart-5", title: "AI Recommendations", body: "Describe a vibe in plain language and build a playlist from it." },
  { icon: BarChart3, color: "text-primary", title: "Audio Features", body: "Radar charts of danceability, energy, valence, tempo and more." },
]

const authSteps = [
  { n: "1", title: "Authorize", body: "You grant access on Spotify's own consent screen — the app never sees your password." },
  { n: "2", title: "Server-side exchange", body: "A Next.js route swaps the code for tokens, stored in httpOnly cookies." },
  { n: "3", title: "Proxy & refresh", body: "Requests route through the server, which refreshes expired tokens automatically." },
]

const stack = ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Radix UI", "Recharts", "Spotify Web API", "OAuth 2.0"]

export function LoginScreen() {
  const handleLogin = () => {
    setDemoMode(false)
    window.location.href = "/api/auth/login"
  }

  const handleDemo = () => {
    setDemoMode(true)
    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <style>{`
        @keyframes sdv-eq { 0%,100% { transform: scaleY(0.35) } 50% { transform: scaleY(1) } }
        .sdv-bar { transform-origin: bottom; animation: sdv-eq 1.1s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .sdv-bar { animation: none; transform: scaleY(0.6); } }
      `}</style>

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Music2 className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-semibold tracking-tight">Spotify Profile</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              <Github className="h-4 w-4" />
              Source
            </a>
            <Button onClick={handleDemo} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Guest demo
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: "radial-gradient(60% 55% at 50% 0%, color-mix(in oklch, var(--primary) 18%, transparent), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Full-stack web app · Spotify Web API
            </span>

            {/* Equalizer motif */}
            <div className="mt-8 flex items-end justify-center gap-1.5" aria-hidden="true">
              {[0.15, 0.45, 0.0, 0.6, 0.3, 0.5, 0.1, 0.7, 0.25].map((delay, i) => (
                <span
                  key={i}
                  className="sdv-bar w-1.5 rounded-full bg-primary/80"
                  style={{ height: `${28 + (i % 3) * 12}px`, animationDelay: `${delay}s` }}
                />
              ))}
            </div>

            <h1 className="mt-8 text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              Your listening history, <span className="text-primary">made visual.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
              Connect a Spotify account to explore your top artists and tracks over time, break down the audio DNA of
              any song, and build playlists with an AI assistant.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                onClick={handleDemo}
                size="lg"
                className="w-full gap-2 bg-primary py-6 text-base text-primary-foreground hover:bg-primary/90 sm:w-auto sm:px-7"
              >
                <Play className="h-4 w-4 fill-current" />
                Explore the guest demo
              </Button>
              <Button
                onClick={handleLogin}
                size="lg"
                variant="outline"
                className="w-full gap-2 border-border bg-transparent py-6 text-base hover:bg-secondary sm:w-auto sm:px-7"
              >
                <Music2 className="h-4 w-4" />
                Log in with Spotify
              </Button>
            </div>

            <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground">
              <span className="text-foreground">No account needed for the guest demo</span> — it loads a sample profile
              so you can click through every screen. Logging in with Spotify shows your own data (see the note below).
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Six ways to read your account</h2>
          <p className="mt-2 text-muted-foreground">Every view is powered by live Spotify data.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-secondary/40">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/40">
                  <Icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How auth works + honest note about access */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Real Spotify OAuth, end to end</h2>
            <p className="mt-2 text-muted-foreground">
              Logging in runs the full authorization-code flow against Spotify — no shortcuts.
            </p>
            <div className="mt-6 space-y-3">
              {authSteps.map((s) => (
                <div key={s.n} className="flex gap-4 rounded-lg border border-border bg-background/50 p-4">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-border text-sm font-medium text-primary">
                    {s.n}
                  </span>
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Why the guest demo?</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Spotify keeps unreviewed apps in <span className="text-foreground">development mode</span>, which limits
                real logins to a small list of approved accounts. So the <span className="text-foreground">guest demo</span>{" "}
                lets anyone explore the full interface with a realistic sample profile, while{" "}
                <span className="text-foreground">Log in with Spotify</span> works for approved accounts and shows genuine
                listening data.
              </p>
              <Button
                onClick={handleDemo}
                variant="outline"
                className="mt-5 w-full gap-2 border-border bg-transparent hover:bg-secondary"
              >
                Launch the guest demo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tech + footer */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Built with</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {stack.map((t) => (
              <span key={t} className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>Spotify Profile — a portfolio project. Not affiliated with Spotify AB.</span>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-foreground">
            <Github className="h-4 w-4" />
            View source
          </a>
        </div>
      </footer>
    </div>
  )
}
