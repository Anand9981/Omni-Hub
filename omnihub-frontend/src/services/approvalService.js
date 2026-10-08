import api from '../api/axios.js';
import { APPROVAL_STATUS, DIRECTION, MESSAGE_STATUS, SENDER_TYPE } from '../utils/constants.js';
import { conversationService, demoStore } from './conversationService.js';

/**
 * Approval queue for held AI drafts (PRD 9.2).
 *
 * Connects to live backend endpoints with resilient fallback:
 *   GET  /api/dashboard/approvals/pending
 *   GET  /api/dashboard/approvals/resolved
 *   POST /api/dashboard/approvals/{id}/approve
 *   POST /api/dashboard/approvals/{id}/reject
 *   POST /api/dashboard/approvals/{id}/edit
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

const normalizeBackendApproval = (item) => {
  const conv = item.conversation_id || {};
  const convId = conv._id || conv.id || item.conversation_id;
  const createdAt = item.created_at || item.createdAt || new Date().toISOString();
  return {
    id: item._id || item.id,
    _id: item._id || item.id,
    conversation_id: convId,
    conversation: typeof conv === 'object' && conv !== null ? {
      id: conv._id || conv.id,
      _id: conv._id || conv.id,
      sender_name: conv.sender_name || 'Customer',
      sender_email: conv.sender_email || '',
      external_chat_id: conv.external_chat_id || '',
      platform: conv.platform || item.platform || 'chat',
    } : null,
    lead: conv.sender_name ? {
      full_name: conv.sender_name,
      email: conv.sender_email,
      phone: conv.sender_phone,
    } : null,
    platform: conv.platform || item.platform || 'chat',
    proposed_text: item.proposed_text || '',
    edited_text: item.edited_text || '',
    source: item.source || 'AI Draft',
    status: item.status || 'PENDING',
    created_at: createdAt,
    waitingMinutes: Math.max(0, Math.round((Date.now() - new Date(createdAt).getTime()) / 60000)),
  };
};

export const approvalService = {
  /** Held drafts, longest waiting first. */
  async listPending() {
    try {
      const res = await api.get('/dashboard/approvals/pending');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const liveItems = res.data.data.map(normalizeBackendApproval);
        if (liveItems.length > 0) return liveItems;
      }
    } catch (err) {
      console.warn('[approvalService] Backend listPending fallback:', err.message);
    }

    demoStore.ensureSeed();
    return demoStore.approvals()
      .filter((approval) => approval.status === APPROVAL_STATUS.PENDING)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map(withContext);
  },

  async listResolved(limit = 6) {
    try {
      const res = await api.get(`/dashboard/approvals/resolved?limit=${limit}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        const liveItems = res.data.data.map(normalizeBackendApproval);
        if (liveItems.length > 0) return liveItems;
      }
    } catch (err) {
      console.warn('[approvalService] Backend listResolved fallback:', err.message);
    }

    demoStore.ensureSeed();
    return demoStore.approvals()
      .filter((approval) => approval.status !== APPROVAL_STATUS.PENDING)
      .sort((a, b) => new Date(b.resolved_at || b.created_at) - new Date(a.resolved_at || a.created_at))
      .slice(0, limit)
      .map(withContext);
  },

  /** PRD 9.2 - [Approve & Send]. Optionally sends an edited body. */
  async approve(approvalId, editedText) {
    try {
      if (editedText) {
        await api.post(`/dashboard/approvals/${approvalId}/edit`, { text: editedText, sendImmediately: true });
      } else {
        await api.post(`/dashboard/approvals/${approvalId}/approve`);
      }
    } catch (err) {
      console.warn('[approvalService] Backend approve error:', err.message);
    }

    const rows = demoStore.approvals();
    const target = rows.find((row) => row.id === approvalId);
    if (!target || target.status !== APPROVAL_STATUS.PENDING) {
      return null;
    }

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
  async edit(approvalId, text) {
    try {
      await api.post(`/dashboard/approvals/${approvalId}/edit`, { text, sendImmediately: false });
    } catch (err) {
      console.warn('[approvalService] Backend edit error:', err.message);
    }

    const rows = demoStore.approvals();
    const target = rows.find((row) => row.id === approvalId);
    if (!target || target.status !== APPROVAL_STATUS.PENDING) {
      return null;
    }
    const body = text.trim();
    if (!body) throw new Error('A draft cannot be empty.');
    demoStore.saveApprovals(rows.map((row) => (row.id === approvalId ? { ...row, proposed_text: body } : row)));
    return { ...target, proposed_text: body };
  },

  /** PRD 9.2 - [Reject] drops the draft without dispatching. */
  async reject(approvalId, reason = 'Rejected by admin') {
    try {
      await api.post(`/dashboard/approvals/${approvalId}/reject`, { reason });
    } catch (err) {
      console.warn('[approvalService] Backend reject error:', err.message);
    }

    const rows = demoStore.approvals();
    const target = rows.find((row) => row.id === approvalId);
    if (!target || target.status !== APPROVAL_STATUS.PENDING) {
      return null;
    }
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

export default approvalService;