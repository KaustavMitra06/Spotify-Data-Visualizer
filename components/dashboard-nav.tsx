"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSpotify } from "@/components/spotify-provider"
import { LayoutDashboard, Users, Music, Clock, Sparkles, ListMusic, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/artists", label: "Top Artists", icon: Users },
  { href: "/dashboard/tracks", label: "Top Tracks", icon: Music },
  { href: "/dashboard/recent", label: "Recently Played", icon: Clock },
  { href: "/dashboard/playlists", label: "Playlists", icon: ListMusic },
  { href: "/dashboard/recommendations", label: "Recommendations", icon: Sparkles },
]

export function DashboardNav() {
  const pathname = usePathname()
  const { user, logout } = useSpotify()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <Music className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-xl text-sidebar-foreground">Spotify Profile</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive ? "bg-sidebar-accent text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {user && (
        <div className="border-t border-sidebar-border pt-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.images?.[0]?.url || "/placeholder.svg"} alt={user.display_name} />
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {user.display_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-sidebar-foreground truncate">{user.display_name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.product === "premium" ? "Premium" : "Free"} Account
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </Button>
        </div>
      )}
    </aside>
  )
}
