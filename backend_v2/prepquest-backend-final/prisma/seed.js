const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Admin User ──────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@placementprep.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@placementprep.com',
      password: adminPassword,
      role: 'ADMIN',
      verified: true,
      xp: 9999,
      level: 10,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // ─── Demo Student ─────────────────────────────────────────────────────────────
  const studentPassword = await bcrypt.hash('Student@1234', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@demo.com' },
    update: {},
    create: {
      name: 'Demo Student',
      email: 'student@demo.com',
      password: studentPassword,
      verified: true,
      xp: 250,
      level: 3,
      streak: 5,
      skills: ['JavaScript', 'Python', 'Data Structures'],
    },
  });
  console.log('✅ Demo student created:', student.email);

  // ─── Rewards ─────────────────────────────────────────────────────────────────
  const rewards = [
    { name: 'First Steps', description: 'Earn your first 50 XP', xpThreshold: 50, badgeIcon: '🌱' },
    { name: 'Getting Started', description: 'Reach 200 XP', xpThreshold: 200, badgeIcon: '⭐' },
    { name: 'Rising Star', description: 'Reach 500 XP', xpThreshold: 500, badgeIcon: '🌟' },
    { name: 'Intermediate', description: 'Reach 1000 XP', xpThreshold: 1000, badgeIcon: '🏅' },
    { name: 'Advanced Coder', description: 'Reach 2500 XP', xpThreshold: 2500, badgeIcon: '🥇' },
    { name: 'Expert', description: 'Reach 5000 XP', xpThreshold: 5000, badgeIcon: '🏆' },
    { name: 'Legend', description: 'Reach 10000 XP', xpThreshold: 10000, badgeIcon: '👑' },
  ];

  for (const reward of rewards) {
    await prisma.reward.upsert({
      where: { name: reward.name },
      update: {},
      create: reward,
    }).catch(() => {});
  }
  console.log(`✅ ${rewards.length} rewards seeded`);

  // ─── Sample Tasks ─────────────────────────────────────────────────────────────
  const tasks = [
    {
      title: 'Implement Binary Search',
      description: 'Write a binary search algorithm and analyze its time complexity.',
      category: 'Data Structures & Algorithms',
      difficulty: 'EASY',
      xpReward: 10,
      skills: ['Data Structures', 'Algorithms', 'Python'],
    },
    {
      title: 'Design a URL Shortener System',
      description: 'Design a scalable URL shortening service like bit.ly. Cover database schema, API design, and caching.',
      category: 'System Design',
      difficulty: 'HARD',
      xpReward: 50,
      skills: ['System Design', 'Databases', 'Caching', 'API Design'],
    },
    {
      title: 'Build a REST API with Express',
      description: 'Create a CRUD REST API for a todo application using Node.js and Express with proper error handling.',
      category: 'Backend Development',
      difficulty: 'MEDIUM',
      xpReward: 25,
      skills: ['Node.js', 'Express', 'REST API', 'JavaScript'],
    },
    {
      title: 'Dynamic Programming: Knapsack',
      description: 'Solve the 0/1 Knapsack problem using dynamic programming.',
      category: 'Data Structures & Algorithms',
      difficulty: 'HARD',
      xpReward: 50,
      skills: ['Dynamic Programming', 'Algorithms', 'Python'],
    },
    {
      title: 'SQL Joins and Aggregations',
      description: 'Practice complex SQL queries involving multiple joins, aggregations, and subqueries.',
      category: 'Databases',
      difficulty: 'MEDIUM',
      xpReward: 25,
      skills: ['SQL', 'PostgreSQL', 'Databases'],
    },
    {
      title: 'React Todo App with Hooks',
      description: 'Build a todo app using React hooks: useState, useEffect, useContext.',
      category: 'Frontend Development',
      difficulty: 'EASY',
      xpReward: 10,
      skills: ['React', 'JavaScript', 'Frontend'],
    },
    {
      title: 'Deploy App to AWS EC2',
      description: 'Deploy a Node.js application to AWS EC2 with Nginx reverse proxy and SSL.',
      category: 'Cloud & DevOps',
      difficulty: 'HARD',
      xpReward: 50,
      skills: ['AWS', 'Nginx', 'DevOps', 'Linux'],
    },
    {
      title: 'LRU Cache Implementation',
      description: 'Implement an LRU (Least Recently Used) cache using a HashMap and Doubly Linked List.',
      category: 'Data Structures & Algorithms',
      difficulty: 'MEDIUM',
      xpReward: 25,
      skills: ['Data Structures', 'Algorithms', 'System Design'],
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task }).catch(() => {}); // Skip duplicates
  }
  console.log(`✅ ${tasks.length} sample tasks seeded`);

  // ─── Skill Trends ─────────────────────────────────────────────────────────────
  const skillTrends = [
    { skill: 'Data Structures & Algorithms', demand: 9800, weeklyDelta: 120 },
    { skill: 'System Design', demand: 7500, weeklyDelta: 95 },
    { skill: 'Python', demand: 8200, weeklyDelta: 110 },
    { skill: 'Machine Learning', demand: 7100, weeklyDelta: 150 },
    { skill: 'Cloud (AWS/GCP/Azure)', demand: 6900, weeklyDelta: 200 },
    { skill: 'React.js', demand: 6800, weeklyDelta: 80 },
    { skill: 'SQL & Databases', demand: 6400, weeklyDelta: 40 },
    { skill: 'Node.js', demand: 5900, weeklyDelta: 60 },
    { skill: 'TypeScript', demand: 5600, weeklyDelta: 220 },
    { skill: 'Docker & Kubernetes', demand: 5200, weeklyDelta: 180 },
  ];

  for (const trend of skillTrends) {
    await prisma.skillTrend.upsert({
      where: { skill: trend.skill },
      update: trend,
      create: trend,
    });
  }
  console.log(`✅ ${skillTrends.length} skill trends seeded`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('─────────────────────────────────────────');
  console.log('Admin:   admin@placementprep.com / Admin@1234');
  console.log('Student: student@demo.com / Student@1234');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
