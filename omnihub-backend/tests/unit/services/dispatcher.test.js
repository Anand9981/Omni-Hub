import { dispatcher } from '../../../src/services/dispatcher.js';

describe('Dispatcher Unit Tests', () => {
  it('should dispatch outbound message successfully in dev mode', async () => {
    expect(dispatcher).toBeDefined();
    const result = await dispatcher.dispatchOutboundMessage({
      platform: 'telegram',
      external_chat_id: '12345',
      text_content: 'Test message',
    });
    expect(result.success).toBe(true);
    expect(result.status).toBe('DELIVERED');
  });
});
