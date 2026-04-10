'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Gamepad2,
  Settings,
  LogOut,
  Loader2,
  Zap,
  Trophy,
  Flame,
  Target,
  BookOpen,
  Code,
  Users,
} from 'lucide-react'

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [userRank, setUserRank] = useState<number | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Fetch real rank from leaderboard API
  useEffect(() => {
    if (!isAuthenticated) return
    fetch('/api/leaderboard', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.currentUserRank != null) setUserRank(data.currentUserRank)
      })
      .catch(() => {/* silently ignore */})
  }, [isAuthenticated])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const userXp = user.xp || 0
  const userLevel = user.level || 1
  const userStreak = user.streak || 0

  const xpForCurrentLevel = userXp % 100
  const xpRequired = 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center neon-glow">
              <Gamepad2 className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold">PrepQuest</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
            <Avatar className="w-10 h-10 border-2 border-primary/30">
              <AvatarImage src={user.profilePicture} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {getInitials(user.name || user.email)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {user.name?.split(' ')[0] || 'Player'}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Ready to level up your skills today?
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total XP</p>
                    <p className="text-2xl font-bold">{userXp.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="text-2xl font-bold">{userLevel}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Streak</p>
                    <p className="text-2xl font-bold">{userStreak} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rank</p>
                    <p className="text-2xl font-bold">
                      {userRank !== null ? `#${userRank}` : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* XP Progress */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Level Progress
              </CardTitle>
              <CardDescription>
                {xpRequired - xpForCurrentLevel} XP until level {userLevel + 1}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Level {userLevel}</span>
                  <span>Level {userLevel + 1}</span>
                </div>
                <Progress value={(xpForCurrentLevel / xpRequired) * 100} className="h-3" />
                <p className="text-xs text-muted-foreground text-center">
                  {xpForCurrentLevel} / {xpRequired} XP
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions — all three are now clickable Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/challenges" className="block group">
              <Card className="glass border-border/50 hover:border-primary/50 transition-all cursor-pointer h-full group-hover:shadow-lg group-hover:shadow-primary/10">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/30 transition-colors">
                    <Code className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Coding Challenges</h3>
                  <p className="text-sm text-muted-foreground">
                    Practice DSA and problem-solving
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/interviews" className="block group">
              <Card className="glass border-border/50 hover:border-cyan-500/50 transition-all cursor-pointer h-full group-hover:shadow-lg group-hover:shadow-cyan-500/10">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500/30 transition-colors">
                    <BookOpen className="w-8 h-8 text-cyan-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Mock Interviews</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered interview practice
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/leaderboard" className="block group">
              <Card className="glass border-border/50 hover:border-yellow-500/50 transition-all cursor-pointer h-full group-hover:shadow-lg group-hover:shadow-yellow-500/10">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-500/30 transition-colors">
                    <Users className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Leaderboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Compete with other students
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
