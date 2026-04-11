export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const { pathTitle, moduleTitle } = await request.json()

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not set' }, { status: 500 })
    }

    const prompt = `You are an expert computer science instructor. Generate a comprehensive, beginner-friendly lesson for the following module.

Learning Path: ${pathTitle}
Module: ${moduleTitle}

Write a complete lesson with:
1. A clear introduction explaining what this topic is
2. Why it's important for technical interviews
3. Core concepts explained simply with examples
4. Code examples where relevant (use plain text code blocks)
5. Common interview questions related to this topic
6. Key takeaways / summary

Format using markdown-style headers (##, ###) and bullet points (-).
Keep it educational, practical, and interview-focused.
Length: 400-600 words.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
        temperature: 0.5,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Groq API error:', data)
      throw new Error(`Groq API error: ${response.status}`)
    }

    const content = data.choices?.[0]?.message?.content ?? 'Failed to generate lesson content.'
    return NextResponse.json({ content })

  } catch (error) {
    console.error('[/api/learning/lesson] error:', error)
    return NextResponse.json({ error: 'Failed to generate lesson' }, { status: 500 })
  }
}