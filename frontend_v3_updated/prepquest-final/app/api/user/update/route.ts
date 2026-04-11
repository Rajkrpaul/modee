export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, sanitizeUser } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()
    if (!tokenPayload) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const user = await db.users.findById(tokenPayload.userId)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, profilePicture, preferences, github, linkedin, portfolio, bio, location, college } = body

    const updates: Record<string, unknown> = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return NextResponse.json({ message: 'Name must be at least 2 characters' }, { status: 400 })
      }
      updates.name = name.trim()
    }

    if (profilePicture !== undefined) updates.profilePicture = profilePicture
    if (preferences !== undefined) updates.preferences = { ...user.preferences, ...preferences }

    // Social links — strip whitespace, allow empty string to clear
    if (github !== undefined) updates.github = github.trim()
    if (linkedin !== undefined) updates.linkedin = linkedin.trim()
    if (portfolio !== undefined) updates.portfolio = portfolio.trim()
    if (bio !== undefined) updates.bio = bio.trim()
    if (location !== undefined) updates.location = location.trim()
    if (college !== undefined) updates.college = college.trim()

    const updatedUser = await db.users.update(user.id, updates)
    if (!updatedUser) {
      return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Profile updated successfully', user: sanitizeUser(updatedUser) })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ message: 'An error occurred while updating profile' }, { status: 500 })
  }
}