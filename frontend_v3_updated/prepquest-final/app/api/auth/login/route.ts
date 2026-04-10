export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createToken, setAuthCookie, sanitizeUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, rememberMe = false } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await db.users.findByEmail(email)
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if email is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { 
          message: 'Please verify your email before logging in',
          requiresVerification: true,
        },
        { status: 403 }
      )
    }

    // Update last active date and streak
    const today = new Date().toISOString().split('T')[0]
    const lastActive = user.gameStats.lastActiveDate
    let newStreak = user.gameStats.streak

    if (lastActive !== today) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      if (lastActive === yesterday) {
        newStreak += 1
      } else {
        newStreak = 1
      }
    }

    await db.users.update(user.id, {
      gameStats: {
        ...user.gameStats,
        streak: newStreak,
        longestStreak: Math.max(newStreak, user.gameStats.longestStreak),
        lastActiveDate: today,
      },
    })

    // Create token and set cookie
    const token = await createToken({
      userId: user.id,
      email: user.email,
    })
    await setAuthCookie(token, rememberMe)

    return NextResponse.json({
      message: 'Login successful',
      user: sanitizeUser(user),
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
