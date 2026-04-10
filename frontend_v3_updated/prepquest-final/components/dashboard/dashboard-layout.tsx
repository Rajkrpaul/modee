"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Gamepad2,
  Settings,
  LogOut,
  LayoutDashboard,
  Code,
  Users,
  BookOpen,
  Trophy,
  FileText,
  Brain,
  Map,
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

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card/50 flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-4 border-b border-border/50">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold">PrepQuest</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

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
                  <Settings className="w-4 h-4" />
                  Settings
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
    </div>
  )
}
