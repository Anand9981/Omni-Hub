import { normalizer } from '../../../src/services/normalizer.js';

describe('Normalizer Unit Tests', () => {
  it('should normalize telegram webhook payload', () => {
    expect(normalizer).toBeDefined();
    const payload = {
      message: {
        chat: { id: 123456 },
        from: { first_name: 'John' },
        text: 'Hello bot',
      },
    };
    const result = normalizer.normalizeTelegram(payload);
    expect(result.platform).toBe('telegram');
    expect(result.external_chat_id).toBe('123456');
    expect(result.text_content).toBe('Hello bot');
  });
});
