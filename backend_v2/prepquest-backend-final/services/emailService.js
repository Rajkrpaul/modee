const transporter = require('../config/email');

const FROM = `"Placement Prep Platform" <${process.env.SMTP_USER}>`;

const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.SERVER_URL}/api/auth/verify?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: '✅ Verify Your Email - Placement Prep Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Placement Prep Platform, ${name}! 🚀</h2>
        <p>Please verify your email address to get started on your placement journey.</p>
        <a href="${verifyUrl}" 
           style="display:inline-block; padding:12px 24px; background:#6366f1; color:#fff; border-radius:6px; text-decoration:none; font-weight:bold;">
          Verify Email
        </a>
        <p style="margin-top:16px; color:#666;">This link expires in 24 hours.</p>
        <p style="color:#999; font-size:12px;">If you did not create an account, please ignore this email.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: '🔐 Password Reset - Placement Prep Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${name}, we received a request to reset your password.</p>
        <a href="${resetUrl}" 
           style="display:inline-block; padding:12px 24px; background:#ef4444; color:#fff; border-radius:6px; text-decoration:none; font-weight:bold;">
          Reset Password
        </a>
        <p style="margin-top:16px; color:#666;">This link expires in 1 hour.</p>
        <p style="color:#999; font-size:12px;">If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  });
};

const sendStreakNudgeEmail = async (email, name, streak) => {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `🔥 Don't lose your ${streak}-day streak! - Placement Prep`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hey ${name}! Your streak is at risk 😬</h2>
        <p>You have a <strong>${streak}-day streak</strong> going! Don't let it slip away.</p>
        <p>Complete at least one task today to keep your momentum going.</p>
        <a href="${process.env.CLIENT_URL}/dashboard" 
           style="display:inline-block; padding:12px 24px; background:#f59e0b; color:#fff; border-radius:6px; text-decoration:none; font-weight:bold;">
          Continue Practicing 🚀
        </a>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendStreakNudgeEmail };
