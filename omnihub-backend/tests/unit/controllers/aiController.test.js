import { aiController } from '../../../src/controllers/aiController.js';

describe('AIController Unit Tests', () => {
  it('should export aiController object', () => {
    expect(aiController).toBeDefined();
    expect(typeof aiController.generateReply).toBe('function');
    expect(typeof aiController.polishDraft).toBe('function');
  });
});
