# 🎮 Gamified AI Placement Prep — Backend

A production-ready Node.js + Express backend for a gamified placement preparation platform with AI-driven recommendations, real-time updates, and agentic AI behavior.

---

## 🗂️ Folder Structure

```
backend/
├── agents/
│   ├── recommendationAgent.js   # AI task recommendations
│   ├── motivationAgent.js       # Inactivity nudges
│   └── resumeAnalyzerAgent.js   # Resume parsing + suggestions
├── config/
│   ├── db.js                    # Prisma client singleton
│   ├── email.js                 # Nodemailer transporter
│   ├── jwt.js                   # JWT config
│   └── openai.js                # OpenAI client
├── controllers/
│   ├── authController.js        # Register, login, logout, verify
│   ├── userController.js        # Profile, stats, activity
│   ├── gamificationController.js # XP, tasks, leaderboard
│   ├── trendsController.js      # Skill trends, job trends, analytics
│   └── agentController.js       # AI agent endpoints
├── jobs/
│   └── cronJobs.js              # Streak reset, nudges, trend updates
├── middleware/
│   ├── auth.js                  # JWT protect + role-based access
│   ├── errorHandler.js          # Centralized error handler
│   ├── streakUpdater.js         # Daily streak logic
│   └── validate.js              # Joi validation factory
├── models/
│   └── validationSchemas.js     # All Joi schemas
├── prisma/
│   ├── schema.prisma            # Full DB schema
│   └── seed.js                  # Seed script
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── gamificationRoutes.js
│   ├── trendsRoutes.js
│   └── agentRoutes.js
├── services/
│   ├── emailService.js          # Email templates
│   └── gamificationService.js   # XP, levels, rewards logic
├── sockets/
│   └── socketManager.js         # Socket.IO setup
├── utils/
│   ├── AppError.js              # Custom error class
│   ├── catchAsync.js            # Async wrapper
│   ├── levelUtils.js            # XP/level calculations
│   └── tokenUtils.js            # JWT helpers
├── app.js                       # Express app
└── server.js                    # HTTP + Socket.IO server
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm or pnpm

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/placement_prep_db"
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
OPENAI_API_KEY=sk-...   # Optional — fallback works without it
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
```

### 4. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed with initial data
node prisma/seed.js
```

### 5. Run the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

Server starts at: `http://localhost:5000`

---

## 📡 API Reference

### Auth  `POST /api/auth/*`

| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| POST | `/api/auth/register` | `{name, email, password}` | ❌ |
| POST | `/api/auth/login` | `{email, password}` | ❌ |
| GET | `/api/auth/verify?token=...` | — | ❌ |
| POST | `/api/auth/logout` | `{refreshToken}` | Bearer |
| POST | `/api/auth/refresh` | `{refreshToken}` | ❌ |
| POST | `/api/auth/forgot-password` | `{email}` | ❌ |
| POST | `/api/auth/reset-password` | `{token, password}` | ❌ |

### User  `GET/PUT /api/user/*`

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/user/profile` | Bearer |
| PUT | `/api/user/update` | Bearer |
| GET | `/api/user/stats` | Bearer |
| GET | `/api/user/activity` | Bearer |
| GET | `/api/user/all` | Admin |

### Gamification

| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| GET | `/api/leaderboard?type=global\|weekly` | — | ❌ |
| POST | `/api/xp/add` | `{userId, amount, reason}` | Admin |
| GET | `/api/tasks` | — | Bearer |
| POST | `/api/tasks` | `{title, description, ...}` | Admin |
| GET | `/api/tasks/my` | — | Bearer |
| POST | `/api/tasks/:taskId/complete` | `{score?}` | Bearer |

### Trends

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/trends/skills` | ❌ |
| GET | `/api/trends/jobs?company=&role=` | ❌ |
| GET | `/api/trends/analytics` | Bearer |

### AI Agents

| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| POST | `/api/agent/recommend` | `{limit?}` | Bearer |
| POST | `/api/agent/analyze-resume` | `{resumeText}` | Bearer |
| POST | `/api/agent/nudge` | — | Bearer |

---

## 🔌 Socket.IO Events

### Client → Server

```js
socket.emit('join:user', userId);       // Join personal room
socket.emit('join:leaderboard');         // Join leaderboard room
```

### Server → Client

```js
socket.on('xp:updated', ({ xp, level, xpGained, leveledUp, newRewards }) => {});
socket.on('leaderboard:updated', () => {});
socket.on('notification', ({ type, message }) => {});
```

---

## 🧪 Postman Examples

### Register
```json
POST /api/auth/register
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Secret@123"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "jane@example.com",
  "password": "Secret@123"
}
// Returns: { accessToken, refreshToken, user }
```

### Add XP (Admin)
```json
POST /api/xp/add
Authorization: Bearer <admin_access_token>
{
  "userId": "uuid-here",
  "amount": 50,
  "reason": "manual_award"
}
```

### Analyze Resume
```json
POST /api/agent/analyze-resume
Authorization: Bearer <access_token>
{
  "resumeText": "John Doe - Software Engineer\n5 years experience in Python, Django, PostgreSQL, AWS, Docker...\nBuilt microservices handling 100k req/day..."
}
```

### Get Recommendations
```json
POST /api/agent/recommend
Authorization: Bearer <access_token>
{
  "limit": 5
}
```

---

## 🔐 Default Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@placementprep.com | Admin@1234 |
| Student | student@demo.com | Student@1234 |

---

## 🏗️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (access + refresh tokens) + bcrypt
- **Real-time**: Socket.IO 4
- **Email**: Nodemailer (SMTP)
- **AI**: OpenAI GPT-3.5 Turbo (optional, with local fallback)
- **Validation**: Joi
- **Background Jobs**: node-cron
- **Security**: Helmet, express-rate-limit, CORS
