export const runtime = 'nodejs';

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db, xpToLevel } from '@/lib/db'

/**
 * GET /api/leaderboard
 *
 * Returns all users ranked by XP (descending).
 * Also includes the current user's rank in the response.
 *
 * Response shape:
 * {
 *   leaderboard: Array<{
 *     rank: number,
 *     id: string,
 *     name: string,
 *     xp: number,
 *     level: number,
 *     streak: number,
 *     challengesCompleted: number,
 *     interviewsCompleted: number,
 *     isCurrentUser: boolean
 *   }>,
 *   currentUserRank: number | null
 * }
 */
export async function GET() {
  try {
    // Current user is optional — leaderboard is publicly visible
    const tokenPayload = await getCurrentUser()

    const allUsers = await db.users.findAll()

    // Sort by XP descending
    const sorted = allUsers
      .filter((u) => u.isVerified)   // only verified users on board
      .sort((a, b) => (b.gameStats?.xp ?? 0) - (a.gameStats?.xp ?? 0))

    const leaderboard = sorted.map((u, idx) => {
      const xp = u.gameStats?.xp ?? 0
      return {
        rank: idx + 1,
        id: u.id,
        name: u.name,
        xp,
        level: xpToLevel(xp),
        streak: u.gameStats?.streak ?? 0,
        challengesCompleted: u.gameStats?.challengesCompleted ?? 0,
        interviewsCompleted: u.gameStats?.interviewsCompleted ?? 0,
        isCurrentUser: tokenPayload ? u.id === tokenPayload.userId : false,
      }
    })

    const currentUserRank =
      leaderboard.find((u) => u.isCurrentUser)?.rank ?? null

    return NextResponse.json({ leaderboard, currentUserRank })
  } catch (error) {
    console.error('[/api/leaderboard] error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
