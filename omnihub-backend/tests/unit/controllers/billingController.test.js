import { billingController } from '../../../src/controllers/billingController.js';

describe('BillingController Unit Tests', () => {
  it('should export billingController object', () => {
    expect(billingController).toBeDefined();
    expect(typeof billingController.getPlans).toBe('function');
  });
});
