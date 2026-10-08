import { SOCKET_EVENTS } from '../utils/socketEvents.js';
import { DailyAnalytics, HourlyAnalytics, Conversation, Message } from '../models/index.js';
import { PLATFORMS } from '../utils/constants.js';
import logger from '../utils/logger.js';

/**
 * Analytics Socket Handlers
 * Provides real-time analytics dashboard updates:
 * - Dashboard room management
 * - On-demand analytics snapshot
 * - Periodic broadcast of live metrics
 */

let analyticsInterval = null;

/**
 * Register analytics-specific event handlers for a connected socket.
 */
export function registerAnalyticsSocket(socket, io) {
  // ─── Join Dashboard Room ───────────────────────────────
  socket.on(SOCKET_EVENTS.JOIN_DASHBOARD, () => {
    socket.join('dashboard');
    logger.debug(`[AnalyticsSocket] ${socket.data.user?.name || socket.id} joined dashboard`);

    // Send an immediate snapshot when they join
    sendAnalyticsSnapshot(socket).catch((err) => {
      logger.warn(`[AnalyticsSocket] Snapshot error: ${err.message}`);
    });
  });

  // ─── Leave Dashboard Room ──────────────────────────────
  socket.on(SOCKET_EVENTS.LEAVE_DASHBOARD, () => {
    socket.leave('dashboard');
    logger.debug(`[AnalyticsSocket] ${socket.data.user?.name || socket.id} left dashboard`);
  });

  // ─── On-demand snapshot request ─────────────────────────
  socket.on(SOCKET_EVENTS.ANALYTICS_SNAPSHOT, () => {
    sendAnalyticsSnapshot(socket).catch((err) => {
      logger.warn(`[AnalyticsSocket] On-demand snapshot error: ${err.message}`);
    });
  });
}

/**
 * Send a current analytics snapshot to a specific socket.
 */
async function sendAnalyticsSnapshot(socket) {
  const today = new Date().toISOString().split('T')[0];

  try {
    const [dailyStats, hourlyStats, activeConversations, recentMessageCount] = await Promise.all([
      DailyAnalytics.find({ date: today }).lean(),
      HourlyAnalytics.find({ date: today }).lean(),
      Conversation.countDocuments({ status: 'ACTIVE' }),
      Message.countDocuments({
        created_at: { $gte: new Date(today) },
      }),
    ]);

    // Aggregate platform-wise totals
    const platformSummary = {};
    for (const platform of Object.values(PLATFORMS)) {
      const daily = dailyStats.find((d) => d.platform === platform) || {};
      platformSummary[platform] = {
        inbound: daily.inbound_count || 0,
        outbound_ai: daily.outbound_ai_count || 0,
        outbound_agent: daily.outbound_agent_count || 0,
        outbound_menu: daily.outbound_menu_count || 0,
        pending: daily.pending_count || 0,
      };
    }

    const snapshot = {
      date: today,
      active_conversations: activeConversations,
      total_messages_today: recentMessageCount,
      platforms: platformSummary,
      hourly: hourlyStats.map((h) => ({
        hour: h.hour,
        platform: h.platform,
        inbound: h.inbound_count,
        outbound: h.outbound_count,
      })),
      generated_at: new Date().toISOString(),
    };

    socket.emit(SOCKET_EVENTS.ANALYTICS_SNAPSHOT, snapshot);
  } catch (err) {
    logger.warn(`[AnalyticsSocket] Failed to build snapshot: ${err.message}`);
  }
}

/**
 * Start periodic analytics broadcasts to the dashboard room.
 * Called once during server initialization.
 * Broadcasts every 30 seconds to all clients in the "dashboard" room.
 */
export function startAnalyticsBroadcast(io) {
  if (analyticsInterval) {
    clearInterval(analyticsInterval);
  }

  const BROADCAST_INTERVAL_MS = 30_000; // 30 seconds

  analyticsInterval = setInterval(async () => {
    const dashboardRoom = io.sockets.adapter.rooms.get('dashboard');
    if (!dashboardRoom || dashboardRoom.size === 0) {
      return; // No one watching — skip the query
    }

    const today = new Date().toISOString().split('T')[0];

    try {
      const [activeConversations, totalMessagesToday] = await Promise.all([
        Conversation.countDocuments({ status: 'ACTIVE' }),
        Message.countDocuments({ created_at: { $gte: new Date(today) } }),
      ]);

      io.to('dashboard').emit(SOCKET_EVENTS.ANALYTICS_UPDATE, {
        active_conversations: activeConversations,
        total_messages_today: totalMessagesToday,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      logger.warn(`[AnalyticsSocket] Broadcast error: ${err.message}`);
    }
  }, BROADCAST_INTERVAL_MS);

  logger.info(`[AnalyticsSocket] Periodic dashboard broadcast started (every ${BROADCAST_INTERVAL_MS / 1000}s)`);
}

/**
 * Stop periodic analytics broadcasts (cleanup on shutdown).
 */
export function stopAnalyticsBroadcast() {
  if (analyticsInterval) {
    clearInterval(analyticsInterval);
    analyticsInterval = null;
    logger.info('[AnalyticsSocket] Periodic dashboard broadcast stopped');
  }
}

export default {
  registerAnalyticsSocket,
  startAnalyticsBroadcast,
  stopAnalyticsBroadcast,
};
