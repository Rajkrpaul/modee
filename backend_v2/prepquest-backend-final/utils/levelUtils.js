/**
 * Level thresholds: each level requires progressively more XP
 * Level N requires: N * 100 XP from the start of that level
 */
const XP_PER_LEVEL_BASE = 100;
const LEVEL_MULTIPLIER = 1.5;

/**
 * Calculate level from total XP
 */
const calculateLevel = (totalXP) => {
  let level = 1;
  let xpRequired = XP_PER_LEVEL_BASE;
  let cumulativeXP = 0;

  while (cumulativeXP + xpRequired <= totalXP) {
    cumulativeXP += xpRequired;
    level++;
    xpRequired = Math.floor(XP_PER_LEVEL_BASE * Math.pow(LEVEL_MULTIPLIER, level - 1));
  }

  return level;
};

/**
 * Get XP required for next level
 */
const xpForNextLevel = (currentLevel) => {
  return Math.floor(XP_PER_LEVEL_BASE * Math.pow(LEVEL_MULTIPLIER, currentLevel - 1));
};

/**
 * Get cumulative XP required to reach a level
 */
const cumulativeXPForLevel = (level) => {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.floor(XP_PER_LEVEL_BASE * Math.pow(LEVEL_MULTIPLIER, i - 1));
  }
  return total;
};

/**
 * XP rewards by task difficulty
 */
const XP_REWARDS = {
  EASY: 10,
  MEDIUM: 25,
  HARD: 50,
  DAILY_STREAK: 5,
  STREAK_MILESTONE_7: 50,
  STREAK_MILESTONE_30: 200,
};

module.exports = {
  calculateLevel,
  xpForNextLevel,
  cumulativeXPForLevel,
  XP_REWARDS,
};
