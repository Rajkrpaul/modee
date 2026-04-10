export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const existingUser = await db.users.findByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    // Auto-verify user — no OTP/email required in dev mode
    await db.users.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isVerified: true,   // ← auto-verified
      preferences: {
        theme: 'dark',
        notifications: true,
        soundEffects: true,
        streakVisibility: true,
      },
      gameStats: {
        xp: 0,
        streak: 0,
        longestStreak: 0,
        challengesCompleted: 0,
        interviewsCompleted: 0,
        resumeTasksCompleted: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
      },
      badges: [],
      completedChallenges: [],
      interviewHistory: [],
    })

    console.log(`[DEV] User registered & auto-verified: ${email}`)

    return NextResponse.json({
      message: 'Account created! You can now log in.',
      requiresVerification: false,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
