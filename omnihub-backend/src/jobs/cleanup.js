import { AuditLog, Session, Message, Conversation } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Cleanup Job
 * Runs daily at 02:00 AM — cleans up old data to keep the database lean:
 * - Audit logs older than 90 days
 * - Expired user sessions
 * - Archived conversations older than 180 days
 * - Old hourly analytics data (older than 30 days — already rolled into daily)
 *
 * Cron: '0 2 * * *' (2:00 AM every day)
 */

const AUDIT_LOG_RETENTION_DAYS = 90;
const ARCHIVED_CONVERSATION_RETENTION_DAYS = 180;
const HOURLY_ANALYTICS_RETENTION_DAYS = 30;
const SESSION_EXPIRY_DAYS = 7;

export async function cleanupJob() {
  logger.info('[Cleanup] Starting database cleanup...');

  const results = {
    auditLogs: 0,
    sessions: 0,
    archivedConversations: 0,
    archivedMessages: 0,
    hourlyAnalytics: 0,
  };

  try {
    // 1. Delete old audit logs
    const auditCutoff = new Date();
    auditCutoff.setDate(auditCutoff.getDate() - AUDIT_LOG_RETENTION_DAYS);

    const auditResult = await AuditLog.deleteMany({
      created_at: { $lt: auditCutoff },
    });
    results.auditLogs = auditResult.deletedCount || 0;

    // 2. Delete expired sessions
    const sessionCutoff = new Date();
    sessionCutoff.setDate(sessionCutoff.getDate() - SESSION_EXPIRY_DAYS);

    const sessionResult = await Session.deleteMany({
      $or: [
        { expires_at: { $lt: new Date() } },
        { last_active: { $lt: sessionCutoff } },
      ],
    });
    results.sessions = sessionResult.deletedCount || 0;

    // 3. Delete messages from old archived conversations
    const archiveCutoff = new Date();
    archiveCutoff.setDate(archiveCutoff.getDate() - ARCHIVED_CONVERSATION_RETENTION_DAYS);

    const archivedConversations = await Conversation.find({
      status: 'ARCHIVED',
      updated_at: { $lt: archiveCutoff },
    }).select('_id').lean();

    if (archivedConversations.length > 0) {
      const archivedIds = archivedConversations.map((c) => c._id);

      // Delete all messages belonging to these archived conversations
      const messageResult = await Message.deleteMany({
        conversation_id: { $in: archivedIds },
      });
      results.archivedMessages = messageResult.deletedCount || 0;

      // Delete the archived conversations themselves
      const convResult = await Conversation.deleteMany({
        _id: { $in: archivedIds },
      });
      results.archivedConversations = convResult.deletedCount || 0;
    }

    // 4. Delete old hourly analytics (daily aggregation already captured the data)
    const { HourlyAnalytics } = await import('../models/index.js');
    const hourlyCutoff = new Date();
    hourlyCutoff.setDate(hourlyCutoff.getDate() - HOURLY_ANALYTICS_RETENTION_DAYS);
    const hourlyCutoffStr = hourlyCutoff.toISOString().split('T')[0];

    const hourlyResult = await HourlyAnalytics.deleteMany({
      date: { $lt: hourlyCutoffStr },
    });
    results.hourlyAnalytics = hourlyResult.deletedCount || 0;

    logger.info(
      `[Cleanup] ✅ Cleanup complete — ` +
      `audit logs: ${results.auditLogs}, ` +
      `sessions: ${results.sessions}, ` +
      `archived conversations: ${results.archivedConversations}, ` +
      `archived messages: ${results.archivedMessages}, ` +
      `hourly analytics: ${results.hourlyAnalytics}`,
    );

    return results;
  } catch (error) {
    logger.error(`[Cleanup] Job failed: ${error.message}`);
    throw error;
  }
}

export default cleanupJob;
