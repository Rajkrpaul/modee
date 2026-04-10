const prisma = require('../config/db');
const catchAsync = require('../utils/catchAsync');

// Seed data for demo purposes
const MOCK_SKILL_TRENDS = [
  { skill: 'Data Structures & Algorithms', demand: 9800, weeklyDelta: 120 },
  { skill: 'System Design', demand: 7500, weeklyDelta: 95 },
  { skill: 'React.js', demand: 6800, weeklyDelta: 80 },
  { skill: 'Node.js', demand: 5900, weeklyDelta: 60 },
  { skill: 'Python', demand: 8200, weeklyDelta: 110 },
  { skill: 'Machine Learning', demand: 7100, weeklyDelta: 150 },
  { skill: 'SQL & Databases', demand: 6400, weeklyDelta: 40 },
  { skill: 'Cloud (AWS/GCP/Azure)', demand: 6900, weeklyDelta: 200 },
  { skill: 'Docker & Kubernetes', demand: 5200, weeklyDelta: 180 },
  { skill: 'TypeScript', demand: 5600, weeklyDelta: 220 },
  { skill: 'GraphQL', demand: 3200, weeklyDelta: 90 },
  { skill: 'Cybersecurity', demand: 4100, weeklyDelta: 130 },
];

const MOCK_JOB_TRENDS = [
  {
    company: 'Google',
    role: 'Software Engineer (L3)',
    skills: ['DSA', 'System Design', 'Python', 'Go'],
  },
  {
    company: 'Microsoft',
    role: 'Software Development Engineer',
    skills: ['DSA', 'C#', 'Azure', 'System Design'],
  },
  {
    company: 'Amazon',
    role: 'SDE-1',
    skills: ['DSA', 'Java', 'AWS', 'Leadership Principles'],
  },
  {
    company: 'Meta',
    role: 'Software Engineer',
    skills: ['DSA', 'React', 'System Design', 'PHP/Hack'],
  },
  {
    company: 'Flipkart',
    role: 'SDE-1',
    skills: ['DSA', 'Java/Python', 'System Design', 'MySQL'],
  },
  {
    company: 'Razorpay',
    role: 'Backend Engineer',
    skills: ['Node.js', 'Go', 'PostgreSQL', 'Redis', 'Kafka'],
  },
  {
    company: 'Swiggy',
    role: 'Software Engineer',
    skills: ['DSA', 'Java', 'Microservices', 'Kafka'],
  },
  {
    company: 'Zomato',
    role: 'Backend Engineer',
    skills: ['Python', 'Django', 'System Design', 'Redis'],
  },
];

// ─── GET SKILL TRENDS ─────────────────────────────────────────────────────────

exports.getSkillTrends = catchAsync(async (req, res) => {
  // Try DB first, fall back to mock data
  let trends = await prisma.skillTrend.findMany({
    orderBy: { demand: 'desc' },
  });

  if (trends.length === 0) {
    // Seed mock data into DB if empty
    await prisma.skillTrend.createMany({
      data: MOCK_SKILL_TRENDS,
      skipDuplicates: true,
    });
    trends = await prisma.skillTrend.findMany({ orderBy: { demand: 'desc' } });
  }

  res.status(200).json({
    status: 'success',
    data: {
      trends,
      lastUpdated: new Date(),
    },
  });
});

// ─── GET JOB TRENDS ───────────────────────────────────────────────────────────

exports.getJobTrends = catchAsync(async (req, res) => {
  const { company, role } = req.query;

  let jobs = await prisma.jobTrend.findMany({
    where: {
      ...(company && { company: { contains: company, mode: 'insensitive' } }),
      ...(role && { role: { contains: role, mode: 'insensitive' } }),
    },
    orderBy: { postedAt: 'desc' },
    take: 50,
  });

  if (jobs.length === 0) {
    // Seed mock job trends
    await prisma.jobTrend.createMany({
      data: MOCK_JOB_TRENDS.map((j) => ({
        ...j,
        postedAt: new Date(),
      })),
    });
    jobs = await prisma.jobTrend.findMany({ orderBy: { postedAt: 'desc' }, take: 50 });
  }

  // Aggregate most required skills across all jobs
  const skillFrequency = {};
  jobs.forEach((job) => {
    job.skills.forEach((skill) => {
      skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
    });
  });

  const topSkills = Object.entries(skillFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));

  res.status(200).json({
    status: 'success',
    data: { jobs, topSkills },
  });
});

// ─── GET USER PROGRESS ANALYTICS ─────────────────────────────────────────────

exports.getUserAnalytics = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [taskStats, xpLogs, skillCoverage] = await Promise.all([
    // Task completion by category
    prisma.userTask.findMany({
      where: { userId, status: 'COMPLETED' },
      include: { task: { select: { category: true, difficulty: true, skills: true } } },
    }),
    // XP over time
    prisma.activityLog.findMany({
      where: {
        userId,
        action: 'XP_AWARDED',
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true, meta: true },
    }),
    // User's current skills
    prisma.user.findUnique({
      where: { id: userId },
      select: { skills: true },
    }),
  ]);

  // Group tasks by category
  const categoryBreakdown = {};
  taskStats.forEach((ut) => {
    const cat = ut.task.category;
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
  });

  // Group XP by day
  const dailyXP = {};
  xpLogs.forEach((log) => {
    const day = new Date(log.createdAt).toISOString().split('T')[0];
    dailyXP[day] = (dailyXP[day] || 0) + (log.meta?.xpAmount || 0);
  });

  // Identify weak areas (categories with fewer completions)
  const totalByCategory = Object.entries(categoryBreakdown);
  totalByCategory.sort(([, a], [, b]) => a - b);
  const weakAreas = totalByCategory.slice(0, 3).map(([cat]) => cat);

  res.status(200).json({
    status: 'success',
    data: {
      categoryBreakdown,
      dailyXP,
      weakAreas,
      skills: skillCoverage?.skills || [],
      totalCompleted: taskStats.length,
    },
  });
});
