import { parseLeadTags, computeLeadScore } from '../../../src/utils/leadParsing.js';

describe('LeadParsing Utility Unit Tests', () => {
  it('should parse lead tags from string or array', () => {
    const fromString = parseLeadTags('#HOT_LEAD, #VIP');
    expect(fromString).toEqual(['#HOT_LEAD', '#VIP']);

    const fromArray = parseLeadTags(['#HOT_LEAD', '#VIP']);
    expect(fromArray).toEqual(['#HOT_LEAD', '#VIP']);
  });

  it('should calculate lead score accurately', () => {
    const score = computeLeadScore({
      tags: ['#PRICING_INQUIRY', '#VIP'],
      hasEmail: true,
      hasPhone: true,
    });
    expect(score).toBe(100);
  });
});
