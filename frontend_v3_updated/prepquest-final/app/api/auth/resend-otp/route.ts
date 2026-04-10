export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { db, generateOTP, sendVerificationEmail } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validation
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await db.users.findByEmail(email)
    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({
        message: 'If an account exists, a new verification code has been sent',
      })
    }

    // Check if already verified
    if (user.isVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Generate new OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Update user
    await db.users.update(user.id, {
      verificationOTP: otp,
      otpExpiry,
    })

    // Send email
    await sendVerificationEmail(email, otp)

    return NextResponse.json({
      message: 'Verification code sent successfully',
    })
  } catch (error) {
    console.error('Resend OTP error:', error)
    return NextResponse.json(
      { message: 'An error occurred while sending the verification code' },
      { status: 500 }
    )
  }
}
