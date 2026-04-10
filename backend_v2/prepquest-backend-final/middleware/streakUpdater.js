const prisma = require('../config/db');
const { XP_REWARDS } = require('../utils/levelUtils');
const { calculateLevel } = require('../utils/levelUtils');

/**
 * Middleware to update daily streak on authenticated requests
 * Should be used after the `protect` middleware
 */
const updateStreak = async (req, res, next) => {
  try {
    if (!req.user) return next();

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, streak: true, lastActiveDate: true, xp: true },
    });

    if (!user) return next();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!user.lastActiveDate) {
      // First activity
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveDate: today, streak: 1 },
      });
      return next();
    }

    const lastDate = new Date(user.lastActiveDate);
    const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
    const diffDays = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Already active today — no change
      return next();
    }

    if (diffDays === 1) {
      // Consecutive day — extend streak
      const newStreak = user.streak + 1;
      let xpBonus = XP_REWARDS.DAILY_STREAK;

      if (newStreak === 7) xpBonus += XP_REWARDS.STREAK_MILESTONE_7;
      if (newStreak === 30) xpBonus += XP_REWARDS.STREAK_MILESTONE_30;

      const newXp = user.xp + xpBonus;
      const newLevel = calculateLevel(newXp);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          streak: newStreak,
          lastActiveDate: today,
          xp: newXp,
          level: newLevel,
        },
      });
    } else {
      // Streak broken
      await prisma.user.update({
        where: { id: user.id },
        data: { streak: 1, lastActiveDate: today },
      });
    }

    next();
  } catch (err) {
    // Non-critical — don't block the request
    console.error('Streak update error:', err.message);
    next();
  }
};

module.exports = updateStreak;
