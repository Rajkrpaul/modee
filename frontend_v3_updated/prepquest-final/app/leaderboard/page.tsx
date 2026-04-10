"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy, Crown, TrendingUp, Flame, Code, Globe, Loader2, RefreshCw, Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  xp: number
  level: number
  streak: number
  challengesCompleted: number
  interviewsCompleted: number
  isCurrentUser: boolean
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/30">
      <Crown className="w-5 h-5 text-yellow-900" />
    </div>
  )
  if (rank === 2) return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500">
      <span className="font-bold text-gray-800">2</span>
    </div>
  )
  if (rank === 3) return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800">
      <span className="font-bold text-amber-200">3</span>
    </div>
  )
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
      <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    </div>
  )
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-xl transition-all",
      entry.isCurrentUser
        ? "bg-primary/10 border border-primary/30 ring-1 ring-primary/20"
        : "hover:bg-muted/50 border border-transparent"
    )}>
      <RankBadge rank={entry.rank} />

      <Avatar className={cn("w-10 h-10 border-2", entry.isCurrentUser ? "border-primary" : "border-border/50")}>
        <AvatarFallback className={cn("font-bold text-sm", entry.isCurrentUser ? "bg-primary/20 text-primary" : "bg-muted")}>
          {entry.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold truncate">{entry.name}</p>
          {entry.isCurrentUser && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">You</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-1"><Code className="w-3 h-3" /> {entry.challengesCompleted} solved</span>
          {entry.streak > 0 && <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> {entry.streak}d</span>}
        </div>
      </div>

      <div className="text-right">
        <div className="flex items-center gap-1 justify-end">
          <Zap className="w-4 h-4 text-primary" />
          <span className="font-bold text-primary">{entry.xp.toLocaleString()}</span>
        </div>
        <div className="text-xs text-muted-foreground">Level {entry.level}</div>
      </div>
    </div>
  )
}

function TopThreePodium({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length < 3) return null
  const [first, second, third] = entries

  return (
    <div className="flex items-end justify-center gap-4 py-4">
      {/* 2nd */}
      <div className="flex flex-col items-center">
        <Avatar className="w-14 h-14 border-4 border-gray-400 shadow-lg mb-2">
          <AvatarFallback className="bg-gradient-to-br from-gray-300 to-gray-500 text-gray-800 font-bold">
            {second.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <span className="font-semibold text-sm text-center max-w-[100px] truncate">{second.name}</span>
        <span className="text-xs text-muted-foreground">{second.xp.toLocaleString()} XP</span>
        <div className="w-20 h-20 bg-gradient-to-t from-gray-500 to-gray-400 rounded-t-lg mt-2 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">2</span>
        </div>
      </div>

      {/* 1st */}
      <div className="flex flex-col items-center -mt-8">
        <Crown className="w-7 h-7 text-yellow-500 mb-1" />
        <Avatar className="w-20 h-20 border-4 border-yellow-500 shadow-lg shadow-yellow-500/30 mb-2">
          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 font-bold text-xl">
            {first.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <span className="font-bold text-center max-w-[120px] truncate">{first.name}</span>
        <span className="text-sm text-primary font-semibold">{first.xp.toLocaleString()} XP</span>
        <div className="w-24 h-28 bg-gradient-to-t from-yellow-600 to-yellow-500 rounded-t-lg mt-2 flex items-center justify-center shadow-lg shadow-yellow-500/20">
          <span className="text-3xl font-bold text-yellow-900">1</span>
        </div>
      </div>

      {/* 3rd */}
      <div className="flex flex-col items-center">
        <Avatar className="w-14 h-14 border-4 border-amber-600 shadow-lg mb-2">
          <AvatarFallback className="bg-gradient-to-br from-amber-600 to-amber-800 text-amber-200 font-bold">
            {third.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <span className="font-semibold text-sm text-center max-w-[100px] truncate">{third.name}</span>
        <span className="text-xs text-muted-foreground">{third.xp.toLocaleString()} XP</span>
        <div className="w-20 h-16 bg-gradient-to-t from-amber-800 to-amber-600 rounded-t-lg mt-2 flex items-center justify-center">
          <span className="text-2xl font-bold text-amber-200">3</span>
        </div>
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchLeaderboard = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/leaderboard', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setLeaderboard(data.leaderboard ?? [])
        setCurrentUserRank(data.currentUserRank ?? null)
        setLastRefresh(new Date())
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchLeaderboard() }, [])

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)
  const currentUserEntry = leaderboard.find(e => e.isCurrentUser)

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Leaderboard
              </span>
            </h1>
            <p className="text-muted-foreground mt-1">Compete with the best and climb the ranks</p>
          </div>

          <div className="flex items-center gap-3">
            {currentUserEntry && (
              <Card className="bg-card/50 border-primary/30">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Your Global Rank</div>
                    <div className="text-2xl font-bold text-primary">#{currentUserRank}</div>
                  </div>
                  <div className="flex items-center gap-1 text-green-500 ml-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">{currentUserEntry.xp.toLocaleString()} XP</span>
                  </div>
                </CardContent>
              </Card>
            )}
            <Button variant="outline" size="icon" onClick={fetchLeaderboard} disabled={isLoading} title="Refresh">
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : leaderboard.length === 0 ? (
          <Card className="bg-card/30 border-border/50">
            <CardContent className="py-16 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No data yet</h3>
              <p className="text-muted-foreground text-sm">Be the first to solve challenges and appear on the leaderboard!</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="global" className="space-y-6">
            <TabsList className="bg-card/50 border border-border p-1">
              <TabsTrigger value="global" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Globe className="w-4 h-4" /> Global
              </TabsTrigger>
            </TabsList>

            <TabsContent value="global" className="space-y-6">
              {top3.length >= 3 && (
                <Card className="bg-card/30 border-border/50 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-b border-border/50">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" /> Top Performers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <TopThreePodium entries={top3} />
                  </CardContent>
                </Card>
              )}

              <Card className="bg-card/30 border-border/50">
                <CardHeader>
                  <CardTitle>All Rankings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Show top 3 in list too if fewer than 3 total */}
                  {(top3.length < 3 ? leaderboard : rest).map(entry => (
                    <LeaderboardRow key={entry.id} entry={entry} />
                  ))}
                  {/* If top3 rendered as podium, also list them below for completeness */}
                  {top3.length >= 3 && rest.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Only {leaderboard.length} user{leaderboard.length !== 1 ? 's' : ''} on the board so far. Keep solving challenges!
                    </p>
                  )}
                </CardContent>
              </Card>

              {lastRefresh && (
                <p className="text-center text-xs text-muted-foreground">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}
