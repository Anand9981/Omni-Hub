import { Router } from 'express';
import authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authRateLimiter, otpRateLimiter } from '../middleware/rateLimiter.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  validateRegister,
  validateLogin,
  validateVerifyOTP,
} from '../validators/authValidator.js';

const router = Router();

// Public Auth Endpoints (10)
router.post('/register', authRateLimiter, validateRequest(validateRegister), authController.register);
router.post('/verify-email', authController.verifyEmail);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authRateLimiter, authController.resendVerification);
router.post('/login', authRateLimiter, validateRequest(validateLogin), authController.login);
router.post('/verify-otp', otpRateLimiter, validateRequest(validateVerifyOTP), authController.verifyOTP);
router.post('/resend-otp', otpRateLimiter, authController.resendOTP);
router.post('/verify-backup-code', otpRateLimiter, authController.verifyBackupCode);
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);
router.post('/reset-password', authRateLimiter, authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);
router.post('/refresh', authController.refreshToken);

// Protected Auth & Session Endpoints (6)
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getCurrentUser);
router.get('/backup-codes', protect, authController.getBackupCodes);
router.post('/2fa/backup-codes/regenerate', protect, authController.regenerateBackupCodes);
router.post('/2fa/toggle', protect, authController.toggle2FA);
router.get('/sessions', protect, authController.getSessions);
router.delete('/sessions/:sessionId', protect, authController.revokeSession);
router.patch('/change-password', protect, authController.changePassword);

export default router;
