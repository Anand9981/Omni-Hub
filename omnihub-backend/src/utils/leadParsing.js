export function parseLeadTags(tags = []) {
  if (typeof tags === 'string') {
    return tags.split(',').map((t) => t.trim()).filter(Boolean);
  }
  if (Array.isArray(tags)) {
    return tags.map((t) => String(t).trim()).filter(Boolean);
  }
  return [];
}

export function computeLeadScore({ tags = [], hasEmail = false, hasPhone = false }) {
  let score = 0;
  if (hasEmail) score += 30;
  if (hasPhone) score += 40;
  if (tags.includes('#PRICING_INQUIRY') || tags.includes('#HOT_LEAD')) score += 20;
  if (tags.includes('#VIP')) score += 10;
  return Math.min(100, score);
}

export default {
  parseLeadTags,
  computeLeadScore,
};
