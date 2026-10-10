import { normalizer } from '../../../src/services/normalizer.js';
import { PLATFORMS, MESSAGE_TYPES } from '../../../src/utils/constants.js';

describe('Normalizer Real Unit Tests', () => {
  it('should normalize Telegram text message payload', () => {
    const payload = {
      message: {
        chat: { id: 123456 },
        from: { first_name: 'John', last_name: 'Doe' },
        text: 'Hello bot from Telegram',
        date: 1700000000,
      },
    };
    const result = normalizer.normalizeTelegram(payload);
    expect(result.platform).toBe(PLATFORMS.TELEGRAM);
    expect(result.external_chat_id).toBe('123456');
    expect(result.sender_name).toBe('John Doe');
    expect(result.text_content).toBe('Hello bot from Telegram');
    expect(result.message_type).toBe(MESSAGE_TYPES.TEXT);
  });

  it('should normalize Telegram button callback query payload', () => {
    const payload = {
      callback_query: {
        message: { chat: { id: 987654 } },
        from: { first_name: 'Alice' },
        data: 'MENU_OPTION_PRICING',
      },
    };
    const result = normalizer.normalizeTelegram(payload);
    expect(result.platform).toBe(PLATFORMS.TELEGRAM);
    expect(result.message_type).toBe(MESSAGE_TYPES.BUTTON_CLICK);
    expect(result.button_payload).toBe('MENU_OPTION_PRICING');
  });

  it('should normalize WhatsApp Cloud API text message payload', () => {
    const payload = {
      entry: [
        {
          changes: [
            {
              value: {
                contacts: [{ wa_id: '919876543210', profile: { name: 'Rahul Sharma' } }],
                messages: [{ from: '919876543210', type: 'text', text: { body: 'Namaste OmniHub' } }],
              },
            },
          ],
        },
      ],
    };
    const result = normalizer.normalizeWhatsApp(payload);
    expect(result.platform).toBe(PLATFORMS.WHATSAPP);
    expect(result.sender_name).toBe('Rahul Sharma');
    expect(result.external_chat_id).toBe('919876543210');
    expect(result.text_content).toBe('Namaste OmniHub');
    expect(result.message_type).toBe(MESSAGE_TYPES.TEXT);
  });

  it('should normalize WhatsApp interactive button response payload', () => {
    const payload = {
      entry: [
        {
          changes: [
            {
              value: {
                contacts: [{ wa_id: '919876543210', profile: { name: 'Rahul' } }],
                messages: [
                  {
                    from: '919876543210',
                    type: 'interactive',
                    interactive: {
                      type: 'button_reply',
                      button_reply: { id: 'btn_support', title: 'Talk to Support' },
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const result = normalizer.normalizeWhatsApp(payload);
    expect(result.message_type).toBe(MESSAGE_TYPES.BUTTON_CLICK);
    expect(result.button_payload).toBe('btn_support');
    expect(result.text_content).toBe('Talk to Support');
  });

  it('should normalize Discord message payload', () => {
    const payload = {
      channel_id: 'discord-chan-777',
      author: { username: 'GamerGuy', global_name: 'Alex' },
      content: 'Hey OmniHub discord bot',
    };
    const result = normalizer.normalizeDiscord(payload);
    expect(result.platform).toBe(PLATFORMS.DISCORD);
    expect(result.external_chat_id).toBe('discord-chan-777');
    expect(result.sender_name).toBe('Alex');
    expect(result.text_content).toBe('Hey OmniHub discord bot');
    expect(result.message_type).toBe(MESSAGE_TYPES.TEXT);
  });

  it('should normalize Instagram Graph API webhook payload', () => {
    const payload = {
      entry: [
        {
          messaging: [
            {
              sender: { id: 'ig_user_123456' },
              message: { text: 'Hello on Instagram' },
            },
          ],
        },
      ],
    };
    const result = normalizer.normalizeInstagram(payload);
    expect(result.platform).toBe(PLATFORMS.INSTAGRAM);
    expect(result.external_chat_id).toBe('ig_user_123456');
    expect(result.text_content).toBe('Hello on Instagram');
    expect(result.message_type).toBe(MESSAGE_TYPES.TEXT);
  });

  it('should normalize Website widget live chat message payload', () => {
    const payload = {
      session_id: 'web-session-999',
      sender_name: 'Visitor Sarah',
      sender_email: 'sarah@web.com',
      message: 'Need help with setup',
    };
    const result = normalizer.normalizeWebsite(payload);
    expect(result.platform).toBe(PLATFORMS.WEBCHAT);
    expect(result.external_chat_id).toBe('web-session-999');
    expect(result.sender_name).toBe('Visitor Sarah');
    expect(result.sender_email).toBe('sarah@web.com');
    expect(result.text_content).toBe('Need help with setup');
  });
});
