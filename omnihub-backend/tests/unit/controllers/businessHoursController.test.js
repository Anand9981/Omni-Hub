import { businessHoursController } from '../../../src/controllers/businessHoursController.js';

describe('BusinessHoursController Unit Tests', () => {
  it('should export businessHoursController object', () => {
    expect(businessHoursController).toBeDefined();
    expect(typeof businessHoursController.get).toBe('function');
    expect(typeof businessHoursController.update).toBe('function');
  });
});
