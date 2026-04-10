/**
 * lib/auth.ts
 *
 * Server-side auth utilities: password hashing, JWT tokens, cookies, and
 * user sanitization. Uses the Web Crypto API (built-in to Node 18+ / Next.js)
 * for hashing and `jose` for JWT signing/verification.
 */

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { User } from '@/lib/db'

// ─── Config ───────────────────────────────────────────────────────────────────

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'change-me-in-production-32-chars!!'
)
const COOKIE_NAME = 'auth_token'

// ─── Password hashing (Web Crypto — no extra deps needed) ────────────────────

async function hashWithSalt(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join('')
  const hashHex = Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, '0')).join('')
  return `${saltHex}:${hashHex}`
}

export async function hashPassword(password: string): Promise<string> {
  return hashWithSalt(password)
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [saltHex, storedHashHex] = stored.split(':')
    const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)))
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    )
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      256
    )
    const hashHex = Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, '0')).join('')
    return hashHex === storedHashHex
  } catch {
    return false
  }
}

// ─── JWT ─────────────────────────────────────────────────────────────────────

export async function createToken(payload: { userId: string; email: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { userId: string; email: string }
  } catch {
    return null
  }
}

// ─── Cookies ─────────────────────────────────────────────────────────────────

export async function setAuthCookie(token: string, rememberMe = false): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7, // 30d or 7d
  })
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

// ─── Current user (reads token from cookie) ──────────────────────────────────

export async function getCurrentUser(): Promise<{ userId: string; email: string } | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}

// ─── Sanitize (strip sensitive fields before sending to client) ───────────────

export function sanitizeUser(user: User): Omit<User, 'password' | 'verificationOTP' | 'otpExpiry'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, verificationOTP, otpExpiry, ...safe } = user
  return safe
}