import { DailyAnalytics, HourlyAnalytics, Conversation, Message } from '../models/index.js';
import { PLATFORMS } from '../utils/constants.js';

export const analyticsService = {
  async getAnalyticsSummary(date = new Date().toISOString().split('T')[0]) {
    const [dailyStats, hourlyStats, totalConversations, totalMessages] = await Promise.all([
      DailyAnalytics.find({ date }).lean(),
      HourlyAnalytics.find({ date }).lean(),
      Conversation.countDocuments({ status: 'ACTIVE' }),
      Message.countDocuments({ created_at: { $gte: new Date(date) } }),
    ]);

    const platformSummary = {};
    for (const platform of Object.values(PLATFORMS)) {
      const daily = dailyStats.find((d) => d.platform === platform) || {};
      platformSummary[platform] = {
        inbound: daily.inbound_count || 0,
        outbound_ai: daily.outbound_ai_count || 0,
        outbound_agent: daily.outbound_agent_count || 0,
        outbound_menu: daily.outbound_menu_count || 0,
      };
    }

    return {
      date,
      active_conversations: totalConversations,
      total_messages_today: totalMessages,
      platforms: platformSummary,
      hourly: hourlyStats,
    };
  },
};

export default analyticsService;
