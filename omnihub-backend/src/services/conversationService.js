import { Conversation, Message, DailyAnalytics, HourlyAnalytics } from '../models/index.js';
import { emitEvent } from '../sockets/index.js';
import logger from '../utils/logger.js';
import { MESSAGE_DIRECTIONS, MESSAGE_STATUS } from '../utils/constants.js';

export const conversationService = {
  /**
   * Universal message processor for all incoming normalized platform messages.
   */
  async processInboundMessage(normalized) {
    if (!normalized || !normalized.platform || !normalized.external_chat_id) {
      logger.warn('[Ingestion] Inbound message missing platform or external_chat_id.');
      return null;
    }

    try {
      // 1. Find or create the conversation thread
      let conversation = await Conversation.findOne({
        platform: normalized.platform,
        external_chat_id: normalized.external_chat_id,
      });

      if (!conversation) {
        conversation = await Conversation.create({
          platform: normalized.platform,
          external_chat_id: normalized.external_chat_id,
          sender_name: normalized.sender_name || 'Customer',
          sender_phone: normalized.sender_phone || '',
          sender_email: normalized.sender_email || '',
          last_activity_at: new Date(),
          unread_count: 1,
        });
        logger.info(`[Ingestion] Created new conversation (${conversation._id}) on platform [${normalized.platform}]`);
      } else {
        conversation.last_activity_at = new Date();
        conversation.unread_count = (conversation.unread_count || 0) + 1;
        if (normalized.sender_name && conversation.sender_name === 'Customer') {
          conversation.sender_name = normalized.sender_name;
        }
        await conversation.save();
      }

      // 2. Create the message document
      const message = await Message.create({
        conversation_id: conversation._id,
        platform: normalized.platform,
        sender_type: 'USER',
        direction: MESSAGE_DIRECTIONS.INBOUND,
        text_content: normalized.text_content || '',
        media_url: normalized.media_url || '',
        media_type: normalized.media_type || '',
        status: MESSAGE_STATUS.DELIVERED,
      });

      // 3. Update Daily & Hourly Analytics (non-blocking)
      this.incrementAnalytics(normalized.platform).catch((err) => {
        logger.warn(`[Analytics Increment Error] ${err.message}`);
      });

      // 4. Broadcast Real-time Socket.io Events
      emitEvent('new_message', {
        conversation_id: conversation._id,
        sender_name: conversation.sender_name,
        platform: conversation.platform,
        message: {
          id: message._id,
          conversation_id: conversation._id,
          platform: message.platform,
          sender_name: conversation.sender_name,
          sender_type: message.sender_type,
          direction: message.direction,
          text_content: message.text_content,
          media_url: message.media_url,
          media_type: message.media_type,
          status: message.status,
          created_at: message.created_at,
        },
      });

      emitEvent('conversation_update', {
        id: conversation._id,
        platform: conversation.platform,
        sender_name: conversation.sender_name,
        unread_count: conversation.unread_count,
        last_activity_at: conversation.last_activity_at,
        lastMessage: {
          text_content: message.text_content,
          direction: message.direction,
          created_at: message.created_at,
        },
      });

      // 5. Trigger Non-blocking AI Analysis & Smart Suggestions
      this.processAIInsights(conversation._id, normalized.text_content, normalized.platform).catch((err) => {
        logger.warn(`[AI Ingestion Insight Error] ${err.message}`);
      });

      // 6. Trigger Auto-Pilot Bot Evaluation
      let autoPilotResult = null;
      try {
        const { autoPilotService } = await import('./autoPilotService.js');
        autoPilotResult = await autoPilotService.handleInboundMessage({
          conversation,
          incomingMessage: message,
        });
      } catch (autoErr) {
        logger.error(`[Auto-Pilot Trigger Error] ${autoErr.message}`);
      }

      logger.info(`[Ingestion] Processed inbound message from ${normalized.sender_name} on ${normalized.platform}: "${normalized.text_content.slice(0, 30)}"`);
      return { conversation, message, autoPilot: autoPilotResult };
    } catch (error) {
      logger.error(`[Ingestion Processing Error] ${error.message}`);
      return null;
    }
  },

  async incrementAnalytics(platform) {
    const today = new Date().toISOString().split('T')[0];
    const hour = new Date().getHours();

    try {
      await DailyAnalytics.findOneAndUpdate(
        { date: today, platform },
        { $inc: { inbound_count: 1 } },
        { upsert: true, new: true },
      );

      await HourlyAnalytics.findOneAndUpdate(
        { date: today, hour, platform },
        { $inc: { inbound_count: 1 } },
        { upsert: true, new: true },
      );
    } catch (err) {
      // Ignore in-memory fallback warning
    }
  },

  /**
   * Generates AI suggestions, sentiment, and intent in the background
   * and broadcasts real-time 'ai_suggestions' event.
   */
  async processAIInsights(conversationId, text, platform) {
    if (!text || !text.trim()) return;
    try {
      const { aiService } = await import('./aiService.js');
      const insights = await aiService.generateSuggestions({ text, channel: platform });
      if (insights) {
        await Conversation.findByIdAndUpdate(
          conversationId,
          {
            sentiment: insights.sentiment,
            intent: insights.intent,
            urgency: insights.urgency,
            ai_suggestions: insights.suggestions,
          },
          { new: true },
        );

        emitEvent('ai_suggestions', {
          conversation_id: conversationId,
          sentiment: insights.sentiment,
          intent: insights.intent,
          urgency: insights.urgency,
          language: insights.language,
          suggestions: insights.suggestions,
        });

        logger.info(`[AI Copilot] Auto insights for conversation ${conversationId}: Sentiment=[${insights.sentiment}], Intent=[${insights.intent}]`);
      }
    } catch (err) {
      logger.warn(`[AI Copilot Auto-Suggest Error] ${err.message}`);
    }
  },
};

export default conversationService;
