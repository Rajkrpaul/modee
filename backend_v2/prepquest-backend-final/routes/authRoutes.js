const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authSchemas } = require('../models/validationSchemas');

router.post('/register', validate(authSchemas.register), authController.register);
router.post('/login', validate(authSchemas.login), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);
router.get('/verify', authController.verifyEmail);
router.post('/verify-email', authController.verifyEmailOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/forgot-password', validate(authSchemas.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authSchemas.resetPassword), authController.resetPassword);

// Protected routes (require authentication)
router.put('/change-password', protect, validate(authSchemas.changePassword), authController.changePassword);
router.delete('/delete', protect, validate(authSchemas.deleteAccount), authController.deleteAccount);

module.exports = router;
