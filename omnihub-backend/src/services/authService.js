import { User, AuditLog } from '../models/index.js';
import { signToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { generateBackupCodes } from '../utils/security.js';
import { otpService } from './otpService.js';
import { emailService } from './emailService.js';
import { sessionService } from './sessionService.js';
import { ROLES } from '../utils/constants.js';
import { env } from '../config/env.js';

export const authService = {
  async register({ name, email, password, role = ROLES.ADMIN }) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const backupCodes = generateBackupCodes(10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || ROLES.ADMIN,
      is_2fa_enabled: false,
      backup_codes: backupCodes,
    });

    const { otp } = otpService.createOTP(user.email, 'EMAIL_VERIFICATION');
    await emailService.sendVerificationEmail(user.email, otp);

    const token = signToken({ userId: user._id, role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ userId: user._id });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_2fa_enabled: user.is_2fa_enabled,
      },
      token,
      refreshToken,
      backupCodes,
      verificationOtp: otp,
    };
  },

  async login({ email, password, ipAddress, userAgent, rememberMe = false }) {
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password +backup_codes');
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (user.status !== 'active') {
      throw new Error('This account has been suspended or deactivated.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
      await user.save();
      throw new Error('Invalid email or password.');
    }

    // Reset failed login attempts upon successful password match
    user.failed_login_attempts = 0;
    user.last_login = new Date();
    await user.save();

    // PRD 5.2: Send 6-digit verification code to user email
    const { otp } = otpService.createOTP(user.email, 'LOGIN_2FA');
    await emailService.sendOTP(user.email, otp, 'Login Verification');
    return {
      requires2FA: true,
      email: user.email,
      message: 'Two-factor authentication code sent to your email.',
    };
  },

  async verify2FA({ email, otp, backupCode, ipAddress, userAgent, rememberMe = false }) {
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+backup_codes');
    if (!user) {
      throw new Error('User not found.');
    }

    let isValid = false;

    if (backupCode) {
      const formattedCode = backupCode.trim().toUpperCase();
      const codeIndex = user.backup_codes?.findIndex((c) => c.toUpperCase() === formattedCode);
      if (codeIndex !== -1) {
        user.backup_codes.splice(codeIndex, 1);
        await user.save();
        isValid = true;
      } else {
        throw new Error('Invalid emergency backup code.');
      }
    } else if (otp) {
      const verification = otpService.verifyOTP(email, otp.trim());
      if (!verification.success) {
        throw new Error(verification.message);
      }
      isValid = true;
    }

    if (!isValid) {
      throw new Error('Verification failed. Please provide a valid OTP or backup code.');
    }

    const token = signToken({ userId: user._id, role: user.role, email: user.email }, rememberMe ? '30d' : env.JWT_EXPIRES_IN);
    const refreshToken = signRefreshToken({ userId: user._id });

    await sessionService.createSession({
      userId: user._id,
      token,
      refreshToken,
      ipAddress,
      userAgent,
      rememberMe,
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_2fa_enabled: user.is_2fa_enabled,
      },
      token,
      refreshToken,
    };
  },

  async toggle2FA(userId, enable) {
    const user = await User.findById(userId).select('+backup_codes');
    if (!user) throw new Error('User not found.');

    user.is_2fa_enabled = Boolean(enable);
    if (user.is_2fa_enabled && (!user.backup_codes || user.backup_codes.length === 0)) {
      user.backup_codes = generateBackupCodes(10);
    }
    await user.save();

    return {
      is_2fa_enabled: user.is_2fa_enabled,
      backup_codes: user.is_2fa_enabled ? user.backup_codes : [],
    };
  },

  async regenerateBackupCodes(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found.');

    const newCodes = generateBackupCodes(10);
    user.backup_codes = newCodes;
    await user.save();

    return newCodes;
  },

  async refreshAuthToken(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || !decoded.userId) {
      throw new Error('Invalid refresh token.');
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      throw new Error('User account not found or suspended.');
    }

    const newToken = signToken({ userId: user._id, role: user.role, email: user.email });
    return { token: newToken, accessToken: newToken };
  },
};

export const {
  register,
  login,
  verify2FA,
  verifyBackupCode,
  changePassword,
  setup2FA,
  regenerateBackupCodes,
  refreshAuthToken,
} = authService;

export default authService;
