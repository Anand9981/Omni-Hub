/**
 * Socket Event Name Constants
 * Single source of truth for all real-time event names.
 * These MUST match the events the frontend SocketContext.jsx listens for.
 */

export const SOCKET_EVENTS = {
  // ─── Connection lifecycle ──────────────────────────────
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // ─── Authentication ────────────────────────────────────
  AUTH_SUCCESS: 'auth:success',
  AUTH_ERROR: 'auth:error',
  AUTH_LOGOUT: 'auth:logout',

  // ─── Conversations ─────────────────────────────────────
  // Frontend listens: socket.on('conversation_update', () => dispatch(syncFromStore()))
  CONVERSATION_UPDATE: 'conversation_update',
  CONVERSATION_NEW: 'conversation_new',
  CONVERSATION_CLOSED: 'conversation_closed',

  // ─── Messages ──────────────────────────────────────────
  // Frontend listens: socket.on('new_message', (payload) => dispatch(receiveMessage(payload)))
  //   payload: { conversationId, message: { id, sender_type, direction, text_content, status, ... } }
  NEW_MESSAGE: 'new_message',

  // Frontend listens: socket.on('message_status', (payload) => dispatch(applyDeliveryReceipt(payload)))
  //   payload: { conversationId, messageId, status, failureReason? }
  MESSAGE_STATUS: 'message_status',

  // Frontend listens: socket.on('typing', (payload) => dispatch(setTyping(payload)))
  //   payload: { conversationId, isTyping }
  TYPING: 'typing',

  // ─── Approvals ─────────────────────────────────────────
  // Frontend listens: socket.on('pending_approval', (payload) => dispatch(receivePending(payload)))
  //   payload: approval draft object
  PENDING_APPROVAL: 'pending_approval',
  APPROVAL_RESOLVED: 'approval_resolved',

  // ─── Agents ────────────────────────────────────────────
  AGENT_ASSIGNED: 'agent_assigned',
  AGENT_UNASSIGNED: 'agent_unassigned',
  AGENT_STATUS_CHANGE: 'agent_status_change',

  // ─── Auto-Pilot ────────────────────────────────────────
  AUTOPILOT_UPDATE: 'autopilot_update',

  // ─── Notes & Mentions ──────────────────────────────────
  NEW_NOTE: 'new_note',
  MENTION_NOTIFICATION: 'mention_notification',

  // ─── Analytics (real-time dashboard) ───────────────────
  ANALYTICS_UPDATE: 'analytics_update',
  ANALYTICS_SNAPSHOT: 'analytics_snapshot',

  // ─── Room Management (client → server) ─────────────────
  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',
  JOIN_DASHBOARD: 'join_dashboard',
  LEAVE_DASHBOARD: 'leave_dashboard',

  // ─── System / Background Jobs ──────────────────────────
  JOB_STARTED: 'job:started',
  JOB_COMPLETED: 'job:completed',
  JOB_FAILED: 'job:failed',
  SYSTEM_NOTIFICATION: 'system:notification',
};

export default SOCKET_EVENTS;
