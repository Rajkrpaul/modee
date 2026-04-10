# 🛠️ Backend Fixes — PrepQuest

## Root Causes of "Registration Failed / Server Error"

### Fix 1 — Incomplete `.env` file (MAIN CAUSE)
The `.env` only had `DATABASE_URL`. Missing variables caused the server to crash or JWT to fail silently.

**What was missing:**
- `JWT_ACCESS_SECRET` — without this, `jwt.sign()` throws and the server crashes on any auth request
- `JWT_REFRESH_SECRET` — same issue
- `PORT`, `NODE_ENV`, `CLIENT_URL`, `SERVER_URL`, `ALLOWED_ORIGINS`

**Fixed:** `.env` now has all required variables filled in.

---

### Fix 2 — Missing routes: `POST /api/auth/verify-email` and `POST /api/auth/resend-otp`
The frontend sends OTP verification as:
```
POST /api/auth/verify-email  { email, otp }
POST /api/auth/resend-otp    { email }
```
But the backend only had:
```
GET /api/auth/verify?token=<uuid>   (link-based)
```
This caused a 404 → "Server error" on the frontend after signup.

**Fixed:** Added both new endpoints to `authController.js` and `authRoutes.js`.

---

## Setup Instructions

### 1. Install dependencies & generate Prisma client
```bash
cd backend
npm install
```

### 2. Configure `.env`
The `.env` file is now complete. You only need to update:
- `SMTP_USER` and `SMTP_PASS` — your Gmail address and [App Password](https://support.google.com/accounts/answer/185833)
- `OPENAI_API_KEY` — only needed for AI agent features
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` — change these for production!

### 3. Run database migrations
```bash
npx prisma migrate dev --name init
```
> This creates all the tables in your Neon PostgreSQL database.

### 4. (Optional) Seed the database
```bash
node prisma/seed.js
```

### 5. Start the backend
```bash
npm run dev     # development (with nodemon)
npm start       # production
```

The server runs on `http://localhost:5000`.

---

## Email Verification Note
Since email (SMTP) may not be configured during development, users are **created in the database but marked unverified**. The verification token is stored in the DB. You can:

**Option A:** Configure real SMTP (Gmail app password) and click the email link.

**Option B (dev shortcut):** Manually verify a user in Prisma Studio:
```bash
npx prisma studio
```
Then find the user and set `verified = true`.

---

## API Endpoints (Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/verify-email` | Verify with OTP `{email, otp}` |
| POST | `/api/auth/resend-otp` | Resend verification `{email}` |
| GET  | `/api/auth/verify?token=` | Verify via email link |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
