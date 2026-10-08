import { cannedResponseController } from '../../../src/controllers/cannedResponseController.js';

describe('CannedResponseController Unit Tests', () => {
  it('should export cannedResponseController object', () => {
    expect(cannedResponseController).toBeDefined();
    expect(typeof cannedResponseController.getAll).toBe('function');
    expect(typeof cannedResponseController.create).toBe('function');
  });
});
