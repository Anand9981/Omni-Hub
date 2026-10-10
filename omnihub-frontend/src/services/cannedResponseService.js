import api from '../api/axios.js';

const STORAGE_KEY = 'omnihub.demo.cannedResponses';
const CATEGORIES = ['Pricing', 'Support', 'Sales', 'FAQ'];
const LANGUAGES = ['English', 'Hindi', 'Hinglish'];

const SEED_RESPONSES = [
  { id: 'reply-pricing-en', title: 'Pricing overview', shortcut: '/pricing', category: 'Pricing', language: 'English', content: 'Hi {customer_name}, our pricing starts from a base rate and scales with the channels you connect. Would you like a detailed quote for {business_name}?', favorite: true, usageCount: 12 },
  { id: 'reply-hours-en', title: 'Business hours', shortcut: '/hours', category: 'FAQ', language: 'English', content: 'We are open Monday to Saturday, 10 AM to 7 PM. If you share a good time, our team at {business_name} will be happy to help.', favorite: true, usageCount: 9 },
  { id: 'reply-location-en', title: 'Share location', shortcut: '/location', category: 'FAQ', language: 'English', content: 'We are located at our main office. Let me know if you would like directions or a map link.', favorite: false, usageCount: 4 },
  { id: 'reply-setup-en', title: 'Setup guide', shortcut: '/setup', category: 'Support', language: 'English', content: 'Here is your setup guide. If anything is unclear, reply here and the {business_name} team will walk you through it.', favorite: true, usageCount: 7 },
  { id: 'reply-support-en', title: 'Support follow-up', shortcut: '/support', category: 'Support', language: 'English', content: 'Thanks for reaching out, {customer_name}. Our team will connect with you within twenty-four hours.', favorite: false, usageCount: 6 },
  { id: 'reply-demo-en', title: 'Book a walkthrough', shortcut: '/demo', category: 'Sales', language: 'English', content: 'We would love to show you around, {customer_name}. Which day and time works best for a quick product walkthrough?', favorite: false, usageCount: 5 },
  { id: 'reply-pricing-hi', title: 'Pricing overview', shortcut: '/pricing-hi', category: 'Pricing', language: 'Hindi', content: 'Namaste {customer_name}, hamare plans aapke connected channels ke hisaab se customize hote hain. Kya main {business_name} ke liye detailed quote share karun?', favorite: false, usageCount: 3 },
  { id: 'reply-support-hi', title: 'Support follow-up', shortcut: '/support-hi', category: 'Support', language: 'Hindi', content: 'Sampark karne ke liye dhanyavaad, {customer_name}. Hamari team 24 ghanton ke andar aapse connect karegi.', favorite: false, usageCount: 2 },
  { id: 'reply-hours-hi', title: 'Business hours', shortcut: '/hours-hi', category: 'FAQ', language: 'Hindi', content: 'Hamare business hours Monday se Saturday, subah 10 baje se shaam 7 baje tak hain. Aapke liye kaunsa time sahi rahega?', favorite: false, usageCount: 1 },
  { id: 'reply-pricing-hinglish', title: 'Pricing overview', shortcut: '/pricing-hinglish', category: 'Pricing', language: 'Hinglish', content: 'Hi {customer_name}, pricing aapke connected channels ke according hoti hai. Kya main {business_name} ke liye ek detailed quote share karun?', favorite: true, usageCount: 8 },
  { id: 'reply-setup-hinglish', title: 'Setup guide', shortcut: '/setup-hinglish', category: 'Support', language: 'Hinglish', content: 'Yeh raha aapka setup guide. Agar koi step confusing lage, bas yahin reply kariye — {business_name} team help karegi.', favorite: false, usageCount: 4 },
  { id: 'reply-demo-hinglish', title: 'Book a walkthrough', shortcut: '/demo-hinglish', category: 'Sales', language: 'Hinglish', content: 'Bilkul {customer_name}, hum aapko product ka quick walkthrough de sakte hain. Aapke liye kaunsa din aur time convenient rahega?', favorite: false, usageCount: 3 },
];

function readResponses() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_RESPONSES));
    return SEED_RESPONSES;
  }
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error('Canned responses must be a list.');
    return parsed;
  } catch (error) {
    console.error('Could not read canned responses.', error);
    return SEED_RESPONSES;
  }
}

function persist(responses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
}

function sortResponses(list) {
  return [...list].sort((a, b) => (
    Number(b.favorite) - Number(a.favorite)
    || (b.usageCount || 0) - (a.usageCount || 0)
    || String(a.title || '').localeCompare(String(b.title || ''))
  ));
}

function mapDoc(doc) {
  return {
    ...doc,
    id: String(doc._id || doc.id),
    title: doc.title || '',
    shortcut: doc.shortcut || '',
    category: CATEGORIES.includes(doc.category) ? doc.category : 'Support',
    language: LANGUAGES.includes(doc.language) ? doc.language : 'English',
    content: doc.content || doc.body || '',
    favorite: Boolean(doc.favorite ?? doc.is_favorite),
    usageCount: Number(doc.usageCount ?? doc.usage_count ?? 0),
    createdAt: doc.createdAt || doc.created_at,
    updatedAt: doc.updatedAt || doc.updated_at,
  };
}

