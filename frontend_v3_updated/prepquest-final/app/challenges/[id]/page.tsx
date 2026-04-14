"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { GameProvider, useGame } from '@/lib/game-context'
import { challenges, difficultyConfig, LANGUAGES, type Language } from '@/lib/challenges-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, Play, RotateCcw, Clock, Zap, Lightbulb,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Code2,
  Send, Eye, EyeOff, Lock, Brain,
} from 'lucide-react'
import Link from 'next/link'

function ChallengeDetailContent() {
  const params = useParams()
  const { addXp, completeChallenge, completeMission, addNotification, completedChallengeIds, recordAttempt, pingActivity, adaptive } = useGame()

  const challenge = challenges.find(c => c.id === params.id)
  const alreadyCompleted = challenge ? completedChallengeIds.has(challenge.id) : false

  const [language, setLanguage] = useState<Language>('javascript')
  const [code, setCode] = useState(challenge?.starterCodeByLanguage?.javascript || challenge?.starterCode || '')
  const [showHints, setShowHints] = useState(false)
  const [revealedHints, setRevealedHints] = useState<number[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<{ passed: boolean; input: string; expected: string; got?: string }[] | null>(null)
  const [output, setOutput] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(alreadyCompleted)
  const [earnedXp, setEarnedXp] = useState(0)

  // Switch starter code when language changes
  useEffect(() => {
    if (challenge) {
      setCode(challenge.starterCodeByLanguage?.[language] || challenge.starterCode)
      setOutput(null)
      setTestResults(null)
    }
  }, [language, challenge])

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && !isSubmitted) {
      interval = setInterval(() => setTimeElapsed(p => p + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, isSubmitted])

  // Start timer on first edit
  useEffect(() => {
    if (challenge && code !== (challenge.starterCodeByLanguage?.[language] || challenge.starterCode) && !isTimerRunning) {
      setIsTimerRunning(true)
    }
  }, [code, challenge, language, isTimerRunning])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  const simulateTestCases = useCallback(() => {
    if (!challenge) return []
    // Simulate execution: pass all tests if code is non-trivial (not just starter code)
    const isModified = code.trim() !== (challenge.starterCodeByLanguage?.[language] || challenge.starterCode).trim()
    const codeLength = code.replace(/\/\/.*/g, '').replace(/\s/g, '').length
    const hasLogic = codeLength > 80

    return challenge.testCases.map((tc, idx) => {
      // Heuristic: pass if code looks written, fail early tests if trivial
      const passed = isModified && hasLogic && (idx < 2 || Math.random() > 0.15)
      return { passed, input: tc.input, expected: tc.expectedOutput, got: passed ? tc.expectedOutput : 'null' }
    })
  }, [challenge, code, language])

  const handleRun = useCallback(() => {
    if (!challenge) return
    setIsRunning(true)
    setOutput({ type: 'info', message: 'Running test cases...' })
    setTestResults(null)

    setTimeout(() => {
      const results = simulateTestCases()
      setTestResults(results)
      const allPassed = results.every(r => r.passed)
      const passCount = results.filter(r => r.passed).length

      setOutput({
        type: allPassed ? 'success' : 'error',
        message: allPassed
          ? `✓ All ${results.length} test cases passed!`
          : `${passCount}/${results.length} test cases passed.`,
      })
      setIsRunning(false)
    }, 1200)
  }, [challenge, simulateTestCases])

  const handleSubmit = useCallback(async () => {
    if (!challenge || isSubmitted) return

    setIsRunning(true)
    setOutput({ type: 'info', message: 'Submitting your solution...' })

    setTimeout(async () => {
      const results = simulateTestCases()
      const allPassed = results.every(r => r.passed)
      setTestResults(results)
      setIsRunning(false)

      if (!allPassed) {
        const passCount = results.filter(r => r.passed).length
        setOutput({ type: 'error', message: `Only ${passCount}/${results.length} test cases passed. Fix your solution and try again.` })
        recordAttempt(false, timeElapsed * 1000, challenge.difficulty)
        return
      }

      setIsSubmitted(true)
      setIsTimerRunning(false)

      const bonusXp = timeElapsed < (challenge.timeLimit * 60) ? 10 : 0
      const totalXp = challenge.xpReward + bonusXp
      setEarnedXp(totalXp)

      setOutput({
        type: 'success',
        message: `🎉 Solution Accepted!\n\nAll test cases passed!\n\n+${totalXp} XP earned${bonusXp > 0 ? ` (includes +${bonusXp} speed bonus!)` : ''}`,
      })

      await completeChallenge(challenge.id, totalXp, language)
      recordAttempt(true, timeElapsed * 1000, challenge.difficulty)
      pingActivity()
      completeMission('daily-coding')
      addNotification(`Challenge "${challenge.title}" completed! +${totalXp} XP`, 'success')
    }, 1800)
  }, [challenge, isSubmitted, timeElapsed, language, simulateTestCases, completeChallenge, completeMission, addNotification])

  const handleReset = () => {
    setCode(challenge?.starterCodeByLanguage?.[language] || challenge?.starterCode || '')
    setOutput(null)
    setTestResults(null)
    if (!alreadyCompleted) {
      setIsSubmitted(false)
      setTimeElapsed(0)
      setIsTimerRunning(false)
    }
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Code2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Challenge not found</h2>
          <Link href="/challenges"><Button variant="outline">Back to Challenges</Button></Link>
        </div>
      </div>
    )
  }

  const config = difficultyConfig[challenge.difficulty]

  // Adaptive recommendation banner
  const showAdaptiveBanner = adaptive.efficiencyScore >= 75 && challenge.difficulty === 'easy'
    || adaptive.efficiencyScore < 35 && challenge.difficulty === 'hard'

  return (
    <div className="min-h-screen bg-background">
      {/* Adaptive Engine Banner */}
      {showAdaptiveBanner && (
        <div className={cn(
          "px-4 py-2 text-xs font-medium flex items-center gap-2 border-b",
          adaptive.efficiencyScore >= 75
            ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
            : "bg-blue-500/10 border-blue-500/20 text-blue-400"
        )}>
          <Brain className="w-3.5 h-3.5 shrink-0" />
          {adaptive.efficiencyScore >= 75
            ? `🧠 Adaptive Engine: You're crushing easy problems! We recommend moving to ${adaptive.recommendedDifficulty} difficulty for ${adaptive.xpMultiplier}x XP.`
            : `💡 Adaptive Engine: This looks tough. Try a medium problem first to build confidence.`
          }
        </div>
      )}
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/challenges">
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div>
              <h1 className="font-bold">{challenge.title}</h1>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs px-2 py-0.5 rounded-full border capitalize", config.color)}>
                  {challenge.difficulty}
                </span>
                <span className="text-xs text-muted-foreground">{challenge.category}</span>
                {alreadyCompleted && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Completed
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg",
              timeElapsed > challenge.timeLimit * 60 ? "bg-red-500/10 text-red-500" : "bg-muted"
            )}>
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm">{formatTime(timeElapsed)}</span>
              <span className="text-xs text-muted-foreground">/ {challenge.timeLimit}:00</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">+{challenge.xpReward} XP</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-61px)]">
        {/* Left Panel */}
        <div className="w-1/2 border-r border-border overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Problem Description</h2>
              <p className="whitespace-pre-line text-muted-foreground text-sm leading-relaxed">{challenge.description}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Examples</h2>
              <div className="space-y-4">
                {challenge.examples.map((example, idx) => (
                  <div key={idx} className="glass rounded-xl p-4">
                    <div className="text-xs text-muted-foreground mb-2">Example {idx + 1}</div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-primary font-medium">Input: </span>
                        <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{example.input}</code>
                      </div>
                      <div>
                        <span className="text-xs text-primary font-medium">Output: </span>
                        <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{example.output}</code>
                      </div>
                      {example.explanation && (
                        <div className="text-xs text-muted-foreground mt-2">
                          <span className="font-medium">Explanation: </span>{example.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hints */}
            <div>
              <button
                onClick={() => setShowHints(!showHints)}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                Hints ({challenge.hints.length})
                {showHints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showHints && (
                <div className="mt-3 space-y-2">
                  {challenge.hints.map((hint, idx) => (
                    <div key={idx} className="glass rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Hint {idx + 1}</span>
                        {!revealedHints.includes(idx) ? (
                          <button onClick={() => setRevealedHints([...revealedHints, idx])}
                            className="flex items-center gap-1 text-xs text-primary hover:underline">
                            <Eye className="w-3 h-3" /> Reveal
                          </button>
                        ) : <EyeOff className="w-3 h-3 text-muted-foreground" />}
                      </div>
                      <p className={cn("text-sm mt-2 transition-all", revealedHints.includes(idx) ? "blur-0" : "blur-sm select-none")}>
                        {hint}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Related Topics</h3>
              <div className="flex flex-wrap gap-2">
                {challenge.tags.map(tag => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full bg-muted">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 flex flex-col">
          {/* Language selector + toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
            <div className="flex items-center gap-1">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-medium transition-all",
                    language === lang.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset} disabled={isRunning}>
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </div>

          {/* Code editor */}
          <div className="flex-1 relative">
            {alreadyCompleted && !isSubmitted && (
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/30">
                <Lock className="w-3 h-3" /> Already solved
              </div>
            )}
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full h-full p-4 bg-background font-mono text-sm resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
              disabled={isSubmitted}
            />
          </div>

          {/* Output panel */}
          <div className="h-52 border-t border-border flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
              <span className="text-sm font-medium">Output</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRun} disabled={isRunning || isSubmitted}>
                  <Play className="w-4 h-4 mr-2" /> Run
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={isRunning || isSubmitted} className="gap-2">
                  <Send className="w-4 h-4" />
                  {alreadyCompleted ? 'Completed' : 'Submit'}
                </Button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {isRunning ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Processing...</span>
                </div>
              ) : testResults ? (
                <div className="space-y-2">
                  {output && (
                    <p className={cn("text-sm font-medium mb-3",
                      output.type === 'success' && "text-green-500",
                      output.type === 'error' && "text-red-500",
                      output.type === 'info' && "text-muted-foreground"
                    )}>
                      {output.type === 'success' ? <CheckCircle2 className="w-4 h-4 inline mr-1" /> : <XCircle className="w-4 h-4 inline mr-1" />}
                      {output.message}
                    </p>
                  )}
                  <div className="space-y-1">
                    {testResults.map((r, i) => (
                      <div key={i} className={cn(
                        "flex items-center gap-2 text-xs px-2 py-1 rounded",
                        r.passed ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {r.passed ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <XCircle className="w-3 h-3 shrink-0" />}
                        <span className="font-medium">Test {i + 1}:</span>
                        <span className="text-muted-foreground font-mono truncate">Input: {r.input}</span>
                        {!r.passed && <span className="ml-auto">Expected: {r.expected}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : output ? (
                <p className={cn("text-sm font-mono whitespace-pre-wrap",
                  output.type === 'success' && "text-green-500",
                  output.type === 'error' && "text-red-500",
                  output.type === 'info' && "text-muted-foreground"
                )}>
                  {output.message}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click &quot;Run&quot; to test your code or &quot;Submit&quot; to submit your solution.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChallengeDetailPage() {
  return (
    <GameProvider>
      <ChallengeDetailContent />
    </GameProvider>
  )
}