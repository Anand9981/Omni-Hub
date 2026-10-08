const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_PATTERN = /\+?\d[\d\s().-]{8,20}\d/g;
const NAME_PATTERN = /\b(?:my name is|i am|i'm|this is)\s+([\p{L}][\p{L}' -]{1,48}?)(?=[,.!?;\n]|$|\s+(?:and|from|with|,))/iu;
const NON_NAME_INTRODUCTIONS = new Set(['at', 'available', 'calling', 'checking', 'happy', 'having', 'here', 'interested', 'looking', 'reaching', 'trying', 'writing']);

export function extractLeadDetails(text = '') {
  const content = String(text);
  const email = content.match(EMAIL_PATTERN)?.[0]?.replace(/[.,;!?]+$/, '') || '';
  const phoneCandidate = [...content.matchAll(PHONE_PATTERN)]
    .map((match) => match[0])
    .find((candidate) => {
      const length = candidate.replace(/\D/g, '').length;
      return length >= 10 && length <= 13;
    }) || '';
  const digits = phoneCandidate.replace(/\D/g, '');
  const phone = digits.length >= 10 && digits.length <= 13 ? phoneCandidate.trim() : '';
  const nameCandidate = content.match(NAME_PATTERN)?.[1]?.trim().replace(/\s+/g, ' ') || '';
  const fullName = nameCandidate && nameCandidate.length < 50
    && !NON_NAME_INTRODUCTIONS.has(nameCandidate.split(' ')[0].toLowerCase())
    ? nameCandidate.split(' ').map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(' ')
    : '';
  const normalized = content.toLowerCase();
  const tags = [];

  if (/\b(price|pricing|quote|cost|plan|subscription|discount)\b/.test(normalized)) tags.push('#PRICING_INQUIRY');
  if (/\b(error|issue|problem|not working|broken|failed|help|support|setup|webhook)\b/.test(normalized)) tags.push('#SETUP_ISSUE');
  if (/\b(urgent\w*|asap|ready to buy|enterprise|high priority)\b/.test(normalized)) tags.push('#HOT_LEAD');

  return { fullName, email, phone, tags };
}
