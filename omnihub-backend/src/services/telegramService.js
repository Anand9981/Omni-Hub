import env from '../config/env.js';
import logger from '../utils/logger.js';
import normalizer from './normalizer.js';
import conversationService from './conversationService.js';

let isPolling = false;
let lastUpdateId = 0;

export const initTelegramPolling = () => {
  if (!env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN === 'demo_telegram_token') {
    logger.warn('[Telegram] Bot token not configured, skipping Telegram polling.');
    return;
  }

  if (isPolling) return;
  isPolling = true;
  logger.info('[Telegram] Starting Telegram bot live polling for incoming messages...');

  pollUpdates();
};

async function pollUpdates() {
  while (isPolling) {
    try {
      const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastUpdateId ? lastUpdateId + 1 : 0}&timeout=15`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;
          if (update.callback_query?.id) {
            fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ callback_query_id: update.callback_query.id }),
            }).catch(() => {});
          }
          const normalized = normalizer.normalizeTelegram(update);
          if (normalized && (normalized.text_content || normalized.media_url || normalized.button_payload)) {
            logger.info(`[Telegram Inbound] Message from ${normalized.sender_name} (${normalized.external_chat_id}): "${(normalized.text_content || normalized.button_payload).slice(0, 40)}"`);
            await conversationService.processInboundMessage(normalized);
          }
        }
      } else if (!data.ok) {
        logger.warn(`[Telegram Polling Warning] ${data.description}`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (err) {
      // Network hiccup or brief timeout, retry after short backoff
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

export const stopTelegramPolling = () => {
  isPolling = false;
};

export default {
  initTelegramPolling,
  stopTelegramPolling,
};
