import { PendingApproval, Message, Conversation } from '../models/index.js';
import dispatcher from './dispatcher.js';
import { emitEvent } from '../sockets/index.js';
import logger from '../utils/logger.js';
import { MESSAGE_DIRECTIONS, MESSAGE_STATUS } from '../utils/constants.js';

export const approvalService = {
  async listPending() {
    return PendingApproval.find({ status: 'PENDING' })
      .populate('conversation_id')
      .sort({ created_at: -1 });
  },

  async approveDraft(approvalId, reviewerId) {
    const approval = await PendingApproval.findById(approvalId);
    if (!approval) throw new Error('Pending approval not found.');
    if (approval.status !== 'PENDING') throw new Error(`Approval is already in state: ${approval.status}`);

    const conversation = await Conversation.findById(approval.conversation_id);
    if (!conversation) throw new Error('Conversation thread not found.');

    const finalText = approval.edited_text || approval.proposed_text;

    // 1. Dispatch outbound message to the user
    const dispatchResult = await dispatcher.dispatchOutboundMessage({
      platform: conversation.platform,
      external_chat_id: conversation.external_chat_id,
      text_content: finalText,
    });

    // 2. Create Message document
    const message = await Message.create({
      conversation_id: conversation._id,
      platform: conversation.platform,
      sender_type: 'BOT',
      direction: MESSAGE_DIRECTIONS.OUTBOUND,
      text_content: finalText,
      status: dispatchResult.status,
    });

    // 3. Mark approval resolved
    approval.status = 'APPROVED';
    approval.reviewer_id = reviewerId;
    approval.message_id = message._id;
    await approval.save();

    // 4. Update Conversation last activity
    conversation.last_activity_at = new Date();
    await conversation.save();

    // 5. Emit real-time socket events
    emitEvent('new_message', {
      conversation_id: conversation._id,
      message,
    });

    emitEvent('approval_resolved', {
      approvalId: approval._id,
      status: 'APPROVED',
      conversationId: conversation._id,
    });

    logger.info(`[Approval Service] Approved AI draft ${approval._id} for conversation ${conversation._id}`);
    return { approval, message };
  },

  async rejectDraft(approvalId, reviewerId, reason = '') {
    const approval = await PendingApproval.findById(approvalId);
    if (!approval) throw new Error('Pending approval not found.');

    approval.status = 'REJECTED';
    approval.reviewer_id = reviewerId;
    approval.rejected_reason = reason;
    await approval.save();

    emitEvent('approval_resolved', {
      approvalId: approval._id,
      status: 'REJECTED',
      conversationId: approval.conversation_id,
    });

    logger.info(`[Approval Service] Rejected AI draft ${approval._id}`);
    return approval;
  },

  async editAndApproveDraft(approvalId, editedText, reviewerId) {
    const approval = await PendingApproval.findById(approvalId);
    if (!approval) throw new Error('Pending approval not found.');

    approval.edited_text = editedText.trim();
    approval.status = 'EDITED';
    await approval.save();

    return this.approveDraft(approvalId, reviewerId);
  },
};

export default approvalService;
