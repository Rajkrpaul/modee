"use client"

import { useState, useEffect } from 'react'
import { GameProvider, useGame } from '@/lib/game-context'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { interviewQuestions, interviewCategories, difficultyColors } from '@/lib/interview-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Search,
  Mic2,
  Users,
  Code2,
  Layers,
  MessageCircle,
  Grid,
  Clock,
  Zap,
  CheckCircle2,
  Play,
  ChevronRight,
  Lightbulb,
  Star,
  TrendingUp,
  Brain,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'

const categoryIcons: { [key: string]: React.ElementType } = {
  Grid: Grid,
  Users: Users,
  Code: Code2,
  Layers: Layers,
  MessageCircle: MessageCircle,
}

interface InterviewSession {
  sessionId: string
  role: string
  difficulty: string
  score: number
  earnedXp: number
  questionsAnswered: number
  completedAt: string
}

function InterviewsContent() {
  const { user } = useGame()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [interviewHistory, setInterviewHistory] = useState<InterviewSession[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  // Fetch real interview history from backend
  useEffect(() => {
    fetch('/api/interviews/submit', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.interviewHistory) {
          setInterviewHistory(data.interviewHistory)
        }
      })
      .catch(() => {/* ignore */})
      .finally(() => setIsLoadingHistory(false))
  }, [])

  const filteredQuestions = interviewQuestions.filter(q => {
    const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory
    const matchesDifficulty = !selectedDifficulty || q.difficulty === selectedDifficulty
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesDifficulty && matchesSearch
  })

  // Derive real stats from history
  const practiced = interviewHistory.reduce(
    (sum, s) => sum + (s.questionsAnswered || 1),
    0
  )
  const avgScore =
    interviewHistory.length > 0
      ? Math.round(
          interviewHistory.reduce((sum, s) => sum + (s.score || 0), 0) /
            interviewHistory.length
        )
      : 0

  const stats = {
    total: interviewQuestions.length,
    practiced,
    avgScore,
    totalXp: interviewQuestions.reduce((sum, q) => sum + q.xpReward, 0),
  }

  // Build a set of practiced question roles for per-card marking
  const practicedRoles = new Set(interviewHistory.map((s) => s.role?.toLowerCase()))

  return (
    <DashboardLayout
      title="Mock Interview Practice"
      subtitle="Prepare for interviews with AI-generated questions and feedback"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Mic2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Questions</div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-2xl font-bold">{stats.practiced}</div>
              {isLoadingHistory && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
            </div>
            <div className="text-xs text-muted-foreground">Questions Practiced</div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-2xl font-bold">{stats.avgScore}%</div>
              {isLoadingHistory && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
            </div>
            <div className="text-xs text-muted-foreground">Average Score</div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.totalXp}</div>
            <div className="text-xs text-muted-foreground">XP Available</div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="glass rounded-2xl p-6 border border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-glow-pulse">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">AI Interview Simulation</h3>
                <p className="text-sm text-muted-foreground">
                  Practice with randomly selected questions and get instant feedback
                </p>
              </div>
            </div>
            <Link href="/interviews/practice">
              <Button className="gap-2" size="lg">
                <Play className="w-5 h-5" />
                Start Practice Session
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search questions..."
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
                    ? difficultyColors[diff as keyof typeof difficultyColors]
                    : "bg-muted border-border hover:border-primary/30"
                )}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories */}
          <div className="glass rounded-2xl p-4 h-fit lg:sticky lg:top-24">
            <h3 className="font-semibold mb-4">Categories</h3>
            <div className="space-y-1">
              {interviewCategories.map((category) => {
                const Icon = categoryIcons[category.icon] || Grid
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                      selectedCategory === category.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{category.name}</span>
                    <span className="text-xs opacity-60">{category.count}</span>
                  </button>
                )
              })}
            </div>

            {/* Tips Section */}
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Quick Tips
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">1.</span>
                  Use the STAR method for behavioral questions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">2.</span>
                  Practice speaking aloud, not just reading
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">3.</span>
                  Keep answers concise (2-3 minutes)
                </li>
              </ul>
            </div>
          </div>

          {/* Questions List */}
          <div className="lg:col-span-3 space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Mic2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No questions found</h3>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </div>
            ) : (
              filteredQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  isPracticed={practicedRoles.has(question.category?.toLowerCase())}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

interface QuestionCardProps {
  question: (typeof interviewQuestions)[0]
  isPracticed: boolean
}

function QuestionCard({ question, isPracticed }: QuestionCardProps) {
  const config = difficultyColors[question.difficulty]

  return (
    <div
      className={cn(
        "glass rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] group",
        isPracticed && "border-primary/30 bg-primary/5"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className={cn(
              "text-xs px-2 py-1 rounded-full border capitalize",
              config
            )}>
              {question.difficulty}
            </span>
            <span className="text-xs text-muted-foreground capitalize px-2 py-1 rounded-full bg-muted">
              {question.category.replace('-', ' ')}
            </span>
            {isPracticed && (
              <span className="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Practiced
              </span>
            )}
          </div>

          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-3">
            {question.question}
          </h3>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{question.timeLimit} min</span>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <Zap className="w-4 h-4" />
              <span className="font-medium">+{question.xpReward} XP</span>
            </div>
            <div className="flex items-center gap-1">
              <Lightbulb className="w-4 h-4" />
              <span>{question.tips.length} tips</span>
            </div>
          </div>
        </div>

        <Link href={`/interviews/${question.id}`}>
          <Button
            variant={isPracticed ? 'outline' : 'default'}
            className="gap-2"
          >
            {isPracticed ? 'Review' : 'Practice'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function InterviewsPage() {
  return (
    <GameProvider>
      <InterviewsContent />
    </GameProvider>
  )
}
