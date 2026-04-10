"use client";

/**
 * lib/game-context.tsx  (EXTENDED VERSION)
 *
 * Provides:
 *  - XP / level / streak state (synced from auth user)
 *  - addXp(amount, reason?)      — awards XP locally + persists via API
 *  - completeChallenge(id, xp)   — marks a challenge done locally + API
 *  - completeMission(missionId)  — no-op shim for legacy calls
 *  - addNotification(msg, type)  — lightweight in-app toast queue
 *  - notifications[]             — current notification list
 *  - user                        — re-export of auth user (used by interview pages)
 *  - completedChallengeIds       — Set of challenge IDs already solved
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./auth-context";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  timestamp: number;
}

interface GameState {
  xp: number;
  level: number;
  streak: number;
  rewards: string[];
  soundEnabled: boolean;
  completedChallengeIds: Set<string>;
  notifications: Notification[];
}

interface GameContextType extends Omit<GameState, "completedChallengeIds"> {
  completedChallengeIds: Set<string>;
  /** auth user (forwarded so interview/challenge pages only need one context) */
  user: ReturnType<typeof useAuth>["user"];
  addXp: (amount: number, reason?: string) => Promise<void>;
  completeChallenge: (challengeId: string, xp: number, language?: string) => Promise<void>;
  /** shim — kept so existing call sites don't break */
  completeMission: (missionId: string) => void;
  addNotification: (message: string, type?: Notification["type"]) => void;
  dismissNotification: (id: string) => void;
  toggleSound: () => void;
  refreshGameState: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const GameContext = createContext<GameContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, refreshUserData } = useAuth();

  const [gameState, setGameState] = useState<GameState>({
    xp: 0,
    level: 1,
    streak: 0,
    rewards: [],
    soundEnabled: true,
    completedChallengeIds: new Set(),
    notifications: [],
  });

  // Sync game state when auth user changes
  useEffect(() => {
    if (user) {
      setGameState((prev) => {
        // Build set of completed challenge IDs from user data
        const completedIds = new Set<string>(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (user as any).completedChallenges?.map((c: any) => c.challengeId) ?? []
        );
        return {
          ...prev,
          xp: user.xp ?? user.gameStats?.xp ?? 0,
          level: user.level ?? Math.floor((user.xp ?? 0) / 100) + 1,
          streak: user.streak ?? user.gameStats?.streak ?? 0,
          completedChallengeIds: completedIds,
        };
      });
    }
  }, [user]);

  // Load sound preference
  useEffect(() => {
    const soundPref = localStorage.getItem("soundEnabled");
    if (soundPref !== null) {
      setGameState((prev) => ({ ...prev, soundEnabled: soundPref === "true" }));
    }
  }, []);

  // ── XP award ─────────────────────────────────────────────────────────────

  const addXp = useCallback(
    async (amount: number, reason?: string) => {
      // Optimistic local update
      setGameState((prev) => {
        const newXP = prev.xp + amount;
        const newLevel = Math.floor(newXP / 100) + 1;
        return { ...prev, xp: newXP, level: newLevel };
      });

      // Persist to server
      try {
        await fetch("/api/user/xp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ amount, reason }),
        });
        // Refresh so user object stays in sync
        await refreshUserData();
      } catch (err) {
        console.error("Failed to persist XP:", err);
      }
    },
    [refreshUserData]
  );

  // ── Complete challenge ────────────────────────────────────────────────────

  const completeChallenge = useCallback(
    async (challengeId: string, xp: number, language = "javascript") => {
      // Optimistic update
      setGameState((prev) => {
        const newXP = prev.xp + xp;
        const newLevel = Math.floor(newXP / 100) + 1;
        const newIds = new Set(prev.completedChallengeIds);
        newIds.add(challengeId);
        return { ...prev, xp: newXP, level: newLevel, completedChallengeIds: newIds };
      });

      try {
        await fetch("/api/challenges/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ challengeId, earnedXp: xp, language }),
        });
        await refreshUserData();
      } catch (err) {
        console.error("Failed to persist challenge completion:", err);
      }
    },
    [refreshUserData]
  );

  // ── Mission shim ──────────────────────────────────────────────────────────

  const completeMission = useCallback((missionId: string) => {
    // No-op shim. Real XP is awarded separately via addXp / completeChallenge.
    console.debug("[GameContext] completeMission called (shim):", missionId);
  }, []);

  // ── Notifications ─────────────────────────────────────────────────────────

  const notifIdRef = useRef(0);

  const addNotification = useCallback(
    (message: string, type: Notification["type"] = "success") => {
      const id = `notif_${Date.now()}_${notifIdRef.current++}`;
      const notif: Notification = { id, message, type, timestamp: Date.now() };
      setGameState((prev) => ({
        ...prev,
        notifications: [notif, ...prev.notifications].slice(0, 10),
      }));
      // Auto-dismiss after 4s
      setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          notifications: prev.notifications.filter((n) => n.id !== id),
        }));
      }, 4000);
    },
    []
  );

  const dismissNotification = useCallback((id: string) => {
    setGameState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
    }));
  }, []);

  // ── Sound toggle ──────────────────────────────────────────────────────────

  const toggleSound = useCallback(() => {
    setGameState((prev) => {
      const newVal = !prev.soundEnabled;
      localStorage.setItem("soundEnabled", String(newVal));
      return { ...prev, soundEnabled: newVal };
    });
  }, []);

  // ── Refresh ───────────────────────────────────────────────────────────────

  const refreshGameState = useCallback(async () => {
    await refreshUserData();
  }, [refreshUserData]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <GameContext.Provider
      value={{
        xp: gameState.xp,
        level: gameState.level,
        streak: gameState.streak,
        rewards: gameState.rewards,
        soundEnabled: gameState.soundEnabled,
        completedChallengeIds: gameState.completedChallengeIds,
        notifications: gameState.notifications,
        user,
        addXp,
        completeChallenge,
        completeMission,
        addNotification,
        dismissNotification,
        toggleSound,
        refreshGameState,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
