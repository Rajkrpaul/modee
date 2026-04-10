"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  profilePicture?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    soundEffects?: boolean;
    streakVisibility?: boolean;
  };
  gameStats?: {
    xp: number;
    streak: number;
    longestStreak: number;
    challengesCompleted: number;
    interviewsCompleted: number;
    resumeTasksCompleted: number;
    lastActiveDate: string;
  };
  badges?: string[];
  // Game data fields
  completedChallenges?: Array<{ challengeId: string; language: string; earnedXp: number; completedAt: string }>;
  interviewHistory?: Array<{ sessionId: string; role: string; difficulty: string; score: number; earnedXp: number; questionsAnswered: number; completedAt: string }>;
  // Legacy compat fields for any component that uses these
  role?: string;
  xp?: number;
  level?: number;
  streak?: number;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string; data?: any }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; data?: any }>;
  updateUser: (updates: Record<string, any>) => Promise<{ success: boolean; message?: string; data?: any }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  deleteAccount: (password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  resendOTP: (email: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper: normalize user shape (bridges gameStats fields to top-level for legacy components)
  const normalizeUser = (raw: any): User => ({
    ...raw,
    xp: raw.xp ?? raw.gameStats?.xp ?? 0,
    level: raw.level ?? 1,
    streak: raw.streak ?? raw.gameStats?.streak ?? 0,
    role: raw.role ?? 'STUDENT',
  });

  // Load user from /api/auth/me on mount (validates cookie)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(normalizeUser(data.user));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // Register
  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Registration failed' };
      return { success: true, data };
    } catch {
      return { success: false, message: 'Server error. Please try again.' };
    }
  };

  // Login
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Login failed' };
      const normalized = normalizeUser(data.user);
      setUser(normalized);
      return { success: true, data };
    } catch {
      return { success: false, message: 'Server error. Please try again.' };
    }
  };

  // Update user profile
  const updateUser = async (updates: Record<string, any>) => {
    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Update failed' };
      setUser(normalizeUser(data.user));
      return { success: true, data };
    } catch {
      return { success: false, message: 'Server error. Please try again.' };
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Password change failed' };
      return { success: true };
    } catch {
      return { success: false, message: 'Server error. Please try again.' };
    }
  };

  // Delete account
  const deleteAccount = async (password: string) => {
    try {
      const res = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Delete failed' };
      setUser(null);
      return { success: true };
    } catch {
      return { success: false, message: 'Server error. Please try again.' };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}
    setUser(null);
  };

  // Refresh user data from server
  const refreshUserData = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(normalizeUser(data.user));
      }
    } catch {}
  };

  // Verify email OTP (no-op in dev — users are auto-verified)
  const verifyEmail = async (email: string, otp: string) => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Verification failed' };
      return { success: true };
    } catch {
      return { success: false, message: 'Server error. Please try again.' };
    }
  };

  // Resend OTP
  const resendOTP = async (email: string) => {
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Failed to resend OTP' };
      return { success: true };
    } catch {
      return { success: false, message: 'Server error. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        register,
        login,
        updateUser,
        changePassword,
        deleteAccount,
        logout,
        refreshUserData,
        verifyEmail,
        resendOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
