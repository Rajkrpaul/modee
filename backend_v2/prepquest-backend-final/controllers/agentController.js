const catchAsync = require('../utils/catchAsync');
const { runRecommendationAgent } = require('../agents/recommendationAgent');
const { runResumeAnalyzerAgent } = require('../agents/resumeAnalyzerAgent');
const { nudgeUser } = require('../agents/motivationAgent');

// ─── RECOMMEND TASKS ──────────────────────────────────────────────────────────

exports.getRecommendations = catchAsync(async (req, res) => {
  const { limit = 5 } = req.body;
  const result = await runRecommendationAgent(req.user.id, limit);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

// ─── ANALYZE RESUME ───────────────────────────────────────────────────────────

exports.analyzeResume = catchAsync(async (req, res) => {
  const { resumeText } = req.body;
  const result = await runResumeAnalyzerAgent(resumeText, req.user.id);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

// ─── NUDGE SELF ───────────────────────────────────────────────────────────────

exports.triggerNudge = catchAsync(async (req, res) => {
  const result = await nudgeUser(req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'Motivation nudge sent.',
    data: result,
  });
});
