import { leadExtractor } from '../../../src/services/leadExtractor.js';

describe('LeadExtractor Unit Tests', () => {
  it('should export leadExtractor object with extractAndSyncLead function', () => {
    expect(leadExtractor).toBeDefined();
    expect(typeof leadExtractor.extractAndSyncLead).toBe('function');
  });
});
