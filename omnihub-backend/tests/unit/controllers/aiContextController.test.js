import { aiContextController } from '../../../src/controllers/aiContextController.js';

describe('AIContextController Unit Tests', () => {
  it('should export aiContextController object', () => {
    expect(aiContextController).toBeDefined();
    expect(typeof aiContextController.getContext).toBe('function');
  });
});
