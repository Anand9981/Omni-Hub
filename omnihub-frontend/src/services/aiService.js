import api from '../api/axios.js';

const CONTEXT_KEY = 'omnihub.demo.aiContext';
export const AI_LANGUAGES = ['English', 'Hindi', 'Hinglish'];
export const AI_LANGUAGE_OPTIONS = [
  { id: 'auto', label: 'Match customer' },
  ...AI_LANGUAGES.map((language) => ({ id: language, label: language })),
];

const FALLBACKS = {
  English: 'I have noted your query. Our team will contact you shortly.',
  Hindi: 'मैंने आपकी query नोट कर ली है। हमारी टीम जल्द ही आपसे संपर्क करेगी।',
  Hinglish: 'Maine aapki query note kar li hai. Hamari team jald hi aapse contact karegi.',
};

const DEFAULT_CONTEXT = {
  businessName: '',
  services: '',
  workingHours: '',
  pricing: '',
  assetLinks: '',
  tone: 'Professional, friendly, and helpful',
};

function detectLanguage(text) {
  if (/[\u0900-\u097F]/.test(text)) return 'Hindi';
  if (/\b(aaj|kal|hai|nahi|karenge|kaam|kya|achha|bhejo|theek|aap|hamari)\b/i.test(text)) return 'Hinglish';
  return 'English';
}

function readContext() {
  const raw = localStorage.getItem(CONTEXT_KEY);
  if (!raw) return structuredClone(DEFAULT_CONTEXT);
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('AI context must be an object.');
    }
    return { ...DEFAULT_CONTEXT, ...parsed };
  } catch (error) {
    console.error('Could not read AI business context.', error);
    throw new Error('AI context could not be loaded. Refresh the page to retry.');
  }
}

