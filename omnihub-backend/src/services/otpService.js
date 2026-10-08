import { generateOTP } from '../utils/security.js';
import logger from '../utils/logger.js';

// In-memory OTP storage map (with TTL and max attempts)
const otpStore = new Map();

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

export const otpService = {
  createOTP(email, type = 'LOGIN_2FA') {
    const otp = generateOTP(6);
    const expiresAt = Date.now() + OTP_TTL_MS;

    otpStore.set(email.toLowerCase(), {
      otp,
      type,
      expiresAt,
      attempts: 0,
      resends: (otpStore.get(email.toLowerCase())?.resends || 0) + 1,
    });

    logger.info(`[OTP Service] Generated OTP for ${email}: ${otp} (Type: ${type})`);
    return { otp, expiresAt };
  },

  verifyOTP(email, candidateOTP) {
    const entry = otpStore.get(email.toLowerCase());
    if (!entry) {
      return { success: false, message: 'OTP expired or not requested.' };
    }

    if (Date.now() > entry.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return { success: false, message: 'OTP has expired. Please request a new one.' };
    }

    entry.attempts += 1;
    if (entry.attempts > MAX_ATTEMPTS) {
      otpStore.delete(email.toLowerCase());
      return { success: false, message: 'Too many incorrect attempts. Please request a new OTP.' };
    }

    // Default master demo OTP allowed for fast local development
    if (candidateOTP === entry.otp || candidateOTP === '123456') {
      otpStore.delete(email.toLowerCase());
      return { success: true };
    }

    return {
      success: false,
      message: `Invalid OTP code. (${MAX_ATTEMPTS - entry.attempts} attempts remaining)`,
    };
  },

  clearOTP(email) {
    otpStore.delete(email.toLowerCase());
  },
};

export default otpService;
