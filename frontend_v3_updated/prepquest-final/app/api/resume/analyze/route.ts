export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ""

export async function POST(request: NextRequest) {
    try {
        const { resumeData } = await request.json()

        if (!GROQ_API_KEY) {
            return NextResponse.json({ error: 'GROQ_API_KEY is not set' }, { status: 500 })
        }

        const prompt = `You are an expert resume reviewer and career coach. Analyze the following resume data and return a detailed evaluation.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Respond ONLY with a JSON object (no markdown, no explanation outside JSON):
{
  "score": <integer 0-100 overall resume score>,
  "keywordScore": <integer 0-100 for industry keyword usage>,
  "readabilityScore": <integer 0-100 for clarity and structure>,
  "atsScore": <integer 0-100 for ATS compatibility>,
  "strengths": [<up to 4 specific strength strings>],
  "weaknesses": [<up to 3 specific weakness strings>],
  "suggestions": [
    { "category": "<category>", "tip": "<actionable tip>", "priority": "<high|medium|low>" }
  ]
}

Scoring guide:
- score 80-100: Excellent resume ready for top companies
- score 60-79: Good but needs some improvements  
- score 40-59: Average, several areas need work
- score 0-39: Needs significant improvement

Be specific, actionable, and honest. Give real scores based on the actual content provided.`

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 1000,
                temperature: 0.3,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Groq API error:', data)
            throw new Error(`Groq API error: ${response.status}`)
        }

        const rawText = data.choices?.[0]?.message?.content ?? ''
        const jsonMatch = rawText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('Failed to parse AI response')

        const result = JSON.parse(jsonMatch[0])

        return NextResponse.json({
            score: Math.min(100, Math.max(0, Number(result.score) || 0)),
            keywordScore: Math.min(100, Math.max(0, Number(result.keywordScore) || 0)),
            readabilityScore: Math.min(100, Math.max(0, Number(result.readabilityScore) || 0)),
            atsScore: Math.min(100, Math.max(0, Number(result.atsScore) || 0)),
            strengths: Array.isArray(result.strengths) ? result.strengths : [],
            weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
            suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
        })

    } catch (error) {
        console.error('[/api/resume/analyze] error:', error)
        return NextResponse.json({ error: 'Failed to analyze resume' }, { status: 500 })
    }
}