function validateContext(context) {
  const next = Object.fromEntries(Object.keys(DEFAULT_CONTEXT).map((key) => [
    key,
    String(context[key] || '').trim(),
  ]));
  if (!next.businessName) throw new Error('Add your business name before saving.');
  if (next.businessName.length > 100 || next.services.length > 2000 || next.workingHours.length > 500
    || next.pricing.length > 1000 || next.assetLinks.length > 2000) {
    throw new Error('AI business context is too long. Shorten the fields and try again.');
  }
  if (!['Professional, friendly, and helpful', 'Warm and conversational', 'Concise and direct'].includes(next.tone)) {
    throw new Error('Choose a supported response tone.');
  }
  const links = next.assetLinks.split(/\r?\n/).map((link) => link.trim()).filter(Boolean);
  if (links.some((link) => !/^https:\/\//i.test(link))) {
    throw new Error('Every resource link must use HTTPS.');
  }
  next.assetLinks = links.join('\n');
  return next;
}

function trimToThree(text) {
  return text
    .split(/(?<=[.!?।])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(' ');
}

const PHRASES = [
  [/\baaj\b/gi, 'today'],
  [/\bkal\b/gi, 'tomorrow'],
  [/\bparso\b/gi, 'the day after tomorrow'],
  [/\boffice band\b/gi, 'our office is currently closed'],
  [/\bghar band\b/gi, 'we are currently unavailable'],
  [/\bbaat karenge\b/gi, 'we will connect with you'],
  [/\bbaat kar\b/gi, 'speak with you'],
  [/\breply karenge\b/gi, 'will respond'],
  [/\bjaldi\b/gi, 'at the earliest'],
  [/\bintezaar\b/gi, 'wait'],
  [/\bdhanyavad\b/gi, 'thank you'],
  [/\bshukriya\b/gi, 'thank you'],
  [/\bchahiye\b/gi, 'is required'],
  [/\bkar rahe hain\b/gi, 'we are working on it'],
  [/\bho jayega\b/gi, 'will be completed'],
  [/\bnahi\b/gi, 'not'],
  [/\bmatlab\b/gi, 'meaning'],
  [/\bkaam\b/gi, 'work'],
  [/\bproblem hai\b/gi, 'there is an issue'],
  [/\bsamajh\b/gi, 'understand'],
  [/\bbhej\b/gi, 'send'],
  [/\bdekh\b/gi, 'review'],
];

const OPENERS = {
  English: {
    default: 'Thank you for your message.',
    closed: 'Thank you for reaching out.',
    delay: 'Thank you for your patience.',
  },
  Hindi: {
    default: 'आपके संदेश के लिए धन्यवाद।',
    closed: 'हमसे संपर्क करने के लिए धन्यवाद।',
    delay: 'आपके धैर्य के लिए धन्यवाद।',
  },
  Hinglish: {
    default: 'Aapke message ke liye dhanyavaad.',
    closed: 'Humse contact karne ke liye dhanyavaad.',
    delay: 'Aapke patience ke liye dhanyavaad.',
  },
};

function polishedText(raw, language) {
  const phrases = language === 'English' ? PHRASES : [];
  let body = raw;
  phrases.forEach(([pattern, replacement]) => { body = body.replace(pattern, replacement); });
  const openerType = /closed|unavailable|band/i.test(raw) ? 'closed'
    : /delay|wait|intezaar|late/i.test(raw) ? 'delay' : 'default';
  const opener = OPENERS[language][openerType];
  const polished = /thank you|thanks|धन्यवाद|dhanyavaad/i.test(body)
    ? body
    : `${opener} ${body}`;
  return trimToThree(polished);
}

function replyForLanguage(language, text) {
  const normalized = text.toLowerCase();
  const context = readContext();
  if (/price|pricing|cost|kitna|quote|दाम|कीमत/.test(normalized) && context.pricing) {
    if (language === 'Hindi') return `हमारी pricing जानकारी: ${context.pricing}`;
    if (language === 'Hinglish') return `Hamari pricing details: ${context.pricing}`;
    return `Our pricing information: ${context.pricing}`;
  }
  if (/time|hours|open|kab|समय|खुल/.test(normalized) && context.workingHours) {
    if (language === 'Hindi') return `हमारे working hours हैं: ${context.workingHours}`;
    if (language === 'Hinglish') return `Hamare working hours hain: ${context.workingHours}`;
    return `Our working hours are ${context.workingHours}.`;
  }
  if (/setup|install|configure|guide|brochure|catalog|qr code/.test(normalized)) {
    const link = context.assetLinks.split(/\r?\n/).find(Boolean);
    if (link) {
      if (language === 'Hindi') return `यह रहा आपका resource: ${link}`;
      if (language === 'Hinglish') return `Yeh raha aapka resource: ${link}`;
      return `Here is the resource you requested: ${link}`;
    }
  }
  const services = context.services.split(/\r?\n/).map((service) => service.trim()).filter(Boolean);
  const matchedService = services.find((service) => normalized.includes(service.toLowerCase()));
  if (matchedService) {
    if (language === 'Hindi') return `हम ${context.businessName} में ${matchedService} सेवा प्रदान करते हैं। आप इसके बारे में क्या जानना चाहेंगे?`;
    if (language === 'Hinglish') return `${context.businessName} mein hum ${matchedService} service provide karte hain. Aap iske baare mein kya jaanna chahenge?`;
    return `At ${context.businessName}, we offer ${matchedService}. What would you like to know about it?`;
  }
  if (/price|pricing|cost|kitna|quote|दाम|कीमत/.test(normalized)
    || /time|hours|open|kab|समय|खुल/.test(normalized)
    || /where|location|address|kahan|कहाँ|पता/.test(normalized)
    || /setup|install|configure|guide|brochure|catalog|qr code/.test(normalized)) {
    return FALLBACKS[language];
  }
  return FALLBACKS[language];
}

export const aiService = {
  getContext() {
    return readContext();
  },

  async fetchContext() {
    try {
      const res = await api.get('/dashboard/ai-context');
      const data = res.data?.data;
      if (data) {
        const local = readContext();
        const merged = {
          ...local,
          businessName: data.business_name || local.businessName,
          tone: data.tone || local.tone,
          services: data.services || local.services,
          workingHours: data.working_hours || local.workingHours,
          pricing: data.pricing || local.pricing,
          assetLinks: data.asset_links || local.assetLinks,
          updatedAt: data.updated_at || local.updatedAt,
        };
        localStorage.setItem(CONTEXT_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.warn('[AI Service] Fallback to local AI context:', err.message);
    }
    return readContext();
  },

  saveContext(context) {
    const validated = validateContext(context);
    localStorage.setItem(CONTEXT_KEY, JSON.stringify(validated));

    api.patch('/dashboard/ai-context', {
      business_name: validated.businessName,
      tone: validated.tone,
      services: validated.services,
      working_hours: validated.workingHours,
      pricing: validated.pricing,
      asset_links: validated.assetLinks,
    }).catch((err) => {
      console.warn('[AI Service] Sync AI context warning:', err.message);
    });

    return structuredClone(validated);
  },

  async polish(draft, { language = 'auto' } = {}) {
    const raw = String(draft || '').trim();
    if (!raw) throw new Error('Write a rough note first, then polish it.');
    if (!AI_LANGUAGE_OPTIONS.some((option) => option.id === language)) {
      throw new Error('Choose a supported response language.');
    }
    const detectedLanguage = detectLanguage(raw);
    const targetLanguage = language === 'auto' ? detectedLanguage : language;

    try {
      const res = await api.post('/ai/polish', {
        text: raw,
        tone: `Professional, polite ${targetLanguage}`,
      });
      const remotePolished = res.data?.data?.polishedText;
      if (remotePolished) {
        return {
          polished_text: remotePolished,
          detected_language: detectedLanguage,
          response_language: targetLanguage,
          original: raw,
          requires_review: true,
          demo: false,
          demo_notice: 'Polished live using Google Gemini 2.5 Flash.',
        };
      }
    } catch (err) {
      console.warn('[AI Service] Live Gemini polish fallback:', err.message);
    }

    return {
      polished_text: polishedText(raw, targetLanguage),
      detected_language: detectedLanguage,
      response_language: targetLanguage,
      original: raw,
      requires_review: true,
      demo: true,
      demo_notice: 'Local tone refinement fallback.',
    };
  },

  suggestReply(lastInbound) {
    const text = String(lastInbound || '').trim();
    if (!text) return FALLBACKS.English;
    const language = detectLanguage(text);
    return trimToThree(replyForLanguage(language, text));
  },

  /**
   * Fetches 3 Gemini AI smart reply suggestions + sentiment & intent from backend
   */
  async getSuggestions({ text, history = [], channel = 'general' }) {
    try {
      const res = await api.post('/ai/suggestions', { text, history, channel });
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('[AI Service] Live suggestion fetch failed, falling back to local heuristic:', err.message);
    }
    const detectedLang = detectLanguage(text);
    return {
      sentiment: text.includes('?') ? 'Curious' : 'Neutral',
      intent: text.toLowerCase().includes('price') || text.toLowerCase().includes('kitna') ? 'Pricing Inquiry' : 'General Inquiry',
      urgency: 'Medium',
      language: detectedLang,
      suggestions: [
        { id: 'sug-1', type: 'Friendly', text: FALLBACKS[detectedLang] || FALLBACKS.English },
        { id: 'sug-2', type: 'Direct', text: 'Thank you for reaching out. We are looking into this right now.' },
        { id: 'sug-3', type: 'Action', text: 'Could you please share your account email or order details?' },
      ],
      source: 'Local Fallback',
    };
  },

  /**
   * Auto-summarizes entire conversation thread using Gemini AI
   */
  async summarize({ conversationId, messages = [], customerName = 'Customer' }) {
    try {
      const res = await api.post('/ai/summarize', { conversationId, messages, customerName });
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('[AI Service] Live summarize failed, using fallback:', err.message);
    }
    return {
      summary: `Conversation with ${customerName} spanning ${messages.length} messages.`,
      keyPoints: [`Total messages: ${messages.length}`, `Active conversation thread`],
      customerSentiment: 'Neutral',
      intent: 'Customer Support',
      resolutionStatus: 'Pending Action',
      nextStep: 'Review message history and reply to customer.',
      source: 'Local Fallback',
    };
  },

  /**
   * Analyzes text for sentiment, intent, and urgency
   */
  async analyze({ text }) {
    try {
      const res = await api.post('/ai/analyze', { text });
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('[AI Service] Live sentiment analysis failed:', err.message);
    }
    return {
      sentiment: 'Neutral',
      intent: 'General',
      urgency: 'Low',
      language: detectLanguage(text),
    };
  },
};
