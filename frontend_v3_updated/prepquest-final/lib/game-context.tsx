"use client";

import {
  createContext, useContext, useState, useEffect,
  useCallback, useRef,
} from "react";
import { useAuth } from "./auth-context";
import { challenges } from "./challenges-data";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  timestamp: number;
}

// ── Adaptive Difficulty Engine ────────────────────────────────────────────────
export interface AdaptiveProfile {
  recentAccuracy: number;       // 0-1, avg of last 5 submissions
  avgSolveTimeMs: number;       // avg ms to solve last 5
  attemptHistory: { correct: boolean; timeMs: number; difficulty: string }[];
  recommendedDifficulty: "easy" | "medium" | "hard";
  efficiencyScore: number;      // 0-100
  xpMultiplier: number;         // 1.0 baseline, up to 2.0
}

interface GameState {
  xp: number;
  level: number;
  streak: number;
  rewards: string[];
  soundEnabled: boolean;
  completedChallengeIds: Set<string>;
  notifications: Notification[];
  adaptive: AdaptiveProfile;
  lastActiveAt: number; // timestamp
}

interface GameContextType extends Omit<GameState, "completedChallengeIds"> {
  completedChallengeIds: Set<string>;
  user: ReturnType<typeof useAuth>["user"];
  addXp: (amount: number, reason?: string) => Promise<void>;
  completeChallenge: (challengeId: string, xp: number, language?: string) => Promise<void>;
  completeMission: (missionId: string) => void;
  addNotification: (message: string, type?: Notification["type"]) => void;
  dismissNotification: (id: string) => void;
  toggleSound: () => void;
  refreshGameState: () => Promise<void>;
  /** Record a submission attempt for the adaptive engine */
  recordAttempt: (correct: boolean, timeMs: number, difficulty: string) => void;
  /** Ping last-active timestamp (call on any user interaction) */
  pingActivity: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const GameContext = createContext<GameContextType | undefined>(undefined);

// ─── Adaptive Engine helpers ──────────────────────────────────────────────────

function computeAdaptive(
  history: AdaptiveProfile["attemptHistory"]
): Omit<AdaptiveProfile, "attemptHistory"> {
  if (history.length === 0) {
    return {
      recentAccuracy: 0.5,
      avgSolveTimeMs: 120_000,
      recommendedDifficulty: "easy",
      efficiencyScore: 50,
      xpMultiplier: 1.0,
    };
  }

  const last5 = history.slice(-5);
  const accuracy = last5.filter(a => a.correct).length / last5.length;
  const avgTime = last5.reduce((s, a) => s + a.timeMs, 0) / last5.length;

  // Efficiency: high accuracy + fast = high score
  const timeFactor = Math.max(0, 1 - avgTime / 300_000); // 5 min cap
  const efficiency = Math.round((accuracy * 0.6 + timeFactor * 0.4) * 100);

  let recommended: "easy" | "medium" | "hard" = "easy";
  if (efficiency >= 75) recommended = "hard";
  else if (efficiency >= 45) recommended = "medium";

  // XP multiplier: reward high efficiency
  const multiplier = parseFloat((1 + (efficiency / 100) * 1.0).toFixed(2));

  return {
    recentAccuracy: accuracy,
    avgSolveTimeMs: avgTime,
    recommendedDifficulty: recommended,
    efficiencyScore: efficiency,
    xpMultiplier: multiplier,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const INACTIVITY_THRESHOLDS = [60_000, 180_000, 300_000]; // 1min, 3min, 5min for demo

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, refreshUserData } = useAuth();

  const [gameState, setGameState] = useState<GameState>({
    xp: 0, level: 1, streak: 0, rewards: [],
    soundEnabled: true,
    completedChallengeIds: new Set(),
    notifications: [],
    adaptive: {
      recentAccuracy: 0.5,
      avgSolveTimeMs: 120_000,
      attemptHistory: [],
      recommendedDifficulty: "easy",
      efficiencyScore: 50,
      xpMultiplier: 1.0,
    },
    lastActiveAt: Date.now(),
  });

  // Sync from auth user
  useEffect(() => {
    if (user) {
      setGameState(prev => {
        const completedIds = new Set<string>(
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

  useEffect(() => {
    const soundPref = localStorage.getItem("soundEnabled");
    if (soundPref !== null) {
      setGameState(prev => ({ ...prev, soundEnabled: soundPref === "true" }));
    }
    // Load persisted adaptive history
    try {
      const saved = localStorage.getItem("adaptiveHistory");
      if (saved) {
        const history = JSON.parse(saved);
        setGameState(prev => ({
          ...prev,
          adaptive: { ...prev.adaptive, attemptHistory: history, ...computeAdaptive(history) },
        }));
      }
    } catch {}
  }, []);

  // ── Inactivity + Streak Nudge Agent ────────────────────────────────────────
  const nudgeSentRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const inactiveMs = Date.now() - gameState.lastActiveAt;

      INACTIVITY_THRESHOLDS.forEach(threshold => {
        if (inactiveMs >= threshold && !nudgeSentRef.current.has(threshold)) {
          nudgeSentRef.current.add(threshold);
          const streak = gameState.streak;

          if (threshold === INACTIVITY_THRESHOLDS[0]) {
            addNotification("👀 Still here? One quick challenge keeps your momentum going.", "info");
          } else if (threshold === INACTIVITY_THRESHOLDS[1]) {
            if (streak > 0) {
              addNotification(`🔥 Your ${streak}-day streak is at risk! Solve one problem to protect it.`, "warning");
            } else {
              addNotification("💡 Ready to level up? Your next challenge is waiting.", "info");
            }
          } else if (threshold === INACTIVITY_THRESHOLDS[2]) {
            if (streak > 0) {
              addNotification(`⚡ Last chance! One problem saves your ${streak}-day streak.`, "warning");
            } else {
              addNotification("🚀 Top performers practice daily. Don't break the habit!", "warning");
            }
          }
        }
      });
    }, 5_000); // check every 5s

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, gameState.lastActiveAt, gameState.streak]);

  // ── pingActivity ───────────────────────────────────────────────────────────
  const pingActivity = useCallback(() => {
    nudgeSentRef.current.clear(); // reset nudge triggers on any activity
    setGameState(prev => ({ ...prev, lastActiveAt: Date.now() }));
  }, []);

  // ── recordAttempt (Adaptive Engine) ───────────────────────────────────────
  const recordAttempt = useCallback((correct: boolean, timeMs: number, difficulty: string) => {
    setGameState(prev => {
      const newHistory = [
        ...prev.adaptive.attemptHistory,
        { correct, timeMs, difficulty },
      ].slice(-20); // keep last 20

      try { localStorage.setItem("adaptiveHistory", JSON.stringify(newHistory)); } catch {}

      const computed = computeAdaptive(newHistory);

      // Show adaptive feedback notification
      if (computed.efficiencyScore >= 75 && prev.adaptive.efficiencyScore < 75) {
        // Just crossed into high efficiency
        setTimeout(() => addNotification(
          `🧠 Adaptive Engine: High efficiency detected! Pushing harder problems your way.`, "info"
        ), 300);
      } else if (computed.efficiencyScore < 40 && prev.adaptive.efficiencyScore >= 40) {
        setTimeout(() => addNotification(
          `💡 Adaptive Engine: Adjusting difficulty down. Let's build confidence first.`, "info"
        ), 300);
      }

      return {
        ...prev,
        adaptive: { ...computed, attemptHistory: newHistory },
      };
    });
  }, []);

  // ── addXp ─────────────────────────────────────────────────────────────────
  const addXp = useCallback(async (amount: number, reason?: string) => {
    // Apply adaptive XP multiplier
    const multiplier = gameState.adaptive.xpMultiplier;
    const boosted = Math.round(amount * multiplier);
    const bonus = boosted - amount;

    setGameState(prev => {
      const newXP = prev.xp + boosted;
      return { ...prev, xp: newXP, level: Math.floor(newXP / 100) + 1 };
    });

    if (bonus > 0) {
      addNotification(`⚡ Efficiency bonus! +${bonus} extra XP (${multiplier}x multiplier)`, "success");
    }

    try {
      await fetch("/api/user/xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: boosted, reason }),
      });
      await refreshUserData();
    } catch (err) {
      console.error("Failed to persist XP:", err);
    }
  }, [gameState.adaptive.xpMultiplier, refreshUserData]);

  // ── completeChallenge ─────────────────────────────────────────────────────
  const completeChallenge = useCallback(
    async (challengeId: string, xp: number, language = "javascript") => {
      const multiplier = gameState.adaptive.xpMultiplier;
      const boosted = Math.round(xp * multiplier);

      setGameState(prev => {
        const newXP = prev.xp + boosted;
        const newIds = new Set(prev.completedChallengeIds);
        newIds.add(challengeId);
        return { ...prev, xp: newXP, level: Math.floor(newXP / 100) + 1, completedChallengeIds: newIds };
      });

      try {
        await fetch("/api/challenges/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ challengeId, earnedXp: boosted, language }),
        });
        await refreshUserData();
      } catch (err) {
        console.error("Failed to persist challenge:", err);
      }
    },
    [gameState.adaptive.xpMultiplier, refreshUserData]
  );

  const completeMission = useCallback((missionId: string) => {
    console.debug("[GameContext] completeMission (shim):", missionId);
  }, []);

  // ── Notifications ─────────────────────────────────────────────────────────
  const notifIdRef = useRef(0);

  const addNotification = useCallback(
    (message: string, type: Notification["type"] = "success") => {
      const id = `notif_${Date.now()}_${notifIdRef.current++}`;
      const notif: Notification = { id, message, type, timestamp: Date.now() };
      setGameState(prev => ({
        ...prev,
        notifications: [notif, ...prev.notifications].slice(0, 10),
      }));
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== id),
        }));
      }, 6000);
    }, []
  );

  const dismissNotification = useCallback((id: string) => {
    setGameState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id),
    }));
  }, []);

  const toggleSound = useCallback(() => {
    setGameState(prev => {
      const newVal = !prev.soundEnabled;
      localStorage.setItem("soundEnabled", String(newVal));
      return { ...prev, soundEnabled: newVal };
    });
  }, []);

  const refreshGameState = useCallback(async () => {
    await refreshUserData();
  }, [refreshUserData]);

  return (
    <GameContext.Provider value={{
      xp: gameState.xp, level: gameState.level, streak: gameState.streak,
      rewards: gameState.rewards, soundEnabled: gameState.soundEnabled,
      completedChallengeIds: gameState.completedChallengeIds,
      notifications: gameState.notifications,
      adaptive: gameState.adaptive,
      lastActiveAt: gameState.lastActiveAt,
      user,
      addXp, completeChallenge, completeMission,
      addNotification, dismissNotification,
      toggleSound, refreshGameState,
      recordAttempt, pingActivity,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
}