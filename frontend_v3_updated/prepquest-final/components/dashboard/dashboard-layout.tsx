"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { useGame } from "@/lib/game-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  Gamepad2, Settings, LogOut, LayoutDashboard, Code,
  Users, BookOpen, Trophy, FileText, Brain, Map,
  X, Zap, TrendingUp, ChevronRight,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/challenges", label: "Challenges", icon: Code },
  { href: "/interviews", label: "Interviews", icon: Users },
  { href: "/learning-paths", label: "Learning Paths", icon: Map },
  { href: "/ai-mentor", label: "AI Mentor", icon: Brain },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: BookOpen },
]

// ── Notification Toast ────────────────────────────────────────────────────────

function NotificationToast() {
  const { notifications, dismissNotification } = useGame()
  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full">
      {notifications.slice(0, 3).map(notif => (
        <div
          key={notif.id}
          className={cn(
            "flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm animate-in slide-in-from-right duration-300",
            notif.type === "success" && "bg-green-500/15 border-green-500/30 text-green-300",
            notif.type === "error" && "bg-red-500/15 border-red-500/30 text-red-300",
            notif.type === "warning" && "bg-yellow-500/15 border-yellow-500/40 text-yellow-300",
            notif.type === "info" && "bg-primary/15 border-primary/30 text-primary",
            "light:text-foreground"
          )}
        >
          <span className="flex-1 leading-relaxed">{notif.message}</span>
          <button onClick={() => dismissNotification(notif.id)} className="shrink-0 opacity-60 hover:opacity-100 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Adaptive Engine Badge ─────────────────────────────────────────────────────

function AdaptiveBadge() {
  const { adaptive } = useGame()

  const diffColor = {
    easy: "text-green-500 border-green-500/30 bg-green-500/10",
    medium: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
    hard: "text-red-400 border-red-400/30 bg-red-400/10",
  }[adaptive.recommendedDifficulty]

  const bars = Math.round(adaptive.efficiencyScore / 20) // 0-5

  return (
    <div className="mx-4 mb-3 p-3 rounded-xl border border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-primary">Adaptive Engine</span>
      </div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted-foreground">Efficiency</span>
        <span className="text-xs font-bold text-primary">{adaptive.efficiencyScore}/100</span>
      </div>
      {/* Mini bar chart */}
      <div className="flex gap-0.5 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={cn(
            "flex-1 h-1.5 rounded-full transition-all",
            i < bars ? "bg-primary" : "bg-muted"
          )} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Next level</span>
        <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-semibold capitalize", diffColor)}>
          {adaptive.recommendedDifficulty}
        </span>
      </div>
      {adaptive.xpMultiplier > 1.0 && (
        <div className="flex items-center gap-1 mt-1.5">
          <Zap className="w-3 h-3 text-yellow-500" />
          <span className="text-[10px] text-yellow-500 font-semibold">{adaptive.xpMultiplier}x XP multiplier active</span>
        </div>
      )}
    </div>
  )
}

// ── Dashboard Layout ──────────────────────────────────────────────────────────

export function DashboardLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode
  title?: string
  subtitle?: string
}) {
  const { user, logout } = useAuth()
  const { pingActivity, streak } = useGame()
  const router = useRouter()
  const pathname = usePathname()

  // Ping activity on any navigation or click
  useEffect(() => {
    pingActivity()
  }, [pathname, pingActivity])

  const handleUserInteraction = useCallback(() => {
    pingActivity()
  }, [pingActivity])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div
      className="min-h-screen bg-background flex"
      onClick={handleUserInteraction}
      onKeyDown={handleUserInteraction}
    >
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card/50 flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-4 border-b border-border/50">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center neon-glow">
              <Gamepad2 className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold">PrepQuest</span>
          </Link>
        </div>

        {/* XP + Streak quick bar */}
        {user && (
          <div className="mx-4 mt-3 mb-1 flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/40">
            <div className="flex items-center gap-1 text-xs">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold text-primary">{(user.xp ?? 0).toLocaleString()} XP</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 text-xs ml-auto">
                <span>🔥</span>
                <span className="font-semibold text-orange-400">{streak}d</span>
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 transition-all",
                    isActive && "bg-primary/10 text-primary font-semibold"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Adaptive Engine badge */}
        <AdaptiveBadge />

        {/* User section */}
        {user && (
          <div className="p-4 border-t border-border/50 space-y-2">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9 border-2 border-primary/30">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback className="bg-primary/20 text-primary text-sm">
                  {getInitials(user.name || user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/settings" className="flex-1">
                <Button variant="ghost" size="sm" className="w-full gap-2">
                  <Settings className="w-4 h-4" />Settings
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Global notification toasts */}
      <NotificationToast />
    </div>
  )
}