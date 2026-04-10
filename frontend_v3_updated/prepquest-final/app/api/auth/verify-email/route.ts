export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createToken, setAuthCookie, sanitizeUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    // Validation
    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await db.users.findByEmail(email)
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (user.isVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Check OTP
    if (user.verificationOTP !== otp) {
      return NextResponse.json(
        { message: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Check OTP expiry
    if (user.otpExpiry && new Date() > new Date(user.otpExpiry)) {
      return NextResponse.json(
        { message: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Update user as verified
    const updatedUser = await db.users.update(user.id, {
      isVerified: true,
      verificationOTP: undefined,
      otpExpiry: undefined,
    })

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'Failed to verify email' },
        { status: 500 }
      )
    }

    // Create token and set cookie
    const token = await createToken({
      userId: user.id,
      email: user.email,
    })
    await setAuthCookie(token, false)

    return NextResponse.json({
      message: 'Email verified successfully',
      user: sanitizeUser(updatedUser),
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { message: 'An error occurred during verification' },
      { status: 500 }
    )
  }
}
