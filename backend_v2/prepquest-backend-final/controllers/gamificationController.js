const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { awardXP, getGlobalLeaderboard, getWeeklyLeaderboard } = require('../services/gamificationService');

// ─── ADD XP (Admin or system use) ────────────────────────────────────────────

exports.addXP = catchAsync(async (req, res, next) => {
  const { userId, amount, reason } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return next(new AppError('User not found.', 404));

  const result = await awardXP(userId, amount, reason);

  res.status(200).json({
    status: 'success',
    message: `${amount} XP awarded successfully.`,
    data: result,
  });
});

// ─── COMPLETE TASK ────────────────────────────────────────────────────────────

exports.completeTask = catchAsync(async (req, res, next) => {
  const { taskId } = req.params;
  const { score } = req.body;
  const userId = req.user.id;

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return next(new AppError('Task not found.', 404));

  // Check if already completed
  const existing = await prisma.userTask.findUnique({
    where: { userId_taskId: { userId, taskId } },
  });

  if (existing?.status === 'COMPLETED') {
    return next(new AppError('You have already completed this task.', 400));
  }

  // Upsert user task
  const userTask = await prisma.userTask.upsert({
    where: { userId_taskId: { userId, taskId } },
    update: { status: 'COMPLETED', score, completedAt: new Date() },
    create: { userId, taskId, status: 'COMPLETED', score, completedAt: new Date() },
  });

  // Add task to user's completedTasks array
  await prisma.user.update({
    where: { id: userId },
    data: { completedTasks: { push: taskId } },
  });

  // Award XP
  const xpResult = await awardXP(userId, task.xpReward, `task_completion:${task.title}`);

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId,
      action: 'TASK_COMPLETED',
      meta: { taskId, taskTitle: task.title, score, xpAwarded: task.xpReward },
    },
  });

  res.status(200).json({
    status: 'success',
    message: `Task completed! You earned ${task.xpReward} XP.`,
    data: { userTask, xp: xpResult },
  });
});

// ─── GET LEADERBOARD ─────────────────────────────────────────────────────────

exports.getLeaderboard = catchAsync(async (req, res) => {
  const { type = 'global' } = req.query;

  const leaderboard =
    type === 'weekly' ? await getWeeklyLeaderboard() : await getGlobalLeaderboard();

  // Attach rank
  const ranked = leaderboard.map((user, index) => ({
    rank: index + 1,
    ...user,
  }));

  res.status(200).json({
    status: 'success',
    data: { type, leaderboard: ranked },
  });
});

// ─── GET USER TASKS ───────────────────────────────────────────────────────────

exports.getUserTasks = catchAsync(async (req, res) => {
  const { status } = req.query;

  const tasks = await prisma.userTask.findMany({
    where: {
      userId: req.user.id,
      ...(status && { status }),
    },
    include: { task: true },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    data: { tasks },
  });
});

// ─── GET ALL TASKS ────────────────────────────────────────────────────────────

exports.getAllTasks = catchAsync(async (req, res) => {
  const { category, difficulty } = req.query;

  const tasks = await prisma.task.findMany({
    where: {
      ...(category && { category }),
      ...(difficulty && { difficulty }),
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    data: { tasks },
  });
});

// ─── CREATE TASK (Admin) ──────────────────────────────────────────────────────

exports.createTask = catchAsync(async (req, res) => {
  const { title, description, category, difficulty, xpReward, skills } = req.body;

  const task = await prisma.task.create({
    data: { title, description, category, difficulty, xpReward, skills: skills || [] },
  });

  res.status(201).json({
    status: 'success',
    message: 'Task created successfully.',
    data: { task },
  });
});
