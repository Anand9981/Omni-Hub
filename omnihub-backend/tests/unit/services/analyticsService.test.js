import { analyticsService } from '../../../src/services/analyticsService.js';

describe('AnalyticsService Unit Tests', () => {
  it('should export analyticsService object', () => {
    expect(analyticsService).toBeDefined();
    expect(typeof analyticsService.getAnalyticsSummary).toBe('function');
  });
});
