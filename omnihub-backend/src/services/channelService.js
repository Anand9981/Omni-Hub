import { ChannelConfig } from '../models/index.js';
import { PLATFORMS } from '../utils/constants.js';
import logger from '../utils/logger.js';

export const channelService = {
  async getAllChannels() {
    let channels = await ChannelConfig.find().lean();
    if (!channels || channels.length === 0) {
      // Initialize default channels list
      const defaults = Object.values(PLATFORMS).map((p) => ({
        platform: p,
        is_connected: false,
        status: 'unconfigured',
      }));
      await ChannelConfig.insertMany(defaults);
      channels = await ChannelConfig.find().lean();
    }
    return channels;
  },

  async getChannelByPlatform(platform) {
    let channel = await ChannelConfig.findOne({ platform });
    if (!channel) {
      channel = await ChannelConfig.create({
        platform,
        is_connected: false,
        status: 'unconfigured',
      });
    }
    return channel;
  },

  async updateChannel(platform, data) {
    const channel = await ChannelConfig.findOneAndUpdate(
      { platform },
      {
        $set: {
          ...data,
          last_tested_at: new Date(),
        },
      },
      { upsert: true, new: true },
    );
    logger.info(`[ChannelService] Updated configuration for channel [${platform}]`);
    return channel;
  },

  async testConnection(platform) {
    const channel = await this.getChannelByPlatform(platform);
    // Simulate connection check
    const isSuccess = !!channel.credentials && Object.keys(channel.credentials).length > 0;
    const newStatus = isSuccess ? 'active' : 'error';

    channel.status = newStatus;
    channel.is_connected = isSuccess;
    channel.last_tested_at = new Date();
    await channel.save();

    return {
      platform,
      connected: isSuccess,
      status: newStatus,
      tested_at: channel.last_tested_at,
    };
  },
};

export default channelService;
