import rateLimit from 'express-rate-limit';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatResponse(false, null, 'Too many login attempts. Please try again in 15 minutes.'),
    );
  },
});

export const otpRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatResponse(false, null, 'Too many OTP verification attempts. Please wait before retrying.'),
    );
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute as per PRD
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(
      formatResponse(false, null, 'Rate limit exceeded. Please slow down.'),
    );
  },
});
