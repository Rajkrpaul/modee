export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db, xpToLevel, type CompletedChallenge } from '@/lib/db'

/**
 * POST /api/challenges/complete
 * Body: { challengeId: string, earnedXp: number, language?: string }
 *
 * - Idempotent: calling it twice for the same challenge returns success
 *   but does NOT award XP a second time.
 * - Updates completedChallenges[] and gameStats.xp / challengesCompleted.
 */
export async function POST(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()
    if (!tokenPayload) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { challengeId, earnedXp, language = 'javascript' } = body

    if (!challengeId || typeof challengeId !== 'string') {
      return NextResponse.json({ message: 'challengeId is required' }, { status: 400 })
    }
    const xpAmount = Number(earnedXp)
    if (!Number.isFinite(xpAmount) || xpAmount < 0) {
      return NextResponse.json({ message: 'Invalid earnedXp' }, { status: 400 })
    }

    const user = await db.users.findById(tokenPayload.userId)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Idempotency check
    const alreadyCompleted = (user.completedChallenges ?? []).some(
      (c) => c.challengeId === challengeId
    )
    if (alreadyCompleted) {
      return NextResponse.json({
        message: 'Challenge already completed',
        alreadyCompleted: true,
        xp: user.gameStats.xp,
        level: xpToLevel(user.gameStats.xp),
      })
    }

    const newEntry: CompletedChallenge = {
      challengeId,
      language,
      earnedXp: xpAmount,
      completedAt: new Date().toISOString(),
    }

    const newXp = (user.gameStats.xp ?? 0) + xpAmount
    const newLevel = xpToLevel(newXp)

    await db.users.update(user.id, {
      completedChallenges: [...(user.completedChallenges ?? []), newEntry],
      gameStats: {
        ...user.gameStats,
        xp: newXp,
        challengesCompleted: (user.gameStats.challengesCompleted ?? 0) + 1,
      },
    })

    return NextResponse.json({
      message: `Challenge completed! +${xpAmount} XP`,
      xp: newXp,
      level: newLevel,
      earnedXp: xpAmount,
    })
  } catch (error) {
    console.error('[/api/challenges/complete] error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

/**
 * GET /api/challenges/complete?userId=...  (optional)
 * Returns the list of completed challenge IDs for the current user.
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
      completedChallenges: user.completedChallenges ?? [],
    })
  } catch (error) {
    console.error('[/api/challenges/complete GET] error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
