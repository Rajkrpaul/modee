const prisma = require('../config/db');
const { sendStreakNudgeEmail } = require('../services/emailService');
const { getIO } = require('../sockets/socketManager');

/**
 * Motivation Agent
 * Identifies inactive users and sends nudges via email + Socket.IO
 */
const runMotivationAgent = async () => {
  console.log('🤖 Motivation Agent running...');

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  // Find users who were active but haven't logged in for 24-48 hours AND have a streak > 0
  const inactiveUsers = await prisma.user.findMany({
    where: {
      verified: true,
      streak: { gt: 0 },
      lastActiveDate: {
        gte: fortyEightHoursAgo,
        lt: twentyFourHoursAgo,
      },
    },
    select: { id: true, name: true, email: true, streak: true },
  });

  console.log(`🤖 Motivation Agent: Found ${inactiveUsers.length} users to nudge`);

  const nudgePromises = inactiveUsers.map(async (user) => {
    try {
      // Send email nudge
      await sendStreakNudgeEmail(user.email, user.name, user.streak);

      // Real-time nudge if user is connected
      try {
        const io = getIO();
        io.to(`user:${user.id}`).emit('notification', {
          type: 'streak_warning',
          message: `⚠️ Your ${user.streak}-day streak is at risk! Log in to keep it going.`,
          streak: user.streak,
        });
      } catch {
        // Socket may not be initialized — ignore
      }

      // Log nudge activity
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'MOTIVATION_NUDGE',
          meta: { streak: user.streak, method: 'email+socket' },
        },
      });
    } catch (err) {
      console.error(`Motivation nudge failed for ${user.email}:`, err.message);
    }
  });

  await Promise.allSettled(nudgePromises);
  console.log(`✅ Motivation Agent: Nudged ${inactiveUsers.length} users`);

  return { nudgedCount: inactiveUsers.length };
};

/**
 * Nudge a specific user (on-demand)
 */
const nudgeUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, streak: true },
  });

  if (!user) return null;

  try {
    await sendStreakNudgeEmail(user.email, user.name, user.streak);
    return { success: true, userId };
  } catch (err) {
    console.error(`Nudge failed for ${userId}:`, err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { runMotivationAgent, nudgeUser };
