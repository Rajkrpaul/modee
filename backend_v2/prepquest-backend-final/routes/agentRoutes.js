const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { protect, requireVerified } = require('../middleware/auth');
const updateStreak = require('../middleware/streakUpdater');
const validate = require('../middleware/validate');
const { agentSchemas } = require('../models/validationSchemas');

router.use(protect, updateStreak, requireVerified);

router.post('/recommend', validate(agentSchemas.recommend), agentController.getRecommendations);
router.post('/analyze-resume', validate(agentSchemas.analyzeResume), agentController.analyzeResume);
router.post('/nudge', agentController.triggerNudge);

module.exports = router;
