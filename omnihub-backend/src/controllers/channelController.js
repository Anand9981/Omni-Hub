import { channelService } from '../services/channelService.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const channelController = {
  async getAll(req, res) {
    try {
      const channels = await channelService.getAllChannels();
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, channels, 'Channels retrieved.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async getByPlatform(req, res) {
    try {
      const channel = await channelService.getChannelByPlatform(req.params.platform);
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, channel));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async update(req, res) {
    try {
      const channel = await channelService.updateChannel(req.params.platform, req.body);
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, channel, 'Channel credentials updated.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },

  async testConnection(req, res) {
    try {
      const result = await channelService.testConnection(req.params.platform);
      return res.status(HTTP_STATUS.OK).json(formatResponse(true, result, 'Channel connection test executed.'));
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, null, error.message));
    }
  },
};

export default channelController;
