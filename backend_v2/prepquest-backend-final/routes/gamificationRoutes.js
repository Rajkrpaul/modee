const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const { protect, restrictTo, requireVerified } = require('../middleware/auth');
const updateStreak = require('../middleware/streakUpdater');
const validate = require('../middleware/validate');
const { xpSchemas, taskSchemas } = require('../models/validationSchemas');

// Leaderboard is public
router.get('/leaderboard', gamificationController.getLeaderboard);

// Protected routes
router.use(protect, updateStreak);

// XP — admin only
router.post('/xp/add', restrictTo('ADMIN'), validate(xpSchemas.addXP), gamificationController.addXP);

// Tasks
router.get('/tasks', gamificationController.getAllTasks);
router.post('/tasks', restrictTo('ADMIN'), validate(taskSchemas.createTask), gamificationController.createTask);
router.get('/tasks/my', requireVerified, gamificationController.getUserTasks);
router.post(
  '/tasks/:taskId/complete',
  requireVerified,
  validate(taskSchemas.completeTask),
  gamificationController.completeTask
);

module.exports = router;
