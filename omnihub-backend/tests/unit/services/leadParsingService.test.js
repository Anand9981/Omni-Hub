import { leadParsingService } from '../../../src/services/leadParsingService.js';

describe('leadParsingService Real Unit Tests', () => {
  it('should compute default base score', () => {
    const score = leadParsingService.computeLeadScore({});
    expect(score).toBe(30);
  });

  it('should add points for email and phone', () => {
    const score = leadParsingService.computeLeadScore({ hasEmail: true, hasPhone: true });
    expect(score).toBe(75); // 30 base + 20 email + 25 phone
  });

  it('should boost score for high message count', () => {
    const score = leadParsingService.computeLeadScore({
      hasEmail: true,
      hasPhone: true,
      messageCount: 5,
    });
    expect(score).toBe(90); // 75 + 15
  });

  it('should grant maximum priority for #VIP and #HOT_LEAD tags', () => {
    const vipScore = leadParsingService.computeLeadScore({ tags: ['#VIP'] });
    expect(vipScore).toBe(95);

    const hotScore = leadParsingService.computeLeadScore({ tags: ['#HOT_LEAD'] });
    expect(hotScore).toBe(85);
  });

  it('should normalize and uppercase tags with hashtags correctly', () => {
    const raw = ['hot_lead', '#pricing', ' vip ', 'HOT_LEAD'];
    const normalized = leadParsingService.normalizeTags(raw);

    expect(normalized).toEqual(['#HOT_LEAD', '#PRICING', '#VIP']);
  });

  it('should return default tag if input is invalid', () => {
    expect(leadParsingService.normalizeTags(null)).toEqual(['#NEW_LEAD']);
    expect(leadParsingService.normalizeTags('not-array')).toEqual(['#NEW_LEAD']);
  });
});
