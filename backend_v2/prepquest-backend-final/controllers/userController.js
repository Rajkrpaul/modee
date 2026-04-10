const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { xpForNextLevel, cumulativeXPForLevel } = require('../utils/levelUtils');

// ─── GET PROFILE ──────────────────────────────────────────────────────────────

exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      verified: true,
      xp: true,
      level: true,
      streak: true,
      skills: true,
      completedTasks: true,
      lastActiveDate: true,
      createdAt: true,
      rewards: {
        include: { reward: true },
        orderBy: { earnedAt: 'desc' },
      },
    },
  });

  if (!user) return next(new AppError('User not found.', 404));

  const nextLevelXP = xpForNextLevel(user.level);
  const levelStartXP = cumulativeXPForLevel(user.level);
  const progressXP = user.xp - levelStartXP;

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        ...user,
        xpProgress: {
          current: progressXP,
          required: nextLevelXP,
          percentage: Math.floor((progressXP / nextLevelXP) * 100),
        },
      },
    },
  });
});

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────

exports.updateProfile = catchAsync(async (req, res, next) => {
  const { name, skills } = req.body;

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(name && { name }),
      ...(skills && { skills }),
    },
    select: { id: true, name: true, email: true, skills: true, updatedAt: true },
  });

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully.',
    data: { user: updated },
  });
});

// ─── GET ACTIVITY LOG ─────────────────────────────────────────────────────────

exports.getActivityLog = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.activityLog.count({ where: { userId: req.user.id } }),
  ]);

  res.status(200).json({
    status: 'success',
    data: { logs, total, page, pages: Math.ceil(total / limit) },
  });
});

// ─── GET STATS ────────────────────────────────────────────────────────────────

exports.getStats = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const [totalTasks, completedTasks, totalXPLogs, rewards] = await Promise.all([
    prisma.userTask.count({ where: { userId } }),
    prisma.userTask.count({ where: { userId, status: 'COMPLETED' } }),
    prisma.activityLog.findMany({
      where: { userId, action: 'XP_AWARDED' },
      select: { meta: true, createdAt: true },
    }),
    prisma.userReward.count({ where: { userId } }),
  ]);

  const completionRate =
    totalTasks > 0 ? Math.floor((completedTasks / totalTasks) * 100) : 0;

  // XP over last 7 days
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentXP = totalXPLogs
    .filter((l) => new Date(l.createdAt) >= weekAgo)
    .reduce((sum, l) => sum + (l.meta?.xpAmount || 0), 0);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalTasks,
        completedTasks,
        completionRate,
        recentXP,
        rewards,
        currentStreak: req.user.streak,
        level: req.user.level,
        xp: req.user.xp,
      },
    },
  });
});

// ─── ADMIN: GET ALL USERS ─────────────────────────────────────────────────────

exports.getAllUsers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        xp: true,
        level: true,
        streak: true,
        createdAt: true,
      },
    }),
    prisma.user.count(),
  ]);

  res.status(200).json({
    status: 'success',
    data: { users, total, page, pages: Math.ceil(total / limit) },
  });
});
