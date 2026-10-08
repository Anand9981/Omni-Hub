import mongoose from 'mongoose';
import { Conversation, Message, Lead, PendingApproval } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { emitEvent } from '../sockets/index.js';

export const conversationController = {
  async listConversations(req, res, next) {
    try {
      const {
        platform,
        query,
        onlyUnread,
        onlyPending,
        onlyHuman,
        onlyUnassigned,
        assignedToMe,
        status,
        sort = 'latest',
      } = req.query;

      const filter = {};

      if (platform && platform !== 'All') {
        filter.platform = platform.toLowerCase();
      }

      if (status) {
        filter.status = status.toUpperCase();
      }

      if (onlyUnread === 'true') {
        filter.unread_count = { $gt: 0 };
      }

      if (onlyHuman === 'true') {
        filter.auto_pilot = 'OFF';
      }

      if (onlyUnassigned === 'true') {
        filter.assigned_agent_id = null;
      }

      if (assignedToMe === 'true' && req.user) {
        filter.assigned_agent_id = req.user._id;
      }

      if (query) {
        filter.$or = [
          { sender_name: new RegExp(query, 'i') },
          { external_chat_id: new RegExp(query, 'i') },
          { sender_email: new RegExp(query, 'i') },
          { sender_phone: new RegExp(query, 'i') },
        ];
      }

      const sortOrder = sort === 'oldest' ? { last_activity_at: 1 } : { last_activity_at: -1 };

      const conversations = await Conversation.find(filter)
        .populate('assigned_agent_id', 'name email role')
        .sort(sortOrder)
        .lean();

      const enriched = await Promise.all(
        conversations.map(async (conv) => {
          const lastMsg = await Message.findOne({ conversation_id: conv._id })
            .sort({ created_at: -1 })
            .lean();

          const lead = await Lead.findOne({ conversation_id: conv._id }).lean();
          const heldDraft = await PendingApproval.findOne({ conversation_id: conv._id, status: 'PENDING' }).lean();

          return {
            ...conv,
            id: conv._id,
            lastMessage: lastMsg,
            lead,
            heldDraft,
            unread: conv.unread_count || 0,
          };
        }),
      );

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, enriched, 'Conversations loaded successfully.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async getConversationById(req, res, next) {
    try {
      const { id } = req.params;
      const conversation = await Conversation.findById(id)
        .populate('assigned_agent_id', 'name email role')
        .lean();

      if (!conversation) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          formatResponse(false, null, 'Conversation thread not found.'),
        );
      }

      const lead = await Lead.findOne({ conversation_id: id }).lean();
      const heldDraft = await PendingApproval.findOne({ conversation_id: id, status: 'PENDING' }).lean();

      await Conversation.findByIdAndUpdate(id, { unread_count: 0 });

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, {
          ...conversation,
          id: conversation._id,
          lead,
          heldDraft,
          unread: 0,
        }, 'Conversation details loaded.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async toggleAutoPilot(req, res, next) {
    try {
      const { id } = req.params;
      const { enabled, auto_pilot } = req.body;
      const isEnabled = enabled !== undefined ? Boolean(enabled) : auto_pilot?.toUpperCase() === 'ON';

      const conversation = await Conversation.findByIdAndUpdate(
        id,
        { auto_pilot: isEnabled ? 'ON' : 'OFF' },
        { new: true },
      );

      if (!conversation) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          formatResponse(false, null, 'Conversation not found.'),
        );
      }

      emitEvent('autopilot_update', {
        conversationId: id,
        auto_pilot: conversation.auto_pilot,
      });

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, { auto_pilot: conversation.auto_pilot }, `Auto-Pilot set to ${conversation.auto_pilot}.`),
      );
    } catch (error) {
      next(error);
    }
  },

  async updateApprovalMode(req, res, next) {
    try {
      const { id } = req.params;
      const { approval_mode } = req.body;

      const conversation = await Conversation.findByIdAndUpdate(
        id,
        { approval_mode },
        { new: true },
      );

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, { approval_mode: conversation.approval_mode }, 'Approval mode updated.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async takeover(req, res, next) {
    try {
      const { id } = req.params;
      const conversation = await Conversation.findByIdAndUpdate(
        id,
        { auto_pilot: 'OFF', assigned_agent_id: req.user?._id || null },
        { new: true },
      );

      if (!conversation) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, null, 'Conversation thread not found.'));
      }

      emitEvent('autopilot_update', { conversationId: id, auto_pilot: 'OFF' });

      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, conversation, 'Human agent takeover completed. Auto-pilot turned OFF.'),
      );
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      if (mongoose.Types.ObjectId.isValid(id)) {
        await Conversation.findByIdAndUpdate(id, { unread_count: 0 });
      }
      return res.status(HTTP_STATUS.OK).json(
        formatResponse(true, { id }, 'Conversation marked as read.'),
      );
    } catch (error) {
      next(error);
    }
  },
};

export default conversationController;
