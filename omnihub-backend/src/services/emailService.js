import nodemailer from 'nodemailer';
import env from '../config/env.js';
import logger from '../utils/logger.js';

let transporter = null;

function getTransporter() {
  if (!transporter && env.SMTP_USER && env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(env.SMTP_PORT) || 587,
      secure: Number(env.SMTP_PORT) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export const emailService = {
  async sendVerificationEmail(email, token, verifyUrl) {
    const tx = getTransporter();
    const url = verifyUrl || `http://localhost:5173/verify-email?email=${encodeURIComponent(email)}&token=${token}`;
    if (tx) {
      try {
        const info = await tx.sendMail({
          from: env.EMAIL_FROM || `"OmniHub Security" <${env.SMTP_USER}>`,
          to: email,
          subject: 'Verify your OmniHub Account',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 520px;">
              <h2 style="color: #2563eb; margin-bottom: 8px;">Welcome to OmniHub!</h2>
              <p>Please verify your email address to complete your workspace setup.</p>
              <div style="margin: 24px 0;">
                <a href="${url}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
              </div>
              <p style="color: #64748b; font-size: 13px;">Or copy and paste this link in your browser:<br/><a href="${url}">${url}</a></p>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">Your verification token: <strong>${token}</strong></p>
            </div>
          `,
        });
        logger.info(`[Email Service] Live verification email sent to ${email} (MessageID: ${info.messageId})`);
        return true;
      } catch (err) {
        logger.error(`[Email Service] Failed sending verification email: ${err.message}`);
      }
    }
    logger.info(`[Email Service] Verification link for ${email}: ${url} (Token: ${token})`);
    return true;
  },

  async sendOTP(email, otp, purpose = 'Login Verification') {
    const tx = getTransporter();
    if (tx) {
      try {
        const info = await tx.sendMail({
          from: env.EMAIL_FROM || `"OmniHub Support" <${env.SMTP_USER}>`,
          to: email,
          subject: `OmniHub Security Code: ${otp}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #4F46E5;">OmniHub Verification Code</h2>
              <p>Your one-time verification code for <strong>${purpose}</strong> is:</p>
              <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #4F46E5; margin: 20px 0; padding: 10px 20px; background: #F3F4F6; display: inline-block; border-radius: 8px;">
                ${otp}
              </div>
              <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
          `,
        });
        logger.info(`[Email Service] Live SMTP email sent to ${email} (MessageID: ${info.messageId})`);
        return true;
      } catch (err) {
        logger.error(`[Email Service] Failed to send live email: ${err.message}`);
      }
    }

    logger.info(`[Email Service] Mock sending OTP ${otp} to ${email} for [${purpose}]`);
    return true;
  },

  async sendPasswordReset(email, resetUrl) {
    const tx = getTransporter();
    if (tx) {
      try {
        await tx.sendMail({
          from: env.EMAIL_FROM || `"OmniHub Support" <${env.SMTP_USER}>`,
          to: email,
          subject: `Reset your OmniHub Password`,
          html: `<p>Click here to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
        });
        logger.info(`[Email Service] Password reset email sent to ${email}`);
        return true;
      } catch (err) {
        logger.error(`[Email Service] Failed reset email: ${err.message}`);
      }
    }
    logger.info(`[Email Service] Mock sending password reset link to ${email}: ${resetUrl}`);
    return true;
  },

  async sendWelcome(email, name) {
    logger.info(`[Email Service] Mock sending welcome email to ${name} (${email})`);
    return true;
  },

  async sendEmail({ to, subject, html }) {
    const tx = getTransporter();
    if (tx) {
      try {
        const info = await tx.sendMail({
          from: env.EMAIL_FROM || `"OmniHub Team" <${env.SMTP_USER}>`,
          to,
          subject,
          html,
        });
        logger.info(`[Email Service] Live email sent to ${to} (MessageID: ${info.messageId})`);
        return true;
      } catch (err) {
        logger.error(`[Email Service] Failed sending email: ${err.message}`);
      }
    }
    logger.info(`[Email Service] Mock email dispatched to ${to}: ${subject}`);
    return true;
  },
};

export default emailService;
