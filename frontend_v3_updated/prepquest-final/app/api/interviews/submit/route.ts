export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db, xpToLevel, type InterviewSession } from '@/lib/db'

/**
 * POST /api/interviews/submit
 * Body: {
 *   role: string,
 *   difficulty: string,
 *   score: number,         // 0-100
 *   earnedXp: number,
 *   questionsAnswered: number
 * }
 *
 * Saves the interview session to the user's history and awards XP.
 */
export async function POST(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()
    if (!tokenPayload) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { role, difficulty, score, earnedXp, questionsAnswered } = body

    if (!role || !difficulty) {
      return NextResponse.json({ message: 'role and difficulty are required' }, { status: 400 })
    }

    const xpAmount = Number(earnedXp)
    if (!Number.isFinite(xpAmount) || xpAmount < 0) {
      return NextResponse.json({ message: 'Invalid earnedXp' }, { status: 400 })
    }

    const user = await db.users.findById(tokenPayload.userId)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const session: InterviewSession = {
      sessionId: `isess_${Date.now()}`,
      role,
      difficulty,
      score: Number(score) || 0,
      earnedXp: xpAmount,
      questionsAnswered: Number(questionsAnswered) || 1,
      completedAt: new Date().toISOString(),
    }

    const newXp = (user.gameStats.xp ?? 0) + xpAmount
    const newLevel = xpToLevel(newXp)

    await db.users.update(user.id, {
      interviewHistory: [...(user.interviewHistory ?? []), session],
      gameStats: {
        ...user.gameStats,
        xp: newXp,
        interviewsCompleted: (user.gameStats.interviewsCompleted ?? 0) + 1,
      },
    })

    return NextResponse.json({
      message: `Interview saved! +${xpAmount} XP`,
      session,
      xp: newXp,
      level: newLevel,
    })
  } catch (error) {
    console.error('[/api/interviews/submit] error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

/**
 * GET /api/interviews/submit
 * Returns the current user's interview history.
 */
export async function GET() {
  try {
    const tokenPayload = await getCurrentUser()
    if (!tokenPayload) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const user = await db.users.findById(tokenPayload.userId)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      interviewHistory: user.interviewHistory ?? [],
    })
  } catch (error) {
    console.error('[/api/interviews/submit GET] error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
