const express = require('express');
const router = express.Router();
const trendsController = require('../controllers/trendsController');
const { protect } = require('../middleware/auth');

// Public trends
router.get('/skills', trendsController.getSkillTrends);
router.get('/jobs', trendsController.getJobTrends);

// User-specific analytics (protected)
router.get('/analytics', protect, trendsController.getUserAnalytics);

module.exports = router;
