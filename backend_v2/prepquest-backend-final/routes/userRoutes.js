const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, restrictTo, requireVerified } = require('../middleware/auth');
const updateStreak = require('../middleware/streakUpdater');
const validate = require('../middleware/validate');
const { userSchemas } = require('../models/validationSchemas');

// All user routes require authentication
router.use(protect, updateStreak);

router.get('/profile', userController.getProfile);
router.put('/update', validate(userSchemas.updateProfile), userController.updateProfile);
router.get('/stats', userController.getStats);
router.get('/activity', userController.getActivityLog);

// Admin only
router.get('/all', restrictTo('ADMIN'), userController.getAllUsers);

module.exports = router;
