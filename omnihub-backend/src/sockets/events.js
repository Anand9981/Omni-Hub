import { SOCKET_EVENTS } from '../utils/socketEvents.js';
import logger from '../utils/logger.js';

/**
 * Socket Event Definitions & Handler Registry
 * Registers all server-side socket event listeners when a client connects.
 * Acts as the central "router" for socket events — similar to routes/index.js for HTTP.
 */

/**
 * Register all event handlers for a connected socket.
 * Called from sockets/index.js on each new connection.
 */
export function registerSocketEvents(socket, io) {
  // ─── Room: Conversation ────────────────────────────────
  socket.on(SOCKET_EVENTS.JOIN_CONVERSATION, (data) => {
    const conversationId = data?.conversationId;
    if (!conversationId) return;

    const room = `conversation:${conversationId}`;
    socket.join(room);
    logger.debug(`[Socket] ${socket.data.userId || socket.id} joined room ${room}`);
  });

  socket.on(SOCKET_EVENTS.LEAVE_CONVERSATION, (data) => {
    const conversationId = data?.conversationId;
    if (!conversationId) return;

    const room = `conversation:${conversationId}`;
    socket.leave(room);
    logger.debug(`[Socket] ${socket.data.userId || socket.id} left room ${room}`);
  });

  // ─── Room: Dashboard (analytics, approvals) ───────────
  socket.on(SOCKET_EVENTS.JOIN_DASHBOARD, () => {
    socket.join('dashboard');
    logger.debug(`[Socket] ${socket.data.userId || socket.id} joined dashboard room`);
  });

  socket.on(SOCKET_EVENTS.LEAVE_DASHBOARD, () => {
    socket.leave('dashboard');
    logger.debug(`[Socket] ${socket.data.userId || socket.id} left dashboard room`);
  });

  // ─── Typing Indicator ─────────────────────────────────
  socket.on(SOCKET_EVENTS.TYPING, (data) => {
    const { conversationId, isTyping } = data || {};
    if (!conversationId) return;

    // Broadcast to everyone in the conversation room except the sender
    const room = `conversation:${conversationId}`;
    socket.to(room).emit(SOCKET_EVENTS.TYPING, {
      conversationId,
      isTyping: !!isTyping,
      userId: socket.data.userId,
      userName: socket.data.user?.name || 'Agent',
    });
  });

  // ─── Disconnect ────────────────────────────────────────
  socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
    logger.info(`[Socket] Disconnected (${socket.id}): ${reason}`);
  });
}

/**
 * Emit helpers — targeted emission to specific rooms or users.
 * These are used by services/controllers to broadcast events.
 */

/**
 * Emit to all clients watching a specific conversation.
 */
export function emitToConversation(io, conversationId, event, data) {
  io.to(`conversation:${conversationId}`).emit(event, data);
}

/**
 * Emit to all clients on the dashboard.
 */
export function emitToDashboard(io, event, data) {
  io.to('dashboard').emit(event, data);
}

/**
 * Emit to a specific user across all their connected sockets.
 */
export function emitToUser(io, userId, event, data) {
  if (!userId) return;
  const userRoom = `user:${userId}`;
  io.to(userRoom).emit(event, data);
}

export default {
  registerSocketEvents,
  emitToConversation,
  emitToDashboard,
  emitToUser,
};
