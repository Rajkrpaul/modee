const prisma = require('../config/db');
const { getOpenAIClient } = require('../config/openai');

/**
 * Recommendation Agent
 * Suggests next tasks based on user skills, weak areas, and current trends
 */
const runRecommendationAgent = async (userId, limit = 5) => {
  const [user, trends, allTasks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { skills: true, completedTasks: true, level: true, xp: true },
    }),
    prisma.skillTrend.findMany({ orderBy: { demand: 'desc' }, take: 10 }),
    prisma.task.findMany({}),
  ]);

  if (!user) throw new Error('User not found');

  // Filter out already completed tasks
  const incompleteTasks = allTasks.filter(
    (t) => !user.completedTasks.includes(t.id)
  );

  // Score each task based on relevance
  const scoredTasks = incompleteTasks.map((task) => {
    let score = 0;

    // Boost tasks that match trending skills
    const trendingSkillNames = trends.map((t) => t.skill.toLowerCase());
    task.skills.forEach((skill) => {
      if (trendingSkillNames.some((ts) => ts.includes(skill.toLowerCase()))) {
        score += 20;
      }
    });

    // Boost tasks the user hasn't covered (weak areas)
    const userSkillsLower = user.skills.map((s) => s.toLowerCase());
    task.skills.forEach((skill) => {
      if (!userSkillsLower.includes(skill.toLowerCase())) {
        score += 15;
      }
    });

    // Match difficulty to user level
    if (user.level <= 3 && task.difficulty === 'EASY') score += 10;
    if (user.level >= 4 && user.level <= 8 && task.difficulty === 'MEDIUM') score += 10;
    if (user.level > 8 && task.difficulty === 'HARD') score += 10;

    return { ...task, relevanceScore: score };
  });

  // Sort by relevance score
  scoredTasks.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const topTasks = scoredTasks.slice(0, limit);

  // Optionally enrich recommendations with AI explanation
  let aiExplanation = null;
  if (process.env.OPENAI_API_KEY && topTasks.length > 0) {
    try {
      const openai = getOpenAIClient();
      const prompt = `
You are a placement preparation coach. A student at level ${user.level} with skills [${user.skills.join(', ')}] 
needs to prepare for placements. Based on trending skills [${trends
        .slice(0, 5)
        .map((t) => t.skill)
        .join(', ')}], 
provide a concise 2-sentence explanation of why these tasks are recommended: 
${topTasks.map((t) => t.title).join(', ')}.
Keep it motivating and actionable.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      });

      aiExplanation = response.choices[0]?.message?.content?.trim();
    } catch (err) {
      console.error('OpenAI recommendation error:', err.message);
      aiExplanation = 'These tasks are selected based on your current level and trending industry skills.';
    }
  } else {
    aiExplanation = 'These tasks are selected based on your current level and trending industry skills.';
  }

  return {
    recommendations: topTasks,
    explanation: aiExplanation,
    basedOn: {
      userLevel: user.level,
      userSkills: user.skills,
      trendingSkills: trends.slice(0, 5).map((t) => t.skill),
    },
  };
};

module.exports = { runRecommendationAgent };
