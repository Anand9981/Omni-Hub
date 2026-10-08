import { messageController } from '../../../src/controllers/messageController.js';

describe('MessageController Unit Tests', () => {
  it('should export messageController object', () => {
    expect(messageController).toBeDefined();
    expect(typeof messageController.sendMessage).toBe('function');
  });
});
