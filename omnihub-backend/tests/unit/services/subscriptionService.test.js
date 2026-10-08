import { subscriptionService } from '../../../src/services/subscriptionService.js';

describe('SubscriptionService Unit Tests', () => {
  it('should export subscriptionService object', () => {
    expect(subscriptionService).toBeDefined();
    expect(typeof subscriptionService.getSubscriptionDetails).toBe('function');
  });
});
