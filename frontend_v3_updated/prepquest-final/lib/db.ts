/**
 * lib/db.ts  (EXTENDED VERSION)
 *
 * File-based persistent database layer.
 * Users are saved to `.data/users.json` so they survive server restarts.
 *
 * ADDITIONS over the original:
 *  - completedChallenges: record of challenge IDs → completion metadata
 *  - interviewHistory:    array of past interview session results
 *  - xp / level fields normalised at top-level (mirrored from gameStats)
 */

import fs from 'fs'
import path from 'path'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserGameStats {
  xp: number
  streak: number
  longestStreak: number
  challengesCompleted: number
  interviewsCompleted: number
  resumeTasksCompleted: number
  lastActiveDate: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  soundEffects: boolean
  streakVisibility: boolean
}

/** One completed challenge entry */
export interface CompletedChallenge {
  challengeId: string
  language: string
  earnedXp: number
  completedAt: string   // ISO string
}

/** One completed interview session entry */
export interface InterviewSession {
  sessionId: string
  role: string
  difficulty: string
  score: number         // 0-100
  earnedXp: number
  questionsAnswered: number
  completedAt: string   // ISO string
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  isVerified: boolean
  verificationOTP?: string
  otpExpiry?: Date
  profilePicture?: string
  preferences: UserPreferences
  gameStats: UserGameStats
  badges: string[]
  completedChallenges: CompletedChallenge[]   // NEW
  interviewHistory: InterviewSession[]         // NEW
  createdAt: Date
  updatedAt: Date
}

// ─── File persistence ─────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), '.data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function loadUsers(): Map<string, User> {
  ensureDataDir()
  if (!fs.existsSync(USERS_FILE)) return new Map()
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8')
    const arr: User[] = JSON.parse(raw)
    const map = new Map<string, User>()
    for (const u of arr) {
      u.createdAt = new Date(u.createdAt)
      u.updatedAt = new Date(u.updatedAt)
      if (u.otpExpiry) u.otpExpiry = new Date(u.otpExpiry)
      // Back-fill new fields for existing users
      if (!u.completedChallenges) u.completedChallenges = []
      if (!u.interviewHistory) u.interviewHistory = []
      map.set(u.id, u)
    }
    return map
  } catch {
    return new Map()
  }
}

function saveUsers(store: Map<string, User>) {
  ensureDataDir()
  fs.writeFileSync(USERS_FILE, JSON.stringify(Array.from(store.values()), null, 2))
}

let idCounter = Date.now()
function generateId(): string {
  return `user_${Date.now()}_${idCounter++}`
}

// ─── users API ────────────────────────────────────────────────────────────────

const users = {
  async findByEmail(email: string): Promise<User | null> {
    const store = loadUsers()
    for (const user of store.values()) {
      if (user.email === email.toLowerCase().trim()) return user
    }
    return null
  },

  async findById(id: string): Promise<User | null> {
    const store = loadUsers()
    return store.get(id) ?? null
  },

  async findAll(): Promise<User[]> {
    const store = loadUsers()
    return Array.from(store.values())
  },

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const store = loadUsers()
    const id = generateId()
    const now = new Date()
    const user: User = {
      ...data,
      id,
      email: data.email.toLowerCase().trim(),
      completedChallenges: data.completedChallenges ?? [],
      interviewHistory: data.interviewHistory ?? [],
      createdAt: now,
      updatedAt: now,
    }
    store.set(id, user)
    saveUsers(store)
    return user
  },

  async update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const store = loadUsers()
    const user = store.get(id)
    if (!user) return null
    const updated: User = { ...user, ...updates, updatedAt: new Date() }
    store.set(id, updated)
    saveUsers(store)
    return updated
  },

  async delete(id: string): Promise<boolean> {
    const store = loadUsers()
    const result = store.delete(id)
    saveUsers(store)
    return result
  },
}

// ─── db export ────────────────────────────────────────────────────────────────

export const db = { users }

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendVerificationEmail(email: string, otp: string): Promise<void> {
  console.log(`\n========================================`)
  console.log(`📧 VERIFICATION EMAIL`)
  console.log(`   To:  ${email}`)
  console.log(`   OTP: ${otp}`)
  console.log(`========================================\n`)
}

/** Calculate level from total XP  (100 XP per level) */
export function xpToLevel(xp: number): number {
  return Math.floor(xp / 100) + 1
}

/** XP progress within the current level */
export function xpWithinLevel(xp: number): number {
  return xp % 100
}
