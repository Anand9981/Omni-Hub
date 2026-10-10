import { AuditLog } from '../models/index.js';
import logger from './logger.js';

/**
 * Persists an audit log record for security, compliance, and administrative tracking.
 */
export async function logAuditEvent({
  userId,
  action,
  entityType,
  entityId,
  oldValue = null,
  newValue = null,
  ipAddress = '',
}) {
  try {
    const record = await AuditLog.create({
      user_id: userId || null,
      action: action.toUpperCase(),
      entity_type: entityType.toUpperCase(),
      entity_id: entityId ? String(entityId) : 'N/A',
      old_value: oldValue,
      new_value: newValue,
      ip_address: ipAddress,
    });
    logger.info(`[AuditLog] Recorded action: ${action} on ${entityType} (ID: ${entityId})`);
    return record;
  } catch (error) {
    logger.warn(`[AuditLog Error] Failed to record audit log: ${error.message}`);
    return null;
  }
}

export default logAuditEvent;

