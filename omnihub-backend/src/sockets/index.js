import { SOCKET_EVENTS } from '../utils/socketEvents.js';
import { socketAuthMiddleware, socketAuthOptional } from './authSocket.js';
import { registerConversationSocket } from './conversationSocket.js';
import { registerAnalyticsSocket, startAnalyticsBroadcast, stopAnalyticsBroadcast } from './analyticsSocket.js';
import logger from '../utils/logger.js';

/**
 * Socket.io Manager — Central Hub
 * Initializes authentication, registers event handlers, and provides
 * unified emit helpers for the rest of the application.
 */

let ioInstance = null;

// ─── Initialization ──────────────────────────────────────

/**
 * Initialize the Socket.io server with auth and all handler modules.
 * Called once from src/server.js after the io instance is created.
 */
export function initSocket(io) {
  ioInstance = io;

  // Apply authentication middleware
  // Use socketAuthOptional to allow guest/widget connections in dev mode
  const isProduction = process.env.NODE_ENV === 'production';
  io.use(isProduction ? socketAuthMiddleware : socketAuthOptional);

  // Handle new connections
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    const userName = socket.data.user?.name || (socket.data.isGuest ? 'Guest' : socket.id);
    logger.info(`[Socket.io] Client connected: ${userName} (${socket.id})`);

    // Auto-join user-specific room for targeted notifications
    if (socket.data.userId) {
      socket.join(`user:${socket.data.userId}`);
    }

    // Register all domain-specific socket handlers
    registerConversationSocket(socket, io);
    registerAnalyticsSocket(socket, io);

    // Disconnect handler
    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      logger.info(`[Socket.io] Client disconnected: ${userName} (${socket.id}) — ${reason}`);
    });
  });

  // Start periodic analytics broadcasts
  startAnalyticsBroadcast(io);

  logger.info('[Socket.io] Socket manager initialized with auth + conversation + analytics handlers');
}

// ─── Getters ─────────────────────────────────────────────

/**
 * Get the raw Socket.io Server instance.
 */
export function getIO() {
  return ioInstance;
}

// ─── Emit Helpers ────────────────────────────────────────

/**
 * Broadcast an event to ALL connected clients.
 */
export function emitEvent(event, data) {
  if (ioInstance) {
    ioInstance.emit(event, data);
  }
}

/**
 * Emit to all clients in a specific conversation room.
 */
export function emitToConversation(conversationId, event, data) {
  if (ioInstance) {
    ioInstance.to(`conversation:${conversationId}`).emit(event, data);
  }
}

/**
 * Emit to all clients watching the dashboard.
 */
export function emitToDashboard(event, data) {
  if (ioInstance) {
    ioInstance.to('dashboard').emit(event, data);
  }
}

/**
 * Emit to a specific user across all their connected devices/tabs.
 */
export function emitToUser(userId, event, data) {
  if (ioInstance && userId) {
    ioInstance.to(`user:${userId}`).emit(event, data);
  }
}

/**
 * Get count of currently connected clients.
 */
export function getConnectedCount() {
  if (!ioInstance) return 0;
  return ioInstance.sockets.sockets.size;
}

/**
 * Graceful shutdown — stop broadcasts and close connections.
 */
export function shutdownSocket() {
  stopAnalyticsBroadcast();
  if (ioInstance) {
    ioInstance.close();
    logger.info('[Socket.io] Socket server shut down gracefully');
  }
}

export default {
  initSocket,
  getIO,
  emitEvent,
  emitToConversation,
  emitToDashboard,
  emitToUser,
  getConnectedCount,
  shutdownSocket,
};
