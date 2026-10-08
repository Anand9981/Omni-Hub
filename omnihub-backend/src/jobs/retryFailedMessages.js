import { Message, Conversation } from '../models/index.js';
import { MESSAGE_STATUS } from '../utils/constants.js';
import { dispatcher } from '../services/dispatcher.js';
import { emitEvent } from '../sockets/index.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';
import logger from '../utils/logger.js';

/**
 * Retry Failed Messages Job
 * Runs every 5 minutes — finds messages with FAILED status that haven't
 * exceeded max retry attempts and re-dispatches them.
 *
 * Cron: '*​/5 * * * *' (every 5 minutes)
 */

const MAX_RETRIES = 3;
const RETRY_BATCH_SIZE = 50;

export async function retryFailedMessagesJob() {
  logger.info('[RetryFailedMessages] Scanning for failed messages...');

  try {
    // Find failed outbound messages that can still be retried
    const failedMessages = await Message.find({
      status: MESSAGE_STATUS.FAILED,
      direction: 'OUTBOUND',
      retry_count: { $lt: MAX_RETRIES },
    })
      .sort({ created_at: 1 }) // Oldest first
      .limit(RETRY_BATCH_SIZE)
      .lean();

    if (failedMessages.length === 0) {
      logger.debug('[RetryFailedMessages] No messages to retry');
      return { retried: 0, succeeded: 0, failed: 0 };
    }

    logger.info(`[RetryFailedMessages] Found ${failedMessages.length} messages to retry`);

    let succeeded = 0;
    let failed = 0;

    for (const msg of failedMessages) {
      try {
        // Get the conversation for platform info and external_chat_id
        const conversation = await Conversation.findById(msg.conversation_id).lean();
        if (!conversation) {
          logger.warn(`[RetryFailedMessages] Conversation not found for message ${msg._id}`);
          // Mark as permanently failed
          await Message.findByIdAndUpdate(msg._id, {
            retry_count: MAX_RETRIES,
          });
          failed++;
          continue;
        }

        // Attempt re-dispatch
        const result = await dispatcher.dispatchOutboundMessage({
          platform: conversation.platform,
          external_chat_id: conversation.external_chat_id,
          text_content: msg.text_content,
          media_url: msg.media_url,
          buttons: msg.buttons,
        });

        if (result.success) {
          // Update message status to DELIVERED
          await Message.findByIdAndUpdate(msg._id, {
            status: MESSAGE_STATUS.DELIVERED,
            retry_count: (msg.retry_count || 0) + 1,
          });

          // Notify frontend of status change
          emitEvent(SOCKET_EVENTS.MESSAGE_STATUS, {
            conversationId: msg.conversation_id.toString(),
            messageId: msg._id.toString(),
            status: MESSAGE_STATUS.DELIVERED,
          });

          succeeded++;
          logger.debug(`[RetryFailedMessages] ✅ Retry succeeded for message ${msg._id}`);
        } else {
          // Increment retry count, keep as FAILED
          const newRetryCount = (msg.retry_count || 0) + 1;
          await Message.findByIdAndUpdate(msg._id, {
            retry_count: newRetryCount,
          });

          // If max retries reached, notify frontend
          if (newRetryCount >= MAX_RETRIES) {
            emitEvent(SOCKET_EVENTS.MESSAGE_STATUS, {
              conversationId: msg.conversation_id.toString(),
              messageId: msg._id.toString(),
              status: MESSAGE_STATUS.FAILED,
              failureReason: `Max retries (${MAX_RETRIES}) exceeded. Last error: ${result.error || 'Unknown'}`,
            });
          }

          failed++;
          logger.debug(`[RetryFailedMessages] ❌ Retry failed for message ${msg._id} (attempt ${newRetryCount}/${MAX_RETRIES})`);
        }
      } catch (err) {
        failed++;
        logger.warn(`[RetryFailedMessages] Error retrying message ${msg._id}: ${err.message}`);
      }
    }

    logger.info(
      `[RetryFailedMessages] ✅ Batch complete — retried: ${failedMessages.length}, ` +
      `succeeded: ${succeeded}, failed: ${failed}`,
    );

    return { retried: failedMessages.length, succeeded, failed };
  } catch (error) {
    logger.error(`[RetryFailedMessages] Job failed: ${error.message}`);
    throw error;
  }
}

export default retryFailedMessagesJob;
