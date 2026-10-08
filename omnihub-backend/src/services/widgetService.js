import { WidgetConfig } from '../models/index.js';
import logger from '../utils/logger.js';

export const widgetService = {
  async getWidgetConfig() {
    let config = await WidgetConfig.findOne();
    if (!config) {
      config = await WidgetConfig.create({
        workspace_name: 'OmniHub Support',
        primary_color: '#3478e5',
        position: 'bottom-right',
        greeting_message: 'Hi there! How can we help you today?',
      });
    }
    return config;
  },

  async updateWidgetConfig(data) {
    let config = await WidgetConfig.findOne();
    if (!config) {
      config = new WidgetConfig(data);
    } else {
      Object.assign(config, data);
    }
    await config.save();
    logger.info(`[WidgetService] Updated webchat widget customization`);
    return config;
  },
};

export default widgetService;
