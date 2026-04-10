const { getOpenAIClient } = require('../config/openai');
const prisma = require('../config/db');

/**
 * Fallback skill extraction using keyword matching (no API key needed)
 */
const extractSkillsLocally = (resumeText) => {
  const KNOWN_SKILLS = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP',
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQLite',
    'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'GitHub Actions',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'NLP',
    'System Design', 'Microservices', 'REST API', 'GraphQL', 'gRPC', 'Kafka', 'RabbitMQ',
    'HTML', 'CSS', 'Tailwind', 'SASS', 'Git', 'Linux', 'Agile', 'Scrum', 'Data Structures',
  ];

  const found = [];
  const textLower = resumeText.toLowerCase();
  KNOWN_SKILLS.forEach((skill) => {
    if (textLower.includes(skill.toLowerCase())) {
      found.push(skill);
    }
  });
  return found;
};

/**
 * Resume Analyzer Agent
 * Accepts resume text, extracts skills, and suggests improvements
 */
const runResumeAnalyzerAgent = async (resumeText, userId) => {
  const trendingSkills = await prisma.skillTrend.findMany({
    orderBy: { demand: 'desc' },
    take: 15,
  });

  const trendingSkillNames = trendingSkills.map((t) => t.skill);

  // Try AI-powered analysis first
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = getOpenAIClient();

      const systemPrompt = `You are an expert technical recruiter and career coach specializing in tech placements. 
Analyze the resume and return a JSON response with exactly this structure:
{
  "extractedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "overallScore": 75,
  "summary": "Brief 2-3 sentence overall assessment"
}
Only return valid JSON, no markdown.`;

      const userPrompt = `Resume Text:
${resumeText}

Trending skills in the industry right now: ${trendingSkillNames.join(', ')}

Analyze this resume and identify:
1. Skills present in the resume
2. Important trending skills that are missing
3. Key strengths
4. Specific actionable improvements
5. Overall resume score out of 100`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 800,
        temperature: 0.3,
      });

      const raw = response.choices[0]?.message?.content?.trim();
      const analysis = JSON.parse(raw.replace(/```json|```/g, '').trim());

      // Update user's skills in DB based on extracted skills
      if (userId && analysis.extractedSkills?.length > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { skills: analysis.extractedSkills },
        });
      }

      return {
        ...analysis,
        trendingSkills: trendingSkillNames.slice(0, 10),
        source: 'ai',
      };
    } catch (err) {
      console.error('OpenAI resume analysis error:', err.message);
      // Fall through to local analysis
    }
  }

  // Local fallback analysis
  const extractedSkills = extractSkillsLocally(resumeText);
  const missingSkills = trendingSkillNames.filter(
    (ts) => !extractedSkills.some((es) => es.toLowerCase().includes(ts.toLowerCase()))
  );

  const wordCount = resumeText.split(/\s+/).length;
  const hasQuantifiedAchievements = /\d+%|\d+x|\$\d+|\d+ (users|customers|projects)/i.test(resumeText);
  const hasActionVerbs = /\b(built|developed|designed|led|improved|optimized|implemented|created)\b/i.test(resumeText);

  const improvements = [];
  if (!hasQuantifiedAchievements) improvements.push('Add quantified achievements (e.g., "Improved performance by 40%")');
  if (!hasActionVerbs) improvements.push('Use strong action verbs (built, developed, led, optimized)');
  if (wordCount < 200) improvements.push('Resume seems too short — add more detail about your experience');
  if (missingSkills.length > 0) improvements.push(`Consider adding trending skills: ${missingSkills.slice(0, 3).join(', ')}`);

  const overallScore = Math.min(
    100,
    40 +
      extractedSkills.length * 3 +
      (hasQuantifiedAchievements ? 15 : 0) +
      (hasActionVerbs ? 10 : 0)
  );

  if (userId && extractedSkills.length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { skills: extractedSkills },
    });
  }

  return {
    extractedSkills,
    missingSkills: missingSkills.slice(0, 8),
    strengths: [
      extractedSkills.length > 0 ? `Strong skill set: ${extractedSkills.slice(0, 3).join(', ')}` : 'Has listed skills',
      hasActionVerbs ? 'Uses action verbs effectively' : 'Present in resume',
    ].filter(Boolean),
    improvements,
    overallScore,
    summary: `Resume contains ${extractedSkills.length} recognizable skills. Score: ${overallScore}/100. Focus on adding trending skills and quantifying achievements.`,
    trendingSkills: trendingSkillNames.slice(0, 10),
    source: 'local',
  };
};

module.exports = { runResumeAnalyzerAgent };
