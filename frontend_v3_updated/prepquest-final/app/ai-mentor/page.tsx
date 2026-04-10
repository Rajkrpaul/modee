"use client"

import { useState, useRef, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Bot,
  Send,
  Sparkles,
  Code,
  BookOpen,
  Lightbulb,
  Target,
  TrendingUp,
  Brain,
  Zap,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  History,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
}

const quickActions = [
  { icon: Code, label: "Explain a concept", prompt: "Explain dynamic programming" },
  { icon: BookOpen, label: "Review my code", prompt: "Review my code" },
  { icon: Target, label: "Interview prep", prompt: "FAANG interview prep" },
  { icon: Lightbulb, label: "Problem hints", prompt: "Give me hints" },
]

export default function AIMentorPage() {
  const initialMessage: Message = {
    id: "1",
    role: "assistant",
    content:
      "Hey there! I'm your AI Mentor 🚀 Ready to help you crack placements. What shall we conquer today?",
    timestamp: new Date(),
    suggestions: ["Explain DP", "Mock interview", "Review code"],
  }

  const [messages, setMessages] = useState<Message[]>([initialMessage])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleSend = async (content?: string) => {
    if (isLoading) return

    const messageContent = content || input
    if (!messageContent.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    timeoutRef.current = setTimeout(() => {
      const lower = messageContent.toLowerCase()

      let response = {
        content: "I can help with that! What exactly do you want to explore?",
        suggestions: ["Explain DP", "Mock interview"],
      }

      if (lower.includes("dp")) {
        response = {
          content: "Dynamic Programming is about solving subproblems and storing results.",
          suggestions: ["Knapsack", "LCS", "DP roadmap"],
        }
      } else if (lower.includes("interview")) {
        response = {
          content: "Let's prepare for interviews 💼 Start with DSA + mock rounds.",
          suggestions: ["Mock interview", "System design"],
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
      }

      setMessages((prev) => [...prev, botMessage])
      setIsLoading(false)
    }, 1200)
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Sidebar */}
        <div className="hidden lg:flex w-72 flex-col border-r p-4">
          <Button
            onClick={() => setMessages(() => [initialMessage])}
            className="mb-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            New Chat
          </Button>

          {quickActions.map((a, i) => (
            <Button key={i} onClick={() => handleSend(a.prompt)} className="mb-2">
              <a.icon className="w-4 h-4 mr-2" />
              {a.label}
            </Button>
          ))}
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <Avatar>
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                )}

                <div className="max-w-[70%]">
                  <div className={`p-3 rounded-lg ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100"}`}>
                    {msg.content}
                  </div>

                  {msg.suggestions && (
                    <div className="flex gap-2 mt-2">
                      {msg.suggestions.map((s, i) => (
                        <Button key={i} size="sm" onClick={() => handleSend(s)}>
                          {s} <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && <div>Thinking... 🤖</div>}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />

            <Button onClick={() => handleSend()} disabled={isLoading}>
              <Send />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}