import { DailyAnalytics, HourlyAnalytics, Message } from '../models/index.js';
import { PLATFORMS } from '../utils/constants.js';
import logger from '../utils/logger.js';

/**
 * Analytics Aggregator Job
 * Runs every hour at minute 5 — syncs message counts into HourlyAnalytics
 * and rolls up totals into DailyAnalytics for the current day.
 *
 * Cron: '5 * * * *' (5 minutes past every hour)
 */
export async function analyticsAggregatorJob() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentHour = now.getHours();
  const previousHour = currentHour === 0 ? 23 : currentHour - 1;

  // Aggregate for the previous hour (it just ended)
  const aggregateDate = currentHour === 0
    ? new Date(now.getTime() - 3600000).toISOString().split('T')[0] // yesterday if we crossed midnight
    : today;

  logger.info(`[AnalyticsAggregator] Aggregating hour ${previousHour} of ${aggregateDate}...`);

  try {
    const platforms = Object.values(PLATFORMS);

    for (const platform of platforms) {
      // Time window for the previous hour
      const hourStart = new Date(aggregateDate);
      hourStart.setHours(previousHour, 0, 0, 0);
      const hourEnd = new Date(aggregateDate);
      hourEnd.setHours(previousHour, 59, 59, 999);

      // Count messages in this window
      const [inboundCount, outboundCount] = await Promise.all([
        Message.countDocuments({
          platform,
          direction: 'INBOUND',
          created_at: { $gte: hourStart, $lte: hourEnd },
        }),
        Message.countDocuments({
          platform,
          direction: 'OUTBOUND',
          created_at: { $gte: hourStart, $lte: hourEnd },
        }),
      ]);

      if (inboundCount === 0 && outboundCount === 0) continue;

      // Upsert hourly record
      await HourlyAnalytics.findOneAndUpdate(
        { date: aggregateDate, hour: previousHour, platform },
        {
          $set: {
            inbound_count: inboundCount,
            outbound_count: outboundCount,
          },
        },
        { upsert: true, new: true },
      );

      logger.debug(
        `[AnalyticsAggregator] ${platform} hour ${previousHour}: ` +
        `inbound=${inboundCount}, outbound=${outboundCount}`,
      );
    }

    // Also update today's daily totals (rolling sum)
    await updateDailyTotals(today, platforms);

    logger.info(`[AnalyticsAggregator] ✅ Hour ${previousHour} aggregation complete`);
  } catch (error) {
    logger.error(`[AnalyticsAggregator] Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Recalculate daily totals from all hourly records for a given date.
 */
async function updateDailyTotals(dateStr, platforms) {
  for (const platform of platforms) {
    const hourlyRecords = await HourlyAnalytics.find({
      date: dateStr,
      platform,
    }).lean();

    if (hourlyRecords.length === 0) continue;

    const totalInbound = hourlyRecords.reduce((sum, h) => sum + (h.inbound_count || 0), 0);
    const totalOutbound = hourlyRecords.reduce((sum, h) => sum + (h.outbound_count || 0), 0);

    await DailyAnalytics.findOneAndUpdate(
      { date: dateStr, platform },
      {
        $set: {
          inbound_count: totalInbound,
        },
      },
      { upsert: true, new: true },
    );
  }
}

export default analyticsAggregatorJob;
