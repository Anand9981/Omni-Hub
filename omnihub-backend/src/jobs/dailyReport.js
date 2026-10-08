import { DailyAnalytics, HourlyAnalytics, Conversation, Message } from '../models/index.js';
import { PLATFORMS } from '../utils/constants.js';
import logger from '../utils/logger.js';

/**
 * Daily Report Generator Job
 * Runs every day at midnight (00:00) — generates a comprehensive daily summary
 * by aggregating hourly stats into the DailyAnalytics collection.
 *
 * Cron: '0 0 * * *' (midnight every day)
 */
export async function dailyReportJob() {
  // Generate report for the previous day
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  logger.info(`[DailyReport] Generating report for ${dateStr}...`);

  try {
    const platforms = Object.values(PLATFORMS);

    for (const platform of platforms) {
      // Aggregate hourly data into daily totals
      const hourlyData = await HourlyAnalytics.find({
        date: dateStr,
        platform,
      }).lean();

      if (hourlyData.length === 0) continue;

      const totalInbound = hourlyData.reduce((sum, h) => sum + (h.inbound_count || 0), 0);
      const totalOutbound = hourlyData.reduce((sum, h) => sum + (h.outbound_count || 0), 0);

      // Count outbound messages by sender type for yesterday
      const startOfDay = new Date(dateStr);
      const endOfDay = new Date(dateStr);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const [aiCount, agentCount] = await Promise.all([
        Message.countDocuments({
          platform,
          direction: 'OUTBOUND',
          sender_type: 'BOT',
          created_at: { $gte: startOfDay, $lt: endOfDay },
        }),
        Message.countDocuments({
          platform,
          direction: 'OUTBOUND',
          sender_type: 'AGENT',
          created_at: { $gte: startOfDay, $lt: endOfDay },
        }),
      ]);

      // Upsert the daily analytics record
      await DailyAnalytics.findOneAndUpdate(
        { date: dateStr, platform },
        {
          $set: {
            inbound_count: totalInbound,
            outbound_ai_count: aiCount,
            outbound_agent_count: agentCount,
            outbound_menu_count: totalOutbound - aiCount - agentCount,
          },
        },
        { upsert: true, new: true },
      );

      logger.debug(`[DailyReport] ${platform}: inbound=${totalInbound}, AI=${aiCount}, agent=${agentCount}`);
    }

    // Count conversations created/closed yesterday
    const startOfYesterday = new Date(dateStr);
    const endOfYesterday = new Date(dateStr);
    endOfYesterday.setDate(endOfYesterday.getDate() + 1);

    const [newConversations, closedConversations] = await Promise.all([
      Conversation.countDocuments({
        created_at: { $gte: startOfYesterday, $lt: endOfYesterday },
      }),
      Conversation.countDocuments({
        status: 'CLOSED',
        updated_at: { $gte: startOfYesterday, $lt: endOfYesterday },
      }),
    ]);

    logger.info(
      `[DailyReport] ✅ Report for ${dateStr} complete — ` +
      `new conversations: ${newConversations}, closed: ${closedConversations}`,
    );

    return {
      date: dateStr,
      new_conversations: newConversations,
      closed_conversations: closedConversations,
    };
  } catch (error) {
    logger.error(`[DailyReport] Failed for ${dateStr}: ${error.message}`);
    throw error;
  }
}

export default dailyReportJob;
