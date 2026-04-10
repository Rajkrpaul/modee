require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');
const trendsRoutes = require('./routes/trendsRoutes');
const agentRoutes = require('./routes/agentRoutes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

// ─── SECURITY MIDDLEWARE ──────────────────────────────────────────────────────

app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Global rate limiter: 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests. Please try again later.' },
});
app.use('/api', globalLimiter);

// Stricter limiter for auth routes: 10 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: 'error', message: 'Too many auth attempts. Please try again later.' },
});
app.use('/api/auth', authLimiter);

// ─── BODY PARSING ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Gamified Placement Prep API is running 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── API ROUTES ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api', gamificationRoutes);          // /api/leaderboard, /api/tasks, /api/xp
app.use('/api/trends', trendsRoutes);
app.use('/api/agent', agentRoutes);

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────

app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found.`, 404));
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────

app.use(errorHandler);

module.exports = app;
