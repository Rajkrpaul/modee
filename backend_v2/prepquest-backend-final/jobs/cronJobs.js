const cron = require('node-cron');
const prisma = require('../config/db');
const { runMotivationAgent } = require('../agents/motivationAgent');

/**
 * Reset streaks for users who missed a day
 * Runs daily at 00:05 AM
 */
const resetStreakJob = cron.schedule('5 0 * * *', async () => {
  console.log('⏰ [CronJob] Resetting broken streaks...');
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const result = await prisma.user.updateMany({
      where: {
        lastActiveDate: { lt: twoDaysAgo },
        streak: { gt: 0 },
      },
      data: { streak: 0 },
    });

    console.log(`✅ [CronJob] Streaks reset for ${result.count} users`);
  } catch (err) {
    console.error('❌ [CronJob] Streak reset failed:', err.message);
  }
}, { scheduled: false });

/**
 * Run motivation agent for inactive users
 * Runs every day at 10:00 AM
 */
const motivationJob = cron.schedule('0 10 * * *', async () => {
  console.log('⏰ [CronJob] Running motivation agent...');
  try {
    const result = await runMotivationAgent();
    console.log(`✅ [CronJob] Motivation agent done. Nudged: ${result.nudgedCount}`);
  } catch (err) {
    console.error('❌ [CronJob] Motivation agent failed:', err.message);
  }
}, { scheduled: false });

/**
 * Update skill trends based on job data
 * Runs every Sunday at 2:00 AM
 */
const updateTrendsJob = cron.schedule('0 2 * * 0', async () => {
  console.log('⏰ [CronJob] Updating skill trends...');
  try {
    // In production, this would fetch real data from job boards / APIs
    // For now, we simulate small demand fluctuations
    const trends = await prisma.skillTrend.findMany();

    const updates = trends.map((trend) => {
      const delta = Math.floor(Math.random() * 100) - 20; // -20 to +80
      return prisma.skillTrend.update({
        where: { id: trend.id },
        data: {
          demand: Math.max(0, trend.demand + delta),
          weeklyDelta: delta,
        },
      });
    });

    await Promise.all(updates);
    console.log(`✅ [CronJob] Updated ${trends.length} skill trends`);
  } catch (err) {
    console.error('❌ [CronJob] Trend update failed:', err.message);
  }
}, { scheduled: false });

/**
 * Clean up expired tokens
 * Runs daily at 3:00 AM
 */
const cleanupTokensJob = cron.schedule('0 3 * * *', async () => {
  console.log('⏰ [CronJob] Cleaning up expired tokens...');
  try {
    const now = new Date();
    const [deletedVerification, deletedRefresh] = await Promise.all([
      prisma.verificationToken.deleteMany({ where: { expiresAt: { lt: now } } }),
      prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: now } } }),
    ]);

    // Clean up old blacklisted tokens (older than 24h — access tokens are short-lived)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const deletedBlacklist = await prisma.blacklistedToken.deleteMany({
      where: { createdAt: { lt: oneDayAgo } },
    });

    console.log(
      `✅ [CronJob] Cleaned: ${deletedVerification.count} verification tokens, ` +
      `${deletedRefresh.count} refresh tokens, ${deletedBlacklist.count} blacklisted tokens`
    );
  } catch (err) {
    console.error('❌ [CronJob] Token cleanup failed:', err.message);
  }
}, { scheduled: false });

const startAllJobs = () => {
  resetStreakJob.start();
  motivationJob.start();
  updateTrendsJob.start();
  cleanupTokensJob.start();
  console.log('✅ All cron jobs scheduled');
};

const stopAllJobs = () => {
  resetStreakJob.stop();
  motivationJob.stop();
  updateTrendsJob.stop();
  cleanupTokensJob.stop();
  console.log('🛑 All cron jobs stopped');
};

module.exports = { startAllJobs, stopAllJobs };
