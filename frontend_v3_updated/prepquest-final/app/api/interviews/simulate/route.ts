export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''

export async function POST(request: NextRequest) {
    try {
        const { action, role, difficulty, history, userAnswer } = await request.json()

        if (!GROQ_API_KEY) {
            return NextResponse.json({ error: 'GROQ_API_KEY is not set' }, { status: 500 })
        }

        if (action === 'start') {
            const prompt = `You are a professional technical interviewer conducting a ${difficulty} level interview for a ${role} position. 
Start the interview with a warm greeting and your first interview question. 
Keep it natural and professional. Ask one question only.
Do not say "Question 1:" - just ask it naturally.`

            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 300, temperature: 0.7,
                }),
            })
            const data = await res.json()
            return NextResponse.json({ message: data.choices?.[0]?.message?.content ?? 'Tell me about yourself.' })
        }

        if (action === 'respond') {
            // Get feedback on answer + next question in one call
            const systemPrompt = `You are a professional technical interviewer conducting a ${difficulty} level interview for a ${role} position.
Your job:
1. Give brief, constructive feedback on the candidate's last answer (2-3 sentences, be specific)
2. Give a score from 0-100 for the answer
3. Ask the next interview question (keep it relevant and progressively harder)

Respond in this exact JSON format:
{
  "feedback": "Your feedback here...",
  "score": 75,
  "nextQuestion": "Your next question here..."
}`

            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...history,
                    ],
                    max_tokens: 500, temperature: 0.6,
                }),
            })
            const data = await res.json()
            const raw = data.choices?.[0]?.message?.content ?? '{}'
            const jsonMatch = raw.match(/\{[\s\S]*\}/)
            const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
            return NextResponse.json({
                feedback: parsed.feedback ?? 'Good effort! Keep practicing.',
                score: Math.min(100, Math.max(0, Number(parsed.score) || 60)),
                nextQuestion: parsed.nextQuestion ?? 'Tell me about a challenging project you worked on.',
            })
        }

        if (action === 'finish') {
            const systemPrompt = `You are a professional technical interviewer. The candidate has completed their final answer.
Give final feedback on their last answer (2-3 sentences) and a score.
Then give a brief closing statement thanking them.

Respond in this exact JSON format:
{
  "feedback": "Final feedback here...",
  "score": 75,
  "closing": "Thank you closing statement here..."
}`

            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...history,
                    ],
                    max_tokens: 400, temperature: 0.6,
                }),
            })
            const data = await res.json()
            const raw = data.choices?.[0]?.message?.content ?? '{}'
            const jsonMatch = raw.match(/\{[\s\S]*\}/)
            const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
            return NextResponse.json({
                feedback: parsed.feedback ?? 'Well done completing the session!',
                score: Math.min(100, Math.max(0, Number(parsed.score) || 60)),
                isComplete: true,
            })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error) {
        console.error('[/api/interviews/simulate] error:', error)
        return NextResponse.json({ error: 'Simulation failed' }, { status: 500 })
    }
}