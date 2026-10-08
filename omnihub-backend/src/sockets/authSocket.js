import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/index.js';
import logger from '../utils/logger.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';

/**
 * Socket.io Authentication Middleware
 * Validates JWT from the handshake auth object or query params.
 * Attaches the authenticated user to socket.data.user for downstream handlers.
 */
export function socketAuthMiddleware(socket, next) {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
    socket.handshake.query?.token;

  if (!token) {
    logger.warn(`[Socket Auth] Connection rejected — no token provided (${socket.id})`);
    socket.emit(SOCKET_EVENTS.AUTH_ERROR, { message: 'Authentication required' });
    return next(new Error('Authentication required'));
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    logger.warn(`[Socket Auth] Connection rejected — invalid token (${socket.id})`);
    socket.emit(SOCKET_EVENTS.AUTH_ERROR, { message: 'Invalid or expired token' });
    return next(new Error('Invalid or expired token'));
  }

  // Attach user id for lazy-loading full user doc only when needed
  socket.data.userId = decoded.userId;
  socket.data.role = decoded.role || null;

  // Async user lookup (non-blocking for handshake)
  User.findById(decoded.userId)
    .select('-password')
    .then((user) => {
      if (user && user.status === 'active') {
        socket.data.user = user;
        socket.emit(SOCKET_EVENTS.AUTH_SUCCESS, {
          userId: user._id,
          name: user.name,
          role: user.role,
        });
        logger.info(`[Socket Auth] Authenticated: ${user.name} (${user.role}) — ${socket.id}`);
      } else {
        logger.warn(`[Socket Auth] User not found or inactive — ${socket.id}`);
      }
    })
    .catch((err) => {
      logger.warn(`[Socket Auth] User lookup failed — ${err.message}`);
    });

  next();
}

/**
 * Optional: Allow unauthenticated connections in development mode.
 * Useful for widget/webchat connections that don't have user tokens.
 */
export function socketAuthOptional(socket, next) {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
    socket.handshake.query?.token;

  if (!token) {
    socket.data.userId = null;
    socket.data.role = 'guest';
    socket.data.isGuest = true;
    logger.info(`[Socket Auth] Guest connection allowed — ${socket.id}`);
    return next();
  }

  // If token is provided, validate it
  return socketAuthMiddleware(socket, next);
}

export default socketAuthMiddleware;
