export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, verifyPassword, clearAuthCookie } from '@/lib/auth'

export async function DELETE(request: NextRequest) {
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

    const body = await request.json()
    const { password } = body

    // Validation
    if (!password) {
      return NextResponse.json(
        { message: 'Password is required to delete account' },
        { status: 400 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Incorrect password' },
        { status: 400 }
      )
    }

    // Delete user
    const deleted = await db.users.delete(user.id)
    
    if (!deleted) {
      return NextResponse.json(
        { message: 'Failed to delete account' },
        { status: 500 }
      )
    }

    // Clear auth cookie
    await clearAuthCookie()

    return NextResponse.json({
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { message: 'An error occurred while deleting account' },
      { status: 500 }
    )
  }
}
