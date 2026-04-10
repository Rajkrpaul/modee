export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/interviews/evaluate
 * Body: {
 *   question: string,
 *   answer: string,
 *   keyPoints: string[],
 *   category: string,
 *   difficulty: string
 * }
 *
 * Uses the Anthropic API (Claude) to evaluate the user's interview answer
 * and return structured feedback.
 *
 * Response:
 * {
 *   score: number,           // 0-100
 *   strengths: string[],
 *   improvements: string[],
 *   keyPointsCovered: string[],
 *   summary: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, answer, keyPoints = [], category = '', difficulty = 'medium' } = body

    if (!question || !answer) {
      return NextResponse.json(
        { message: 'question and answer are required' },
        { status: 400 }
      )
    }

    if (answer.trim().length < 10) {
      return NextResponse.json(
        { message: 'Answer is too short to evaluate' },
        { status: 400 }
      )
    }

    const prompt = `You are an expert technical interviewer evaluating a candidate's answer to an interview question.

Question: ${question}
Category: ${category}
Difficulty: ${difficulty}
Expected key points to cover: ${keyPoints.join(', ') || 'General quality and completeness'}

Candidate's Answer:
"""
${answer}
"""

Evaluate this answer and respond ONLY with a JSON object (no markdown, no explanation outside the JSON):
{
  "score": <integer 0-100>,
  "strengths": [<up to 3 short strength strings>],
  "improvements": [<up to 3 short improvement strings>],
  "keyPointsCovered": [<subset of the key points that were covered>],
  "summary": "<2-sentence overall assessment>"
}

Scoring guide:
- 80-100: Excellent, covers most key points with depth and clarity
- 60-79: Good, covers main points but lacks some depth or examples
- 40-59: Fair, some relevant content but missing important points
- 0-39: Needs significant improvement`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    const rawText = data.content?.map((b: { type: string; text?: string }) => b.text || '').join('') ?? ''

    // Parse the JSON from Claude's response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Failed to parse AI response')

    const evaluation = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      score: Math.min(100, Math.max(0, Number(evaluation.score) || 0)),
      strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
      improvements: Array.isArray(evaluation.improvements) ? evaluation.improvements : [],
      keyPointsCovered: Array.isArray(evaluation.keyPointsCovered) ? evaluation.keyPointsCovered : [],
      summary: evaluation.summary || '',
    })
  } catch (error) {
    console.error('[/api/interviews/evaluate] error:', error)

    // Graceful fallback: simulate evaluation if AI is unavailable
    const body = await request.json().catch(() => ({}))
    const answer = body.answer ?? ''
    const keyPoints: string[] = body.keyPoints ?? []

    const covered = keyPoints.filter((kp: string) =>
      answer.toLowerCase().includes(kp.toLowerCase().split(' ')[0])
    )
    const coverage = keyPoints.length > 0 ? covered.length / keyPoints.length : 0.5
    const lengthScore = Math.min(20, Math.floor(answer.length / 20))
    const score = Math.min(100, Math.round(coverage * 70 + lengthScore))

    return NextResponse.json({
      score,
      strengths: answer.length > 150 ? ['Detailed response provided'] : [],
      improvements: ['Consider expanding your answer with specific examples'],
      keyPointsCovered: covered,
      summary: 'AI evaluation temporarily unavailable. Score estimated from answer content.',
    })
  }
}
