import mongoose from 'mongoose';
import { Message, Conversation, DailyAnalytics, HourlyAnalytics } from '../models/index.js';
import dispatcher from '../services/dispatcher.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS, MESSAGE_DIRECTIONS } from '../utils/constants.js';
import { emitEvent } from '../sockets/index.js';

export const messageController = {
  async getMessagesByConversation(req, res, next) {
    try {
      const { conversationId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(HTTP_STATUS.OK).json(
          formatResponse(true, [], 'No database messages for demo id.'),
        );
      }

      const messages = await Message.find({ conversation_id: conversationId })
        .sort({ created_at: 1 })
        .lean();

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, messages.map((m) => ({ ...m, id: m._id })), 'Messages retrieved.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async sendMessage(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { text_content, media_url, media_type, media_name, buttons } = req.body;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          formatResponse(false, null, 'Conversation not found.'),
        );
      }

      // 1. Dispatch to target platform
      const dispatchResult = await dispatcher.dispatchOutboundMessage({
        platform: conversation.platform,
        external_chat_id: conversation.external_chat_id,
        text_content,
        media_url,
        buttons,
      });

      // 2. Save Message to Database
      const message = await Message.create({
        conversation_id: conversationId,
        platform: conversation.platform,
        sender_type: 'AGENT',
        author_name: req.user?.name || 'Agent',
        author_id: req.user?._id,
        direction: MESSAGE_DIRECTIONS.OUTBOUND,
        text_content: text_content || '',
        media_url: media_url || '',
        media_type: media_type || '',
        media_name: media_name || '',
        buttons: buttons || [],
        status: dispatchResult.status,
      });

      // 3. Update Conversation last activity & Analytics counters
      conversation.last_activity_at = new Date();
      await conversation.save();

      const today = new Date().toISOString().split('T')[0];
      const hour = new Date().getHours();
      Promise.all([
        DailyAnalytics.findOneAndUpdate(
          { date: today, platform: conversation.platform },
          { $inc: { outbound_agent_count: 1 } },
          { upsert: true },
        ),
        HourlyAnalytics.findOneAndUpdate(
          { date: today, hour, platform: conversation.platform },
          { $inc: { outbound_count: 1 } },
          { upsert: true },
        ),
      ]).catch(() => {});

      // 4. Real-time broadcast
      emitEvent('new_message', {
        conversation_id: conversationId,
        message: {
          ...message.toObject(),
          id: message._id,
        },
      });

      return res.status(HTTP_STATUS.CREATED).json(
        formatResponse(true, { ...message.toObject(), id: message._id }, 'Message sent successfully.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async retryMessage(req, res, next) {
    try {
      const { messageId } = req.params;
      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          formatResponse(false, null, 'Message not found.'),
        );
      }

      const conversation = await Conversation.findById(message.conversation_id);
      const dispatchResult = await dispatcher.dispatchOutboundMessage({
        platform: message.platform,
        external_chat_id: conversation.external_chat_id,
        text_content: message.text_content,
        media_url: message.media_url,
      });

      message.status = dispatchResult.status;
      message.retry_count = (message.retry_count || 0) + 1;
      await message.save();

      emitEvent('message_status_update', {
        messageId: message._id,
        status: message.status,
      });

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, message, 'Message retried successfully.'),
      );
    } catch (error) {
      next(error);
    }
  },
};

export default messageController;
