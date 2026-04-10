export const runtime = 'nodejs';

import { NextResponse } from 'next/server'
import { getCurrentUser, sanitizeUser } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await db.users.findById(tokenPayload.userId)

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: sanitizeUser(user),
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    )
  }
}
