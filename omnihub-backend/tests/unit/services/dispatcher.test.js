import { dispatcher } from '../../../src/services/dispatcher.js';
import { MESSAGE_STATUS, PLATFORMS } from '../../../src/utils/constants.js';

describe('dispatcher Real Unit Tests', () => {
  it('should successfully dispatch outbound message and return DELIVERED status', async () => {
    const res = await dispatcher.dispatchOutboundMessage({
      platform: PLATFORMS.TELEGRAM,
      external_chat_id: '123456',
      text_content: 'Test message dispatch',
    });

    expect(res.success).toBe(true);
    expect(res.status).toBe(MESSAGE_STATUS.DELIVERED);
    expect(res.delivered_at).toBeInstanceOf(Date);
  });
});
