"use client"

import { useState, useEffect } from 'react'
import { GameProvider, useGame } from '@/lib/game-context'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { challenges, categories, difficultyConfig, type CodingChallenge } from '@/lib/challenges-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Search,
  Filter,
  Clock,
  Zap,
  CheckCircle2,
  Circle,
  Code2,
  Play,
  ChevronRight,
  Users,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'

function ChallengesContent() {
  const { completedChallengeIds, refreshGameState } = useGame()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSyncing, setIsSyncing] = useState(true)

  // On mount, fetch the latest completed challenges from the backend so the
  // list reflects real server state even if the auth context is stale.
  useEffect(() => {
    fetch('/api/challenges/complete', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then(async (data) => {
        if (data?.completedChallenges?.length) {
          // refreshGameState re-fetches /api/auth/me which includes completedChallenges
          await refreshGameState()
        }
      })
      .catch(() => {/* ignore */})
      .finally(() => setIsSyncing(false))
  }, [refreshGameState])

  const filteredChallenges = challenges.filter(challenge => {
    const matchesCategory = selectedCategory === 'all' || challenge.category === selectedCategory
    const matchesDifficulty = !selectedDifficulty || challenge.difficulty === selectedDifficulty
    const matchesSearch =
      challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesDifficulty && matchesSearch
  })

  const stats = {
    total: challenges.length,
    completed: completedChallengeIds.size,
    easy: challenges.filter(c => c.difficulty === 'easy').length,
    medium: challenges.filter(c => c.difficulty === 'medium').length,
    hard: challenges.filter(c => c.difficulty === 'hard').length,
  }

  return (
    <DashboardLayout
      title="Coding Challenges"
      subtitle="Sharpen your skills with AI-curated challenges"
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <div className="text-2xl font-bold text-primary">{stats.completed}</div>
              {isSyncing && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.easy}</div>
            <div className="text-xs text-muted-foreground">Easy</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.medium}</div>
            <div className="text-xs text-muted-foreground">Medium</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.hard}</div>
            <div className="text-xs text-muted-foreground">Hard</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search challenges by name or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex gap-2">
            {['easy', 'medium', 'hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all border",
                  selectedDifficulty === diff
                    ? difficultyConfig[diff as keyof typeof difficultyConfig].color
                    : "bg-muted border-border hover:border-primary/30"
                )}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="glass rounded-2xl p-4 h-fit lg:sticky lg:top-24">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              Categories
            </h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                    selectedCategory === category.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{category.name}</span>
                  <span className="text-xs opacity-60">{category.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Challenges List */}
          <div className="lg:col-span-3 space-y-4">
            {filteredChallenges.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Code2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No challenges found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search query</p>
              </div>
            ) : (
              filteredChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  isCompleted={completedChallengeIds.has(challenge.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function ChallengeCard({
  challenge,
  isCompleted,
}: {
  challenge: CodingChallenge
  isCompleted: boolean
}) {
  const config = difficultyConfig[challenge.difficulty]

  return (
    <div
      className={cn(
        "glass rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] group",
        isCompleted && "border-primary/30 bg-primary/5"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              isCompleted ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {challenge.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn("text-xs px-2 py-0.5 rounded-full border capitalize", config.color)}>
                  {challenge.difficulty}
                </span>
                <span className="text-xs text-muted-foreground capitalize">{challenge.category}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {challenge.description.split('\n')[0]}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {challenge.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 rounded-md bg-muted">
                {tag}
              </span>
            ))}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{challenge.timeLimit} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{challenge.completionRate}% success</span>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <Zap className="w-4 h-4" />
              <span className="font-medium">+{challenge.xpReward} XP</span>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex flex-col items-end gap-2">
          <Link href={`/challenges/${challenge.id}`}>
            <Button className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {isCompleted ? 'Review' : 'Solve'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
          {!isCompleted && (
            <span className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              Trending
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChallengesPage() {
  return (
    <GameProvider>
      <ChallengesContent />
    </GameProvider>
  )
}