function normalizeResponse(input) {
  const title = String(input.title || '').trim();
  const shortcut = String(input.shortcut || '').trim().toLowerCase();
  const content = String(input.content || '').trim();
  const category = String(input.category || '');
  const language = String(input.language || '');
  if (!title || title.length > 60) throw new Error('Title is required and must be 60 characters or fewer.');
  if (!/^\/[a-z0-9][a-z0-9_-]{1,23}$/.test(shortcut)) {
    throw new Error('Shortcut must start with / and contain 2–24 letters, numbers, hyphens or underscores.');
  }
  if (!CATEGORIES.includes(category)) throw new Error('Choose a valid category.');
  if (!LANGUAGES.includes(language)) throw new Error('Choose a supported language.');
  if (!content || content.length > 1200) throw new Error('Reply text is required and must be 1,200 characters or fewer.');
  return { title, shortcut, content, body: content, category, language };
}

export function expandCannedResponse(content, variables = {}) {
  return String(content)
    .replace(/\{customer_name\}/gi, variables.customer_name || 'there')
    .replace(/\{business_name\}/gi, variables.business_name || 'our team');
}

export const cannedResponseService = {
  async listResponses() {
    try {
      const res = await api.get('/dashboard/canned-responses');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const mapped = sortResponses(res.data.data.map(mapDoc));
        persist(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('[cannedResponseService] Backend API fallback:', err.message);
    }
    return sortResponses(readResponses());
  },

  async saveResponse(input) {
    const normalized = normalizeResponse(input);
    try {
      if (input.id && /^[0-9a-f]{24}$/i.test(String(input.id))) {
        await api.put(`/dashboard/canned-responses/${input.id}`, normalized);
      } else {
        await api.post('/dashboard/canned-responses', normalized);
      }
      return await this.listResponses();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (err.response?.status === 409 || msg.includes('already')) {
        throw new Error(`The shortcut ${normalized.shortcut} is already in use.`);
      }
      console.warn('[cannedResponseService] Save fallback:', msg);
    }

    const responses = readResponses();
    const duplicate = responses.find((response) => (
      response.shortcut === normalized.shortcut && response.id !== input.id
    ));
    if (duplicate) throw new Error(`The shortcut ${normalized.shortcut} is already in use.`);

    if (input.id) {
      const next = responses.map((response) => (
        response.id === input.id ? { ...response, ...normalized, updatedAt: new Date().toISOString() } : response
      ));
      persist(next);
      return sortResponses(next);
    }

    const next = [{
      id: `reply-${crypto.randomUUID().slice(0, 10)}`,
      ...normalized,
      favorite: false,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    }, ...responses];
    persist(next);
    return sortResponses(next);
  },

  async deleteResponse(responseId) {
    try {
      if (/^[0-9a-f]{24}$/i.test(String(responseId))) {
        await api.delete(`/dashboard/canned-responses/${responseId}`);
        return await this.listResponses();
      }
    } catch (err) {
      console.warn('[cannedResponseService] Delete fallback:', err.message);
    }
    const responses = readResponses();
    const next = responses.filter((response) => response.id !== responseId);
    persist(next);
    return sortResponses(next);
  },

  async toggleFavorite(responseId) {
    const responses = readResponses();
    const target = responses.find((response) => response.id === responseId);
    const nextFav = target ? !target.favorite : true;

    try {
      if (/^[0-9a-f]{24}$/i.test(String(responseId))) {
        await api.put(`/dashboard/canned-responses/${responseId}`, {
          favorite: nextFav,
          is_favorite: nextFav,
        });
        return await this.listResponses();
      }
    } catch (err) {
      console.warn('[cannedResponseService] Toggle favorite fallback:', err.message);
    }

    const next = responses.map((response) => (
      response.id === responseId ? { ...response, favorite: nextFav } : response
    ));
    persist(next);
    return sortResponses(next);
  },

  async recordUsage(responseId, variables) {
    const responses = readResponses();
    const selected = responses.find((response) => response.id === responseId);
    if (!selected) throw new Error('That canned response could not be found.');
    const nextCount = (selected.usageCount || 0) + 1;

    try {
      if (/^[0-9a-f]{24}$/i.test(String(responseId))) {
        await api.put(`/dashboard/canned-responses/${responseId}`, {
          usageCount: nextCount,
          usage_count: nextCount,
        });
        const updatedList = await this.listResponses();
        return { content: expandCannedResponse(selected.content, variables), response: selected, responses: updatedList };
      }
    } catch (err) {
      console.warn('[cannedResponseService] Record usage fallback:', err.message);
    }

    const next = responses.map((response) => (
      response.id === responseId
        ? { ...response, usageCount: nextCount, lastUsedAt: new Date().toISOString() }
        : response
    ));
    persist(next);
    return { content: expandCannedResponse(selected.content, variables), response: selected, responses: sortResponses(next) };
  },
};

export { CATEGORIES as CANNED_RESPONSE_CATEGORIES, LANGUAGES as CANNED_RESPONSE_LANGUAGES };
