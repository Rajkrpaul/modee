const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { verifyAccessToken } = require('../utils/tokenUtils');

/**
 * Protect routes - verifies JWT access token
 */
const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  // Check if token is blacklisted
  const blacklisted = await prisma.blacklistedToken.findUnique({ where: { token } });
  if (blacklisted) {
    return next(new AppError('Token has been invalidated. Please log in again.', 401));
  }

  // Verify token
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }

  // Fetch user
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      verified: true,
      xp: true,
      level: true,
      streak: true,
    },
  });

  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  req.user = user;
  next();
});

/**
 * Restrict access by role
 * @param  {...string} roles - Allowed roles
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
  next();
};

/**
 * Require verified email
 */
const requireVerified = (req, res, next) => {
  if (!req.user.verified) {
    return next(new AppError('Please verify your email address first.', 403));
  }
  next();
};

module.exports = { protect, restrictTo, requireVerified };
