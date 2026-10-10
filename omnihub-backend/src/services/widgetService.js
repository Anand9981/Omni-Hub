import crypto from 'crypto';
import { WidgetConfig } from '../models/index.js';
import logger from '../utils/logger.js';

function generateWidgetApiKey() {
  return `ohw_${crypto.randomBytes(24).toString('hex')}`;
}

export const widgetService = {
  async getWidgetConfig() {
    let config = await WidgetConfig.findOne();
    if (!config) {
      config = await WidgetConfig.create({
        workspace_name: 'OmniHub Support',
        primary_color: '#3478e5',
        primaryColor: '#3478e5',
        secondaryColor: '#f1f5ff',
        textColor: '#1f2e44',
        position: 'bottom-right',
        size: 'medium',
        language: 'English',
        greeting_message: 'Hi! How can we help you today?',
        welcomeMessage: 'Hi! How can we help you today?',
        offlineMessage: "We're offline right now. Leave a message and our team will get back to you.",
        apiKey: generateWidgetApiKey(),
      });
    } else if (!config.apiKey || !/^ohw_[a-f0-9]{48}$/.test(config.apiKey)) {
      config.apiKey = generateWidgetApiKey();
      await config.save();
    }
    return config;
  },

  async updateWidgetConfig(data) {
    let config = await WidgetConfig.findOne();
    const payload = { ...data };
    if (payload.primaryColor && !payload.primary_color) payload.primary_color = payload.primaryColor;
    if (payload.primary_color && !payload.primaryColor) payload.primaryColor = payload.primary_color;
    if (payload.welcomeMessage && !payload.greeting_message) payload.greeting_message = payload.welcomeMessage;
    if (payload.greeting_message && !payload.welcomeMessage) payload.welcomeMessage = payload.greeting_message;

    if (!config) {
      if (!payload.apiKey) payload.apiKey = generateWidgetApiKey();
      config = new WidgetConfig(payload);
    } else {
      Object.assign(config, payload);
      if (!config.apiKey) config.apiKey = generateWidgetApiKey();
    }
    await config.save();
    logger.info('[WidgetService] Updated webchat widget customization');
    return config;
  },
};

export default widgetService;
