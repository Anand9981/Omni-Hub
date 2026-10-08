import { billingService } from '../../../src/services/billingService.js';

describe('BillingService Unit Tests', () => {
  it('should export billingService object', () => {
    expect(billingService).toBeDefined();
    expect(typeof billingService.getPlans).toBe('function');
  });
});
