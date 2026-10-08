import mongoose from 'mongoose';
import { PLATFORMS } from '../utils/constants.js';

const dailyAnalyticsSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: Object.values(PLATFORMS),
      required: true,
      index: true,
    },
    inbound_count: {
      type: Number,
      default: 0,
    },
    outbound_ai_count: {
      type: Number,
      default: 0,
    },
    outbound_agent_count: {
      type: Number,
      default: 0,
    },
    outbound_menu_count: {
      type: Number,
      default: 0,
    },
    pending_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

dailyAnalyticsSchema.index({ date: 1, platform: 1 }, { unique: true });

export const DailyAnalytics = mongoose.model('DailyAnalytics', dailyAnalyticsSchema);
export default DailyAnalytics;
