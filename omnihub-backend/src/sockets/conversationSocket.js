import { SOCKET_EVENTS } from '../utils/socketEvents.js';
import logger from '../utils/logger.js';

/**
 * Conversation Socket Handlers
 * Manages real-time conversation-level interactions:
 * - Join/leave conversation rooms
 * - Mark conversations as read
 * - Agent presence tracking within conversations
 */

/**
 * Register conversation-specific event handlers for a connected socket.
 */
export function registerConversationSocket(socket, io) {
  // ─── Join Conversation Room ──────────────────────────────
  socket.on(SOCKET_EVENTS.JOIN_CONVERSATION, (data) => {
    const { conversationId } = data || {};
    if (!conversationId) return;

    const room = `conversation:${conversationId}`;
    socket.join(room);

    // Also join user-specific room for targeted notifications
    if (socket.data.userId) {
      socket.join(`user:${socket.data.userId}`);
    }

    // Notify other agents that someone is viewing this conversation
    socket.to(room).emit('agent_viewing', {
      conversationId,
      userId: socket.data.userId,
      userName: socket.data.user?.name || 'Agent',
      action: 'joined',
    });

    logger.debug(`[ConversationSocket] ${socket.data.user?.name || socket.id} joined conversation ${conversationId}`);
  });

  // ─── Leave Conversation Room ─────────────────────────────
  socket.on(SOCKET_EVENTS.LEAVE_CONVERSATION, (data) => {
    const { conversationId } = data || {};
    if (!conversationId) return;

    const room = `conversation:${conversationId}`;
    socket.leave(room);

    socket.to(room).emit('agent_viewing', {
      conversationId,
      userId: socket.data.userId,
      userName: socket.data.user?.name || 'Agent',
      action: 'left',
    });

    logger.debug(`[ConversationSocket] ${socket.data.user?.name || socket.id} left conversation ${conversationId}`);
  });

  // ─── Typing Indicator ────────────────────────────────────
  socket.on(SOCKET_EVENTS.TYPING, (data) => {
    const { conversationId, isTyping } = data || {};
    if (!conversationId) return;

    const room = `conversation:${conversationId}`;
    socket.to(room).emit(SOCKET_EVENTS.TYPING, {
      conversationId,
      isTyping: !!isTyping,
      userId: socket.data.userId,
      userName: socket.data.user?.name || 'Agent',
    });
  });

  // ─── Mark Conversation Read ──────────────────────────────
  socket.on('mark_read', async (data) => {
    const { conversationId } = data || {};
    if (!conversationId) return;

    try {
      const { Conversation } = await import('../models/index.js');
      await Conversation.findByIdAndUpdate(conversationId, { unread_count: 0 });

      // Notify dashboard watchers that the unread count changed
      io.to('dashboard').emit(SOCKET_EVENTS.CONVERSATION_UPDATE, { conversationId });
      logger.debug(`[ConversationSocket] Marked conversation ${conversationId} as read`);
    } catch (err) {
      logger.warn(`[ConversationSocket] mark_read error: ${err.message}`);
    }
  });

  // ─── Cleanup on disconnect ───────────────────────────────
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    // Socket.io automatically removes from all rooms on disconnect
    logger.debug(`[ConversationSocket] ${socket.data.user?.name || socket.id} disconnected`);
  });
}

export default registerConversationSocket;
