const prisma = require('../config/db');
const { calculateLevel, XP_REWARDS } = require('../utils/levelUtils');
const { getIO } = require('../sockets/socketManager');

/**
 * Award XP to a user, recalculate level, check for new rewards
 * @param {string} userId
 * @param {number} xpAmount
 * @param {string} reason - Label for the activity log
 * @returns {Object} updated user stats + levelUpOccurred
 */
const awardXP = async (userId, xpAmount, reason = 'task_completion') => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true },
  });

  if (!user) throw new Error('User not found');

  const newXP = user.xp + xpAmount;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > user.level;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { xp: newXP, level: newLevel },
    select: { id: true, name: true, xp: true, level: true, streak: true },
  });

  // Log activity
  await prisma.activityLog.create({
    data: { userId, action: 'XP_AWARDED', meta: { xpAmount, reason, newXP, newLevel } },
  });

  // Check and award rewards
  const newRewards = await checkAndAwardRewards(userId, newXP);

  // Emit real-time XP update via Socket.IO
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('xp:updated', {
      xp: newXP,
      level: newLevel,
      xpGained: xpAmount,
      leveledUp,
      newRewards,
    });

    // Broadcast leaderboard update
    io.emit('leaderboard:updated');
  } catch (e) {
    // Socket not initialized yet — ignore
  }

  return { ...updatedUser, leveledUp, xpGained: xpAmount, newRewards };
};

/**
 * Check and award any newly unlocked rewards
 */
const checkAndAwardRewards = async (userId, totalXP) => {
  const allRewards = await prisma.reward.findMany({
    where: { xpThreshold: { lte: totalXP } },
  });

  const earnedRewardIds = (
    await prisma.userReward.findMany({
      where: { userId },
      select: { rewardId: true },
    })
  ).map((r) => r.rewardId);

  const newRewards = allRewards.filter((r) => !earnedRewardIds.includes(r.id));

  if (newRewards.length > 0) {
    await prisma.userReward.createMany({
      data: newRewards.map((r) => ({ userId, rewardId: r.id })),
      skipDuplicates: true,
    });
  }

  return newRewards;
};

/**
 * Get global leaderboard (top 50 by XP)
 */
const getGlobalLeaderboard = async () => {
  return prisma.user.findMany({
    orderBy: { xp: 'desc' },
    take: 50,
    select: { id: true, name: true, xp: true, level: true, streak: true },
  });
};

/**
 * Get weekly leaderboard (top 50 by XP gained this week via activity logs)
 */
const getWeeklyLeaderboard = async () => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Use recent activity to find active users, then rank by total XP
  const activeUserIds = (
    await prisma.activityLog.findMany({
      where: { createdAt: { gte: weekAgo }, action: 'XP_AWARDED' },
      select: { userId: true },
      distinct: ['userId'],
    })
  ).map((l) => l.userId);

  return prisma.user.findMany({
    where: { id: { in: activeUserIds } },
    orderBy: { xp: 'desc' },
    take: 50,
    select: { id: true, name: true, xp: true, level: true, streak: true },
  });
};

module.exports = { awardXP, checkAndAwardRewards, getGlobalLeaderboard, getWeeklyLeaderboard };
