import { conversationController } from '../../../src/controllers/conversationController.js';

describe('ConversationController Unit Tests', () => {
  it('should export conversationController object', () => {
    expect(conversationController).toBeDefined();
    expect(typeof conversationController.listConversations).toBe('function');
    expect(typeof conversationController.getConversationById).toBe('function');
  });
});
