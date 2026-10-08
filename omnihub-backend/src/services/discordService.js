import { Client, GatewayIntentBits, Partials } from 'discord.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import conversationService from './conversationService.js';
import { PLATFORMS, MESSAGE_STATUS } from '../utils/constants.js';

let discordClient = null;

export const initDiscordBot = () => {
  if (!env.DISCORD_BOT_TOKEN || env.DISCORD_BOT_TOKEN === 'demo_discord_token') {
    logger.warn('[Discord] Bot token not provided, skipping initialization.');
    return;
  }

  discordClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel, Partials.Message],
  });

  discordClient.on('clientReady', () => {
    logger.info(`[Discord] Bot is online! Logged in as ${discordClient.user.tag}`);
  });

  discordClient.on('messageCreate', async (message) => {
    // Ignore messages from bots (including ourselves)
    if (message.author.bot) return;

    logger.info(`[Discord Inbound] New message from ${message.author.username} in channel ${message.channel?.name || 'DM'}: "${message.content.slice(0, 50)}"`);

    let mediaUrl = '';
    let mediaType = '';

    // Check for attachments (images/files)
    if (message.attachments.size > 0) {
      const attachment = message.attachments.first();
      mediaUrl = attachment.url;
      mediaType = attachment.contentType || 'unknown';
    }

    const isDM = typeof message.channel.isDMBased === 'function' ? message.channel.isDMBased() : !message.guild;
    const chatId = isDM ? message.author.id : message.channel.id;

    const normalizedPayload = {
      platform: PLATFORMS.DISCORD,
      external_chat_id: chatId,
      sender_name: message.author.displayName || message.author.username,
      sender_phone: '',
      sender_email: '',
      text_content: message.content || '',
      media_url: mediaUrl,
      media_type: mediaType,
      raw_payload: message.toJSON(),
    };

    try {
      await conversationService.processInboundMessage(normalizedPayload);
    } catch (err) {
      logger.error(`[Discord Process Error] ${err.message}`);
    }
  });

  discordClient.login(env.DISCORD_BOT_TOKEN).catch((err) => {
    logger.error(`[Discord Login Error] ${err.message}`);
  });
};

export const sendDiscordMessage = async (targetId, text) => {
  if (!discordClient || !discordClient.isReady()) {
    logger.warn(`[Discord Outbound] Client not ready. Cannot send to ${targetId}`);
    return { success: false, status: MESSAGE_STATUS.FAILED, error: 'Discord bot disconnected' };
  }

  try {
    let target = null;
    // 1. Try sending to a channel (guild channel)
    try {
      target = await discordClient.channels.fetch(targetId);
    } catch (_) {}

    // 2. If not a channel, try sending to a user (Direct Message)
    if (!target) {
      try {
        target = await discordClient.users.fetch(targetId);
      } catch (_) {}
    }

    if (!target) {
      throw new Error(`Target channel or user not found on Discord for ID ${targetId}`);
    }

    const msg = await target.send(text);
    logger.info(`[Discord Live] Delivered to ${targetId}: "${text?.slice(0, 30)}"`);
    return { success: true, status: MESSAGE_STATUS.DELIVERED, raw: msg.id };
  } catch (error) {
    logger.error(`[Discord Send Error] ${error.message}`);
    return { success: false, status: MESSAGE_STATUS.FAILED, error: error.message };
  }
};

export default {
  initDiscordBot,
  sendDiscordMessage,
};
