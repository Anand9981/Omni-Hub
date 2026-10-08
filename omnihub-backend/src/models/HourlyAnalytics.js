import mongoose from 'mongoose';
import { PLATFORMS } from '../utils/constants.js';

const hourlyAnalyticsSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    hour: {
      type: Number, // 0 to 23
      required: true,
      min: 0,
      max: 23,
    },
    platform: {
      type: String,
      enum: Object.values(PLATFORMS),
      required: true,
    },
    inbound_count: {
      type: Number,
      default: 0,
    },
    outbound_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

hourlyAnalyticsSchema.index({ date: 1, hour: 1, platform: 1 }, { unique: true });

export const HourlyAnalytics = mongoose.model('HourlyAnalytics', hourlyAnalyticsSchema);
export default HourlyAnalytics;
