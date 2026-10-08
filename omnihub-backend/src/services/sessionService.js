import { Session } from '../models/index.js';
import logger from '../utils/logger.js';

const MAX_DEVICES = 3;

export const sessionService = {
  async createSession({ userId, token, refreshToken, ipAddress, userAgent, rememberMe = false }) {
    try {
      const activeSessionsCount = await Session.countDocuments({ user_id: userId, is_active: true });
      if (activeSessionsCount >= MAX_DEVICES) {
        // Automatically invalidate the oldest active session to maintain max devices limit
        const oldestSession = await Session.findOne({ user_id: userId, is_active: true }).sort({ created_at: 1 });
        if (oldestSession) {
          oldestSession.is_active = false;
          await oldestSession.save();
        }
      }

      const expiresAt = new Date(Date.now() + (rememberMe ? 30 * 24 : 40) * 60 * 60 * 1000);

      const session = await Session.create({
        user_id: userId,
        token,
        refresh_token: refreshToken,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_info: {
          browser: userAgent.includes('Chrome') ? 'Chrome' : userAgent.includes('Firefox') ? 'Firefox' : 'Browser',
          os: userAgent.includes('Windows') ? 'Windows' : userAgent.includes('Mac') ? 'macOS' : 'Linux',
          device: userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
        },
        is_active: true,
        expires_at: expiresAt,
      });

      return session;
    } catch (err) {
      logger.warn(`[Session Service] Failed to save session to DB: ${err.message}. Proceeding stateless.`);
      return null;
    }
  },

  async listUserSessions(userId) {
    try {
      return await Session.find({ user_id: userId, is_active: true }).sort({ created_at: -1 });
    } catch {
      return [];
    }
  },

  async revokeSession(sessionId, userId) {
    try {
      return await Session.findOneAndUpdate(
        { _id: sessionId, user_id: userId },
        { is_active: false },
        { new: true },
      );
    } catch {
      return null;
    }
  },

  async revokeAllExcept(currentSessionToken, userId) {
    try {
      return await Session.updateMany(
        { user_id: userId, token: { $ne: currentSessionToken } },
        { is_active: false },
      );
    } catch {
      return null;
    }
  },
};

export default sessionService;
