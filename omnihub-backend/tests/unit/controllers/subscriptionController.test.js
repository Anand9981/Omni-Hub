import { subscriptionController } from '../../../src/controllers/subscriptionController.js';

describe('SubscriptionController Unit Tests', () => {
  it('should export subscriptionController object', () => {
    expect(subscriptionController).toBeDefined();
    expect(typeof subscriptionController.getDetails).toBe('function');
  });
});
