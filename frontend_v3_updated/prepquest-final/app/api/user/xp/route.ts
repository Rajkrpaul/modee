export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db, xpToLevel } from '@/lib/db'

/**
 * POST /api/user/xp
 * Body: { amount: number, reason?: string }
 *
 * Awards XP to the authenticated user and recalculates their level.
 * Returns the updated gameStats.
 */
export async function POST(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()
    if (!tokenPayload) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const amount = Number(body.amount)

    if (!amount || amount <= 0 || !Number.isFinite(amount)) {
      return NextResponse.json({ message: 'Invalid XP amount' }, { status: 400 })
    }

    const user = await db.users.findById(tokenPayload.userId)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const newXp = (user.gameStats.xp ?? 0) + amount
    const newLevel = xpToLevel(newXp)

    const updated = await db.users.update(user.id, {
      gameStats: {
        ...user.gameStats,
        xp: newXp,
      },
    })

    return NextResponse.json({
      message: `+${amount} XP awarded`,
      xp: newXp,
      level: newLevel,
      gameStats: updated?.gameStats,
    })
  } catch (error) {
    console.error('[/api/user/xp] error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
