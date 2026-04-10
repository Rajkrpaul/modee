"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { GameProvider, useGame } from '@/lib/game-context'
import { interviewQuestions, difficultyColors } from '@/lib/interview-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, Clock, Zap, Lightbulb, CheckCircle2, ChevronDown, ChevronUp,
  Send, Eye, EyeOff, Star, MessageSquare, RefreshCw, Award, Loader2,
} from 'lucide-react'
import Link from 'next/link'

interface Feedback {
  score: number
  strengths: string[]
  improvements: string[]
  keyPointsCovered: string[]
  summary?: string
}

function InterviewDetailContent() {
  const params = useParams()
  const { addXp, completeMission, addNotification } = useGame()

  const question = interviewQuestions.find(q => q.id === params.id)

  const [answer, setAnswer] = useState('')
  const [showTips, setShowTips] = useState(false)
  const [showSampleAnswer, setShowSampleAnswer] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && !isSubmitted) {
      interval = setInterval(() => setTimeElapsed(p => p + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, isSubmitted])

  useEffect(() => {
    if (answer.length > 0 && !isTimerRunning && !isSubmitted) {
      setIsTimerRunning(true)
    }
  }, [answer, isTimerRunning, isSubmitted])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  const handleSubmit = useCallback(async () => {
    if (isSubmitted || !question || answer.trim().length < 30) return

    setIsSubmitting(true)
    setIsTimerRunning(false)

    try {
      // Call AI evaluation API
      const evalRes = await fetch('/api/interviews/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          question: question.question,
          answer,
          keyPoints: question.keyPoints,
          category: question.category,
          difficulty: question.difficulty,
        }),
      })

      let evaluation: Feedback
      if (evalRes.ok) {
        evaluation = await evalRes.json()
      } else {
        // Fallback: local analysis
        const covered = question.keyPoints.filter(p =>
          answer.toLowerCase().includes(p.toLowerCase().split(' ')[0])
        )
        const score = Math.min(100, Math.round((covered.length / question.keyPoints.length) * 80 + Math.min(20, answer.length / 15)))
        evaluation = {
          score,
          strengths: answer.length > 150 ? ['Detailed response provided'] : [],
          improvements: ['Add more specific examples to strengthen your answer'],
          keyPointsCovered: covered,
          summary: 'Keep practicing to improve your interview skills!',
        }
      }

      setFeedback(evaluation)
      setIsSubmitted(true)

      // XP calculation: scale by score
      const xpMultiplier = evaluation.score >= 80 ? 1 : evaluation.score >= 60 ? 0.75 : 0.5
      const earnedXp = Math.round(question.xpReward * xpMultiplier)

      // Persist session + award XP
      await fetch('/api/interviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          role: question.category,
          difficulty: question.difficulty,
          score: evaluation.score,
          earnedXp,
          questionsAnswered: 1,
        }),
      })

      addXp(earnedXp, `Interview: "${question.question.slice(0, 30)}..."`)
      completeMission('daily-interview')
      addNotification(`Interview submitted! Score: ${evaluation.score}% · +${earnedXp} XP`, 'success')
    } catch (err) {
      console.error('Submit error:', err)
      addNotification('Submission failed. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitted, question, answer, addXp, completeMission, addNotification])

  const handleReset = () => {
    setAnswer('')
    setTimeElapsed(0)
    setIsTimerRunning(false)
    setIsSubmitted(false)
    setFeedback(null)
    setShowSampleAnswer(false)
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Question not found</h2>
          <Link href="/interviews"><Button variant="outline">Back to Interview Questions</Button></Link>
        </div>
      </div>
    )
  }

  const config = difficultyColors[question.difficulty]
  const minAnswerLength = 30

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/interviews">
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("text-xs px-2 py-0.5 rounded-full border capitalize", config)}>
                  {question.difficulty}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {question.category.replace('-', ' ')}
                </span>
              </div>
              <h1 className="font-semibold text-sm line-clamp-1">{question.question}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg",
              timeElapsed > question.timeLimit * 60 ? "bg-red-500/10 text-red-500" : "bg-muted"
            )}>
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm">{formatTime(timeElapsed)}</span>
              <span className="text-xs text-muted-foreground">/ {question.timeLimit}:00</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">+{question.xpReward} XP</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">{question.question}</h2>
              <button
                onClick={() => setShowTips(!showTips)}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Tips for answering ({question.tips.length})
                {showTips ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showTips && (
                <div className="mt-4 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <ul className="space-y-2">
                    {question.tips.map((tip: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-yellow-500 font-medium">{idx + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Answer Input */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Your Answer</h3>
                <div className="flex items-center gap-3">
                  <span className={cn("text-xs", answer.length < minAnswerLength ? "text-red-400" : "text-muted-foreground")}>
                    {answer.length} chars {answer.length < minAnswerLength ? `(min ${minAnswerLength})` : ''}
                  </span>
                </div>
              </div>
              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer here. Speak as if you were in an actual interview..."
                className="w-full h-64 p-4 rounded-xl bg-muted border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isSubmitted}
              />
              <div className="flex items-center justify-between mt-4">
                <Button variant="outline" onClick={handleReset} disabled={answer.length === 0 && !isSubmitted}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Reset
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={answer.length < minAnswerLength || isSubmitted || isSubmitting}
                  className="gap-2 min-w-[140px]"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</>
                  ) : isSubmitted ? (
                    <><CheckCircle2 className="w-4 h-4" /> Submitted</>
                  ) : (
                    <><Send className="w-4 h-4" /> Submit Answer</>
                  )}
                </Button>
              </div>
            </div>

            {/* AI Feedback */}
            {feedback && (
              <div className="glass rounded-2xl p-6 border border-primary/30 animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" /> AI Feedback
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className={cn("text-3xl font-bold",
                      feedback.score >= 80 ? "text-green-500" :
                      feedback.score >= 60 ? "text-yellow-500" : "text-red-500"
                    )}>
                      {feedback.score}%
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={cn("w-4 h-4",
                          star <= Math.round(feedback.score / 20)
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-muted-foreground"
                        )} />
                      ))}
                    </div>
                  </div>
                </div>

                {feedback.summary && (
                  <p className="text-sm text-muted-foreground mb-4 italic">{feedback.summary}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                    <h4 className="font-medium text-green-500 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Strengths
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {feedback.strengths.length > 0
                        ? feedback.strengths.map((s, i) => <li key={i}>• {s}</li>)
                        : <li className="text-muted-foreground">Expand your answer for more detailed feedback.</li>}
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                    <h4 className="font-medium text-yellow-500 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" /> Areas to Improve
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {feedback.improvements.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Key Points Coverage</h4>
                  <div className="flex flex-wrap gap-2">
                    {question.keyPoints.map((point: string, idx: number) => (
                      <span key={idx} className={cn(
                        "text-xs px-3 py-1 rounded-full border",
                        feedback.keyPointsCovered.includes(point)
                          ? "bg-green-500/10 border-green-500/30 text-green-500"
                          : "bg-muted border-border text-muted-foreground"
                      )}>
                        {feedback.keyPointsCovered.includes(point) && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Sample Answer</h3>
                <button onClick={() => setShowSampleAnswer(!showSampleAnswer)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline">
                  {showSampleAnswer ? <><EyeOff className="w-3 h-3" /> Hide</> : <><Eye className="w-3 h-3" /> Show</>}
                </button>
              </div>
              <div className={cn("text-sm text-muted-foreground transition-all", showSampleAnswer ? "blur-0" : "blur-md select-none")}>
                {question.sampleAnswer}
              </div>
              {!showSampleAnswer && (
                <p className="text-xs text-center text-muted-foreground mt-4">Try answering first before viewing the sample</p>
              )}
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Key Points to Cover</h3>
              <ul className="space-y-2">
                {question.keyPoints.map((point: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs shrink-0 mt-0.5">{idx + 1}</div>
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass rounded-2xl p-4">
              <Link href="/interviews">
                <Button variant="outline" className="w-full">Back to All Questions</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InterviewDetailPage() {
  return (
    <GameProvider>
      <InterviewDetailContent />
    </GameProvider>
  )
}
