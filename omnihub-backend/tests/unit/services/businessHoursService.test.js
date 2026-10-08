import { businessHoursService } from '../../../src/services/businessHoursService.js';

describe('BusinessHoursService Unit Tests', () => {
  it('should export businessHoursService object', () => {
    expect(businessHoursService).toBeDefined();
    expect(typeof businessHoursService.getHours).toBe('function');
  });
});
