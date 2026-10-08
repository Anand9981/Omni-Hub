import { APPROVAL_STATUS, DIRECTION, MESSAGE_STATUS, SENDER_TYPE } from '../utils/constants.js';
import { conversationService, demoStore } from './conversationService.js';

/**
 * Approval queue for held AI drafts (PRD 9.2).
 *
 * Mirrors the PRD 21.2 endpoints so the backend swap is a straight
 * replacement of these function bodies:
 *   GET  /api/approvals/pending
 *   POST /api/approvals/{id}/approve
 *   POST /api/approvals/{id}/reject
 *   POST /api/approvals/{id}/edit
 */

const withContext = (approval) => {
  const conversation = demoStore.conversations().find((row) => row.id === approval.conversation_id);
  const lead = conversationService.getLead(approval.conversation_id);
  const history = conversationService.getMessages(approval.conversation_id);
  return {
    ...approval,
    conversation,
    lead,
    lastInbound: [...history].reverse().find((message) => message.direction === DIRECTION.INBOUND) || null,
    waitingMinutes: Math.max(0, Math.round((Date.now() - new Date(approval.created_at).getTime()) / 60000)),
  };
};

export const approvalService = {
  /** Held drafts, longest waiting first. */
  listPending() {
    demoStore.ensureSeed();
    return demoStore.approvals()
      .filter((approval) => approval.status === APPROVAL_STATUS.PENDING)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map(withContext);
  },

  listResolved(limit = 6) {
    demoStore.ensureSeed();
    return demoStore.approvals()
      .filter((approval) => approval.status !== APPROVAL_STATUS.PENDING)
      .sort((a, b) => new Date(b.resolved_at || b.created_at) - new Date(a.resolved_at || a.created_at))
      .slice(0, limit)
      .map(withContext);
  },

  /** PRD 9.2 - [Approve & Send]. Optionally sends an edited body. */
  approve(approvalId, editedText) {
    const rows = demoStore.approvals();
    const target = rows.find((row) => row.id === approvalId);
    if (!target || target.status !== APPROVAL_STATUS.PENDING) throw new Error('That draft is no longer in the queue.');

    const body = (editedText ?? target.proposed_text).trim();
    if (!body) throw new Error('A draft cannot be empty.');
    const resolvedAt = new Date().toISOString();

    demoStore.saveApprovals(rows.map((row) => (row.id === approvalId
      ? {
        ...row,
        status: editedText ? APPROVAL_STATUS.EDITED : APPROVAL_STATUS.APPROVED,
        final_text: body || null,
        resolved_at: resolvedAt,
      }
      : row)));

    const message = conversationService.appendMessage(target.conversation_id, {
      sender_type: SENDER_TYPE.AGENT,
      direction: DIRECTION.OUTBOUND,
      text_content: body,
      status: MESSAGE_STATUS.SENT.id,
      approved_by: 'Admin',
      approved_at: resolvedAt,
    });

    return message;
  },

  /** PRD 9.2 - [Edit Draft] keeps the row in the queue with new text. */
  edit(approvalId, text) {
    const rows = demoStore.approvals();
    const target = rows.find((row) => row.id === approvalId);
    if (!target || target.status !== APPROVAL_STATUS.PENDING) throw new Error('That draft is no longer in the queue.');
    const body = text.trim();
    if (!body) throw new Error('A draft cannot be empty.');
    demoStore.saveApprovals(rows.map((row) => (row.id === approvalId ? { ...row, proposed_text: body } : row)));
    return { ...target, proposed_text: body };
  },

  /** PRD 9.2 - [Reject] drops the draft without dispatching. */
  reject(approvalId, reason = 'Rejected by admin') {
    const rows = demoStore.approvals();
    const target = rows.find((row) => row.id === approvalId);
    if (!target || target.status !== APPROVAL_STATUS.PENDING) throw new Error('That draft is no longer in the queue.');
    const resolvedAt = new Date().toISOString();

    demoStore.saveApprovals(rows.map((row) => (row.id === approvalId
      ? { ...row, status: APPROVAL_STATUS.REJECTED, rejection_reason: reason, resolved_at: resolvedAt }
      : row)));

    conversationService.appendMessage(target.conversation_id, {
      sender_type: SENDER_TYPE.BOT,
      direction: DIRECTION.OUTBOUND,
      text_content: 'Draft rejected by admin.',
      status: MESSAGE_STATUS.REJECTED.id,
      is_note_only: true,
    });
    return { ...target, status: APPROVAL_STATUS.REJECTED };
  },

  /** Adds a draft to the queue - used when Auto-Pilot proposes a reply. */
  create({ conversationId, text, source = 'AI draft' }) {
    const approval = {
      id: demoStore.newId('apr'),
      conversation_id: conversationId,
      message_id: null,
      platform: demoStore.conversations().find((row) => row.id === conversationId)?.platform,
      status: APPROVAL_STATUS.PENDING,
      created_at: new Date().toISOString(),
      proposed_text: text,
      source,
    };
    demoStore.saveApprovals([...demoStore.approvals(), approval]);
    return withContext(approval);
  },
};