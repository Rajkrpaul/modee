"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { GameProvider, useGame } from '@/lib/game-context'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Brain, Send, RefreshCw, CheckCircle2, Lightbulb,
  Loader2, Mic2, ChevronRight, Award, ArrowLeft,
  Zap, MessageSquare, Play, X, MicOff, Mic,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SimMessage {
  role: 'interviewer' | 'user' | 'feedback'
  content: string
  score?: number
}

interface SessionResult {
  avgScore: number
  xpEarned: number
  questionCount: number
  role: string
}

const ROLES = [
  { id: 'swe', label: 'Software Engineer', topics: 'DSA, problem solving, coding' },
  { id: 'frontend', label: 'Frontend Developer', topics: 'React, CSS, JS, performance' },
  { id: 'backend', label: 'Backend Developer', topics: 'APIs, databases, architecture' },
  { id: 'fullstack', label: 'Full Stack Developer', topics: 'End-to-end systems, web technologies' },
  { id: 'data', label: 'Data Analyst', topics: 'SQL, statistics, Python, visualization' },
  { id: 'system', label: 'System Design', topics: 'Scalability, distributed systems, architecture' },
]

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

// Extend Window type for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

function PracticeContent() {
  const { addXp, addNotification } = useGame()
  const router = useRouter()

  const [phase, setPhase] = useState<'setup' | 'session' | 'complete'>('setup')
  const [selectedRole, setSelectedRole] = useState(ROLES[0])
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium')
  const [messages, setMessages] = useState<SimMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [questionCount, setQuestionCount] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null)

  // Voice
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  const maxQuestions = 5
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Check voice support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      setVoiceSupported(!!SpeechRecognition)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false
      try { recognitionRef.current?.stop() } catch {}
    }
  }, [])

  const isListeningRef = useRef(false)

  const stopVoice = useCallback(() => {
    isListeningRef.current = false
    setIsListening(false)
    try { recognitionRef.current?.stop() } catch {}
  }, [])

  const toggleVoice = useCallback(() => {
    if (!voiceSupported) return

    if (isListeningRef.current) {
      stopVoice()
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    let finalTranscript = ''

    const startRecognition = () => {
      if (!isListeningRef.current) return

      const recognition = new SpeechRecognition()
      recognition.continuous = false // false works more reliably across browsers
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1

      recognition.onresult = (event: any) => {
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += t + ' '
          } else {
            interim = t
          }
        }
        setInput(finalTranscript + interim)
      }

      recognition.onerror = (e: any) => {
        // 'no-speech' is normal — just restart
        if (e.error === 'no-speech' && isListeningRef.current) {
          setTimeout(startRecognition, 100)
          return
        }
        // any other error, stop
        stopVoice()
      }

      recognition.onend = () => {
        // auto-restart as long as mic is still "on"
        if (isListeningRef.current) {
          setTimeout(startRecognition, 100)
        }
      }

      recognitionRef.current = recognition
      try { recognition.start() } catch {}
    }

    isListeningRef.current = true
    setIsListening(true)
    startRecognition()
  }, [voiceSupported, stopVoice])

  const resetSession = useCallback(() => {
    setMessages([])
    setInput('')
    setIsLoading(false)
    setQuestionCount(0)
    setTotalScore(0)
    setSessionResult(null)
    isListeningRef.current = false
    setIsListening(false)
    try { recognitionRef.current?.stop() } catch {}
  }, [])

  const startSession = useCallback(async () => {
    resetSession()
    setPhase('session')
    setIsLoading(true)

    try {
      const res = await fetch('/api/interviews/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          role: selectedRole.label,
          difficulty: selectedDifficulty,
          history: [],
        }),
      })
      const data = await res.json()
      setMessages([{ role: 'interviewer', content: data.message }])
      setQuestionCount(1)
    } catch {
      setMessages([{ role: 'interviewer', content: "Hi! I'm your AI interviewer. Let's start — tell me about yourself and your background." }])
      setQuestionCount(1)
    } finally {
      setIsLoading(false)
    }
  }, [selectedRole, selectedDifficulty, resetSession])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return

    // Stop voice if active
    if (isListening) {
      isListeningRef.current = false
      setIsListening(false)
      try { recognitionRef.current?.stop() } catch {}
    }

    const userMsg: SimMessage = { role: 'user', content: input }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    const sentInput = input
    setInput('')
    setIsLoading(true)

    const isLastQuestion = questionCount >= maxQuestions

    try {
      const res = await fetch('/api/interviews/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isLastQuestion ? 'finish' : 'respond',
          role: selectedRole.label,
          difficulty: selectedDifficulty,
          history: updatedMessages.map(m => ({
            role: m.role === 'interviewer' ? 'assistant' : 'user',
            content: m.content,
          })),
          userAnswer: sentInput,
        }),
      })

      const data = await res.json()
      const score = Math.min(100, Math.max(0, Number(data.score) || 50))
      const earned = Math.round(score / 10) * 5

      const newTotalScore = totalScore + score
      const newMessages: SimMessage[] = [...updatedMessages]

      if (data.feedback) {
        newMessages.push({ role: 'feedback', content: data.feedback, score })
      }

      if (!isLastQuestion && data.nextQuestion) {
        newMessages.push({ role: 'interviewer', content: data.nextQuestion })
        setMessages(newMessages)
        setQuestionCount(prev => prev + 1)
        setTotalScore(newTotalScore)
      } else {
        setMessages(newMessages)
        setTotalScore(newTotalScore)

        const finalAvg = Math.round(newTotalScore / maxQuestions)
        const finalXp = Math.round(newTotalScore / maxQuestions / 10) * maxQuestions * 5

        // Store result BEFORE changing phase
        setSessionResult({
          avgScore: finalAvg,
          xpEarned: finalXp,
          questionCount: maxQuestions,
          role: selectedRole.label,
        })

        setTimeout(() => setPhase('complete'), 800)
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'interviewer',
        content: "Great answer! Let me ask you something else. Can you walk me through a challenging technical problem you solved recently?",
      }])
      setQuestionCount(prev => prev + 1)
    } finally {
      setIsLoading(false)
    }
  }, [input, messages, isLoading, questionCount, totalScore, selectedRole, selectedDifficulty, isListening])

  // Award XP once when complete phase mounts
  useEffect(() => {
    if (phase === 'complete' && sessionResult) {
      addXp(sessionResult.xpEarned, 'Interview simulation completed')
      addNotification(`Interview complete! Avg Score: ${sessionResult.avgScore}% · +${sessionResult.xpEarned} XP`, 'success')
    }
  }, [phase]) // only trigger on phase change, not every render

  // ── SETUP ──
  if (phase === 'setup') {
    return (
      <DashboardLayout title="AI Interview Simulation" subtitle="Practice with a real-time AI interviewer">
        <div className="max-w-2xl mx-auto space-y-8 p-4">
          <Link href="/interviews">
            <Button variant="ghost" className="gap-2 mb-2"><ArrowLeft className="w-4 h-4" />Back</Button>
          </Link>

          <div className="glass rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Configure Your Session</h2>
                <p className="text-muted-foreground">5 questions · AI feedback after each answer · Voice supported</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Select Role</h3>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(role => (
                  <button key={role.id} onClick={() => setSelectedRole(role)}
                    className={cn("p-4 rounded-xl border text-left transition-all",
                      selectedRole.id === role.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/30 hover:border-primary/50"
                    )}>
                    <div className="font-medium text-sm">{role.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{role.topics}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Difficulty</h3>
              <div className="flex gap-3">
                {DIFFICULTIES.map(d => (
                  <button key={d} onClick={() => setSelectedDifficulty(d)}
                    className={cn("flex-1 py-3 rounded-xl border font-medium transition-all",
                      selectedDifficulty === d
                        ? d === 'Easy' ? "border-green-500 bg-green-500/10 text-green-500"
                          : d === 'Medium' ? "border-yellow-500 bg-yellow-500/10 text-yellow-500"
                          : "border-red-500 bg-red-500/10 text-red-500"
                        : "border-border bg-muted/30 hover:border-primary/50"
                    )}>{d}</button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-muted-foreground space-y-1">
              <p className="flex items-center gap-2"><Mic2 className="w-4 h-4 text-primary" /><strong>Role:</strong> {selectedRole.label}</p>
              <p className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /><strong>Difficulty:</strong> {selectedDifficulty}</p>
              <p className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" /><strong>Questions:</strong> {maxQuestions} with live AI feedback</p>
              {voiceSupported && (
                <p className="flex items-center gap-2"><Mic className="w-4 h-4 text-green-500" /><strong className="text-green-500">Voice input supported</strong> — use mic button to speak your answers</p>
              )}
            </div>

            <Button onClick={startSession} className="w-full gap-2 h-12 text-base">
              <Play className="w-5 h-5" />Start Interview Session
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // ── COMPLETE ──
  if (phase === 'complete' && sessionResult) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto p-6 space-y-6">
          <div className="glass rounded-2xl p-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Session Complete!</h2>
            <p className="text-muted-foreground">You completed a {sessionResult.role} interview simulation</p>

            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="p-3 rounded-xl bg-muted/50">
                <div className={cn("text-2xl font-bold",
                  sessionResult.avgScore >= 70 ? "text-green-500" :
                  sessionResult.avgScore >= 50 ? "text-yellow-500" : "text-red-500"
                )}>{sessionResult.avgScore}%</div>
                <div className="text-xs text-muted-foreground">Avg Score</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <div className="text-2xl font-bold text-primary">{sessionResult.questionCount}</div>
                <div className="text-xs text-muted-foreground">Questions</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <div className="text-2xl font-bold text-yellow-500">+{sessionResult.xpEarned}</div>
                <div className="text-xs text-muted-foreground">XP Earned</div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => {
                  resetSession()
                  setPhase('setup')
                }}
                variant="outline"
                className="flex-1 gap-2"
              >
                <RefreshCw className="w-4 h-4" />Try Again
              </Button>
              <Button
                onClick={() => router.push('/interviews')}
                className="flex-1 gap-2"
              >
                <ChevronRight className="w-4 h-4" />More Practice
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // ── SESSION ──
  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm">{selectedRole.label} Interview</div>
              <div className="text-xs text-muted-foreground">{selectedDifficulty} · Question {Math.min(questionCount, maxQuestions)}/{maxQuestions}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: maxQuestions }).map((_, i) => (
                <div key={i} className={cn("w-2 h-2 rounded-full transition-all",
                  i < questionCount ? "bg-primary" : "bg-muted"
                )} />
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => { resetSession(); setPhase('setup') }} className="gap-1 text-xs">
              <X className="w-3 h-3" />End
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
              {msg.role !== 'user' && (
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mr-3 shrink-0 mt-1",
                  msg.role === 'feedback' ? "bg-yellow-500/20" : "bg-gradient-to-br from-primary to-secondary"
                )}>
                  {msg.role === 'feedback'
                    ? <Lightbulb className="w-4 h-4 text-yellow-500" />
                    : <Brain className="w-4 h-4 text-white" />}
                </div>
              )}
              <div className={cn("max-w-[75%] rounded-2xl px-4 py-3 text-sm",
                msg.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-sm" :
                msg.role === 'feedback' ? "bg-yellow-500/10 border border-yellow-500/20 text-foreground rounded-tl-sm" :
                "bg-muted text-foreground rounded-tl-sm"
              )}>
                {msg.role === 'feedback' && (
                  <div className="flex items-center gap-2 mb-2 font-semibold text-yellow-500">
                    AI Feedback
                    {msg.score !== undefined && (
                      <span className={cn("ml-auto font-bold text-base",
                        msg.score >= 70 ? "text-green-500" :
                        msg.score >= 50 ? "text-yellow-500" : "text-red-400"
                      )}>{msg.score}%</span>
                    )}
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mr-3 shrink-0">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-background/50">
          {isListening && (
            <div className="flex items-center gap-2 mb-2 px-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-red-400 font-medium">Listening... speak now</span>
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder={isListening ? "Listening... speak your answer" : "Type your answer or use the mic... (Enter to send)"}
              className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 max-h-32"
              rows={2}
              disabled={isLoading}
            />
            <div className="flex flex-col gap-2 self-end">
              {voiceSupported && (
                <Button
                  type="button"
                  variant={isListening ? "destructive" : "outline"}
                  onClick={toggleVoice}
                  disabled={isLoading}
                  className="h-11 w-11 p-0 shrink-0"
                  title={isListening ? "Stop recording" : "Start voice input"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              )}
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="h-11 w-11 p-0 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {voiceSupported ? "🎤 Voice enabled — click mic to speak your answer" : "Speak naturally as if in a real interview"}
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function PracticePage() {
  return (
    <GameProvider>
      <PracticeContent />
    </GameProvider>
  )
}