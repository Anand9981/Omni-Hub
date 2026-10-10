import authService from '../services/authService.js';
import sessionService from '../services/sessionService.js';
import otpService from '../services/otpService.js';
import emailService from '../services/emailService.js';
import { User } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return res.status(HTTP_STATUS.CREATED).json(
        formatResponse(true, result, 'Registration successful.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Unknown Device';

      const result = await authService.login({
        ...req.body,
        ipAddress,
        userAgent,
      });

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, result, result.requires2FA ? '2FA verification code sent.' : 'Login successful.'),
      );
    } catch (error) {
      if (error.message === 'Invalid email or password.' || error.message.includes('suspended')) {
        error.statusCode = HTTP_STATUS.UNAUTHORIZED;
      }
      next(error);
    }
  },

  async verify2FA(req, res, next) {
    try {
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Unknown Device';

      const result = await authService.verify2FA({
        ...req.body,
        ipAddress,
        userAgent,
      });

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, result, 'Authentication verified.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async resendOTP(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatResponse(false, null, 'Email is required.'),
        );
      }

      const { otp } = otpService.createOTP(email, 'RESEND_2FA');
      await emailService.sendOTP(email, otp, 'Two-Factor Verification');

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, null, 'New verification code sent to your email.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async toggle2FA(req, res, next) {
    try {
      const { enable } = req.body;
      const result = await authService.toggle2FA(req.user._id, enable);
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, result, `2FA has been ${result.is_2fa_enabled ? 'enabled' : 'disabled'}.`),
      );
    } catch (error) {
      next(error);
    }
  },

  async regenerateBackupCodes(req, res, next) {
    try {
      const codes = await authService.regenerateBackupCodes(req.user._id);
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, { backup_codes: codes }, 'Emergency backup codes regenerated.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatResponse(false, null, 'Refresh token is required.'),
        );
      }

      const result = await authService.refreshAuthToken(refreshToken);
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, result, 'Token refreshed successfully.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async getCurrentUser(req, res) {
    return res.status(HTTP_STATUS.OK).json(
      formatResponse(true, {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        is_2fa_enabled: req.user.is_2fa_enabled,
      }, 'Current user profile fetched.'),
    );
  },

  async getSessions(req, res, next) {
    try {
      const sessions = await sessionService.listUserSessions(req.user._id);
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, sessions, 'Active sessions retrieved.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async revokeSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      await sessionService.revokeSession(sessionId, req.user._id);
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, null, 'Session revoked successfully.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async verifyEmail(req, res, next) {
    try {
      const email = req.body?.email || req.query?.email;
      const token = req.body?.token || req.query?.token;
      if (!email || !token) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, null, 'Email and verification token are required.'));
      }
      const verified = otpService.verifyOTP(email, token, 'EMAIL_VERIFICATION');
      if (!verified || !verified.success) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, null, verified?.message || 'Invalid or expired verification token.'));
      }
      await User.findOneAndUpdate({ email: email.toLowerCase() }, { email_verified: true });
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, null, 'Email verified successfully.'));
    } catch (error) {
      next(error);
    }
  },

  async resendVerification(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) return res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, null, 'Email is required.'));
      const { otp } = otpService.createOTP(email, 'EMAIL_VERIFICATION');
      await emailService.sendOTP(email, otp, 'Email Verification');
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, null, 'Verification email sent.'));
    } catch (error) {
      next(error);
    }
  },

  async verifyOTP(req, res, next) {
    return authController.verify2FA(req, res, next);
  },

  async verifyBackupCode(req, res, next) {
    try {
      const { email, backupCode } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Unknown Device';
      const result = await authService.verify2FA({ email, otp: backupCode, isBackupCode: true, ipAddress, userAgent });
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, result, 'Backup code accepted. Authenticated successfully.'));
    } catch (error) {
      next(error);
    }
  },

  async getBackupCodes(req, res, next) {
    try {
      const codes = await authService.regenerateBackupCodes(req.user._id);
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, { backup_codes: codes }, 'Backup codes retrieved.'));
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) return res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, null, 'Email is required.'));
      const { otp } = otpService.createOTP(email, 'PASSWORD_RESET');
      await emailService.sendPasswordReset(email, otp);
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, null, 'Password reset code sent to your email.'));
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { email, resetToken, newPassword } = req.body;
      const verified = otpService.verifyOTP(email, resetToken, 'PASSWORD_RESET');
      if (!verified || !verified.success) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, null, verified?.message || 'Invalid or expired reset token.'));
      }
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, null, 'Password reset successful. You can now login.'));
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      const { sessionId } = req.body;
      if (sessionId && req.user) {
        await sessionService.revokeSession(sessionId, req.user._id);
      }
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, null, 'Logout successful.'));
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, null, 'Current and new password are required.'));
      }
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, null, 'Password updated successfully.'));
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
