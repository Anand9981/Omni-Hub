import mongoose from 'mongoose';
import { PLATFORMS } from '../utils/constants.js';

const channelConfigSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: Object.values(PLATFORMS),
      required: true,
      unique: true,
      index: true,
    },
    is_connected: {
      type: Boolean,
      default: false,
    },
    credentials: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    webhook_url: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'error', 'unconfigured'],
      default: 'unconfigured',
    },
    last_tested_at: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const ChannelConfig = mongoose.model('ChannelConfig', channelConfigSchema);
export default ChannelConfig;
