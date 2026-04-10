const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateVerificationToken,
} = require('../utils/tokenUtils');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

// ─── REGISTER ────────────────────────────────────────────────────────────────

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return next(new AppError('An account with this email already exists.', 409));

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, verified: true, createdAt: true },
  });

  // Create verification token (expires in 24h)
  const verifyToken = generateVerificationToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: { email, token: verifyToken, type: 'EMAIL_VERIFICATION', expiresAt },
  });

  // Send verification email (non-blocking)
  sendVerificationEmail(email, name, verifyToken).catch((err) =>
    console.error('Verification email failed:', err.message)
  );

  res.status(201).json({
    status: 'success',
    message: 'Account created! Please check your email to verify your account.',
    data: { user },
  });
});

// ─── VERIFY EMAIL ────────────────────────────────────────────────────────────
// Supports two modes:
//   GET  /api/auth/verify?token=<uuid>       — link-based (email link)
//   POST /api/auth/verify-email { email, otp } — OTP-based (frontend form)

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.query;

  if (!token) return next(new AppError('Verification token is required.', 400));

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record) return next(new AppError('Invalid or expired verification token.', 400));
  if (record.type !== 'EMAIL_VERIFICATION')
    return next(new AppError('Invalid token type.', 400));
  if (record.expiresAt < new Date())
    return next(new AppError('Verification token has expired. Please request a new one.', 400));

  await prisma.user.update({
    where: { email: record.email },
    data: { verified: true },
  });

  await prisma.verificationToken.delete({ where: { token } });

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully! You can now log in.',
  });
});

// POST /api/auth/verify-email  { email, otp }
exports.verifyEmailOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) return next(new AppError('Email and OTP are required.', 400));

  // Find all active verification tokens for this email and match the OTP
  const records = await prisma.verificationToken.findMany({
    where: { email, type: 'EMAIL_VERIFICATION' },
  });

  const record = records.find((r) => r.token === otp || r.token.startsWith(otp));

  if (!record) return next(new AppError('Invalid OTP. Please check and try again.', 400));
  if (record.expiresAt < new Date())
    return next(new AppError('OTP has expired. Please request a new one.', 400));

  await prisma.user.update({
    where: { email },
    data: { verified: true },
  });

  await prisma.verificationToken.delete({ where: { id: record.id } });

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully! You can now log in.',
  });
});

// POST /api/auth/resend-otp  { email }
exports.resendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError('Email is required.', 400));

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return next(new AppError('No account found with this email.', 404));
  if (user.verified) return next(new AppError('This email is already verified.', 400));

  // Remove any existing verification tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { email, type: 'EMAIL_VERIFICATION' },
  });

  const verifyToken = generateVerificationToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: { email, token: verifyToken, type: 'EMAIL_VERIFICATION', expiresAt },
  });

  sendVerificationEmail(email, user.name, verifyToken).catch((err) =>
    console.error('Resend OTP email failed:', err.message)
  );

  res.status(200).json({
    status: 'success',
    message: 'Verification email resent. Please check your inbox.',
  });
});

// ─── LOGIN ───────────────────────────────────────────────────────────────────

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return next(new AppError('Invalid email or password.', 401));

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) return next(new AppError('Invalid email or password.', 401));

  if (!user.verified)
    return next(new AppError('Please verify your email before logging in.', 403));

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = await generateRefreshToken(user.id);

  // Log login activity
  await prisma.activityLog.create({
    data: { userId: user.id, action: 'LOGIN', meta: { ip: req.ip } },
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged in successfully.',
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
      },
    },
  });
});

// ─── REFRESH TOKEN ───────────────────────────────────────────────────────────

exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return next(new AppError('Refresh token is required.', 400));

  // Verify JWT signature
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return next(new AppError('Invalid refresh token.', 401));
  }

  // Check DB record
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: { select: { id: true, role: true } } },
  });

  if (!tokenRecord) return next(new AppError('Refresh token not found or already used.', 401));
  if (tokenRecord.expiresAt < new Date())
    return next(new AppError('Refresh token has expired.', 401));

  // Rotate: delete old, issue new
  await prisma.refreshToken.delete({ where: { token: refreshToken } });

  const newAccessToken = generateAccessToken({
    userId: tokenRecord.user.id,
    role: tokenRecord.user.role,
  });
  const newRefreshToken = await generateRefreshToken(tokenRecord.user.id);

  res.status(200).json({
    status: 'success',
    data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
  });
});

// ─── LOGOUT ──────────────────────────────────────────────────────────────────

exports.logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  const authHeader = req.headers.authorization;

  // Blacklist the access token
  if (authHeader?.startsWith('Bearer ')) {
    const accessToken = authHeader.split(' ')[1];
    await prisma.blacklistedToken.upsert({
      where: { token: accessToken },
      update: {},
      create: { token: accessToken },
    });
  }

  // Invalidate refresh token
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
});

// ─── FORGOT PASSWORD ─────────────────────────────────────────────────────────

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) {
    return res.status(200).json({
      status: 'success',
      message: 'If that email is registered, you will receive a reset link shortly.',
    });
  }

  const resetToken = generateVerificationToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Remove any existing reset tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { email, type: 'PASSWORD_RESET' },
  });

  await prisma.verificationToken.create({
    data: { email, token: resetToken, type: 'PASSWORD_RESET', expiresAt },
  });

  sendPasswordResetEmail(email, user.name, resetToken).catch((err) =>
    console.error('Password reset email failed:', err.message)
  );

  res.status(200).json({
    status: 'success',
    message: 'If that email is registered, you will receive a reset link shortly.',
  });
});

// ─── RESET PASSWORD ──────────────────────────────────────────────────────────

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || record.type !== 'PASSWORD_RESET')
    return next(new AppError('Invalid or expired reset token.', 400));
  if (record.expiresAt < new Date())
    return next(new AppError('Reset token has expired. Please request a new one.', 400));

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email: record.email },
    data: { password: hashedPassword },
  });

  // Invalidate all refresh tokens for security
  await prisma.refreshToken.deleteMany({
    where: { user: { email: record.email } },
  });

  await prisma.verificationToken.delete({ where: { token } });

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully. Please log in with your new password.',
  });
});

// ─── CHANGE PASSWORD (Authenticated) ─────────────────────────────────────────

exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return next(new AppError('User not found.', 404));

  const passwordValid = await bcrypt.compare(currentPassword, user.password);
  if (!passwordValid) return next(new AppError('Current password is incorrect.', 401));

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Invalidate all refresh tokens for security
  await prisma.refreshToken.deleteMany({ where: { userId } });

  // Log the action
  await prisma.activityLog.create({
    data: { userId, action: 'PASSWORD_CHANGED', meta: { ip: req.ip } },
  });

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully.',
  });
});

// ─── DELETE ACCOUNT ──────────────────────────────────────────────────────────

exports.deleteAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  const userId = req.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return next(new AppError('User not found.', 404));

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) return next(new AppError('Password is incorrect.', 401));

  // Delete user and all related data (cascade will handle relations)
  await prisma.user.delete({ where: { id: userId } });

  res.status(200).json({
    status: 'success',
    message: 'Account deleted successfully.',
  });
});
