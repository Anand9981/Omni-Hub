import { analyticsController } from '../../../src/controllers/analyticsController.js';

describe('AnalyticsController Unit Tests', () => {
  it('should export analyticsController object', () => {
    expect(analyticsController).toBeDefined();
    expect(typeof analyticsController.getSummary).toBe('function');
  });
});
