export const leadParsingService = {
  /**
   * Parses lead score and intent tags based on customer messages and tags.
   */
  computeLeadScore({ tags = [], messageCount = 0, hasEmail = false, hasPhone = false }) {
    let score = 30; // base score
    if (hasEmail) score += 20;
    if (hasPhone) score += 25;
    if (messageCount > 3) score += 15;

    if (tags.includes('#VIP')) score = Math.max(score, 95);
    if (tags.includes('#HOT_LEAD')) score = Math.max(score, 85);
    if (tags.includes('#PRICING_INQUIRY')) score += 10;

    return Math.min(100, Math.max(0, score));
  },

  /**
   * Sanitizes lead tags list.
   */
  normalizeTags(rawTags) {
    if (!Array.isArray(rawTags)) return ['#NEW_LEAD'];
    const cleaned = rawTags
      .map((t) => (typeof t === 'string' ? t.trim() : ''))
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t.toUpperCase() : `#${t.toUpperCase()}`));
    return [...new Set(cleaned)];
  },
};

export default leadParsingService;
