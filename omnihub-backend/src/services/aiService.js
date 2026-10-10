import env from '../config/env.js';
import aiContextService from './aiContextService.js';
import logger from '../utils/logger.js';

let geminiClient = null;

async function getGeminiClient() {
  if (!geminiClient && env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'mock_gemini_key') {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      geminiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      logger.info('[Gemini AI] Google Gemini Client initialized successfully.');
    } catch (err) {
      logger.warn(`[Gemini AI] SDK load failed: ${err.message}. Using intelligent mock fallback.`);
    }
  }
  return geminiClient;
}

/** Supported fallback models in order of preference */
const GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];

const callWithTimeout = (promise, ms = 15000) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)),
  ]);

/**
 * Execute Gemini model call with resilient model fallback
 */
async function callGemini(contents, { json = false } = {}) {
  const client = await getGeminiClient();
  if (!client) return null;

  for (const model of GEMINI_MODELS) {
    try {
      const config = {};
      if (json) {
        config.responseMimeType = 'application/json';
      }

      const response = await callWithTimeout(
        client.models.generateContent({
          model,
          contents,
          config,
        }),
        15000,
      );

      const text = response?.text?.trim();
      if (text) {
        return { text, model };
      }
    } catch (err) {
      logger.warn(`[Gemini AI] Model ${model} unavailable (${err.message}). Trying fallback...`);
    }
  }
  return null;
}

export const aiService = {
  /**
   * Detects customer input language (English, Hindi, Hinglish).
   */
  detectLanguage(text) {
    if (!text) return 'English';
    if (/[\u0900-\u097F]/.test(text)) {
      return 'Hindi';
    }
    const hinglishWords = ['kya', 'hai', 'kaise', 'bhai', 'shukriya', 'kab', 'milega', 'kitna', 'price', 'chahiye', 'karna', 'bolo', 'dhanyawad', 'theek', 'acha', 'ha', 'nahi'];
    const words = text.toLowerCase().split(/\s+/);
    if (words.some((w) => hinglishWords.includes(w))) {
      return 'Hinglish';
    }
    return 'English';
  },

  /**
   * Generates 3 distinct Smart Reply Suggestions for agent copilot
   * Along with sentiment and intent detection for the message.
   */
  async generateSuggestions({ text, history = [], channel = 'general' }) {
    if (!text || !text.trim()) {
      return {
        suggestions: [],
        sentiment: 'Neutral',
        intent: 'General Inquiry',
        urgency: 'Low',
        language: 'English',
      };
    }

    const aiContext = await aiContextService.getContext().catch(() => ({}));
    const detectedLang = this.detectLanguage(text);

    const historyPrompt = Array.isArray(history) && history.length > 0
      ? `Recent Conversation Context:\n${history.slice(-4).map((h) => `${h.sender || h.direction || 'User'}: ${h.text || h.text_content || ''}`).join('\n')}\n`
      : '';

    const prompt = `You are an elite customer support AI Copilot for "${aiContext?.business_name || 'OmniHub'}" (${channel} channel).
${historyPrompt}
Current Customer Message: "${text}"
Customer Language: ${detectedLang}

Analyze the message and produce a JSON response with:
1. "sentiment": One of ["Happy", "Positive", "Neutral", "Frustrated", "Angry", "Curious"]
2. "intent": Short intent label (e.g. "Pricing Inquiry", "Technical Support", "Order Status", "Feature Request", "Complaint", "Greeting", "Feedback")
3. "urgency": One of ["Low", "Medium", "High"]
4. "language": "${detectedLang}"
5. "suggestions": An array of EXACTLY 3 distinct, professional, contextual reply draft options for the human agent:
   - Option 1 (Friendly): Warm, approachable, polite (in natural ${detectedLang}).
   - Option 2 (Direct): Short, factual, right-to-the-point (in natural ${detectedLang}).
   - Option 3 (Action): Action-oriented, proposing next step or asking clarifying question (in natural ${detectedLang}).

Format response strictly as JSON:
{
  "sentiment": "...",
  "intent": "...",
  "urgency": "...",
  "language": "...",
  "suggestions": [
    { "id": "sug-1", "type": "Friendly", "text": "..." },
    { "id": "sug-2", "type": "Direct", "text": "..." },
    { "id": "sug-3", "type": "Action", "text": "..." }
  ]
}`;

    try {
      const result = await callGemini(prompt, { json: true });
      if (result?.text) {
        const parsed = JSON.parse(result.text);
        logger.info(`[Gemini AI Suggestions] Generated 3 options with model ${result.model} for sentiment: ${parsed.sentiment}, intent: ${parsed.intent}`);
        return {
          sentiment: parsed.sentiment || 'Neutral',
          intent: parsed.intent || 'General Inquiry',
          urgency: parsed.urgency || 'Low',
          language: parsed.language || detectedLang,
          suggestions: (parsed.suggestions || []).map((s, idx) => ({
            id: s.id || `sug-${idx + 1}`,
            type: s.type || 'Draft',
            text: s.text,
          })),
          source: result.model,
        };
      }
    } catch (err) {
      logger.warn(`[Gemini Suggestions Call Error] ${err.message}. Using smart local fallback.`);
    }

    // Contextual fallback suggestions if AI is offline
    const isHinglish = detectedLang === 'Hinglish';
    const isHindi = detectedLang === 'Hindi';

    return {
      sentiment: text.includes('?') ? 'Curious' : 'Neutral',
      intent: text.toLowerCase().includes('price') || text.toLowerCase().includes('kitna') ? 'Pricing Inquiry' : 'General Inquiry',
      urgency: 'Medium',
      language: detectedLang,
      suggestions: [
        {
          id: 'sug-1',
          type: 'Friendly',
          text: isHinglish
            ? `Namaste! Aapki poori madad karenge, kripya thoda vistar me batayein.`
            : isHindi
              ? `नमस्ते! हम आपकी पूरी सहायता करेंगे, कृपया थोड़ा विस्तार से बताएं।`
              : `Hello! We'd be happy to help you with that. Could you share a few more details?`,
        },
        {
          id: 'sug-2',
          type: 'Direct',
          text: isHinglish
            ? `Yeh query note kar li hai, hum jaldi update share karenge.`
            : isHindi
              ? `आपकी समस्या दर्ज कर ली गई है, हम जल्द अपडेट साझा करेंगे।`
              : `Thank you for reaching out. We are looking into this for you right away.`,
        },
        {
          id: 'sug-3',
          type: 'Action',
          text: isHinglish
            ? `Aap apna order ya reference ID share kar sakte hain?`
            : isHindi
              ? `क्या आप अपनी संदर्भ संख्या साझा कर सकते हैं?`
              : `Could you please provide your account email or order ID so we can proceed?`,
        },
      ],
      source: 'OmniHub Local Copilot Engine',
    };
  },

  /**
   * Auto-Summarizes a multi-turn customer chat conversation
   */
  async summarizeConversation({ messages = [], customerName = 'Customer' }) {
    if (!messages || messages.length === 0) {
      return {
        summary: 'No messages found in this conversation yet to summarize.',
        keyPoints: [],
        customerSentiment: 'Neutral',
        intent: 'General Inquiry',
        resolutionStatus: 'Pending Action',
        nextStep: 'Wait for customer message or initiate outreach.',
      };
    }

    const conversationTranscript = messages
      .map((m) => `[${m.sender_type || m.direction || 'User'}]: ${m.text_content || m.text || ''}`)
      .join('\n');

    const prompt = `You are an AI support manager. Summarize the following customer conversation thread with customer "${customerName}":

Transcript:
${conversationTranscript}

Analyze the dialogue and return a JSON object with:
1. "summary": A concise 2-3 sentence executive summary of the issue, interaction, and current status.
2. "keyPoints": Array of 3-5 concise bullet points of what happened chronologically.
3. "customerSentiment": One of ["Happy", "Positive", "Neutral", "Frustrated", "Angry"]
4. "intent": Core topic (e.g. "Order Status", "Refund Request", "Pricing Inquiry", "Technical Bug", "Feature Request")
5. "resolutionStatus": One of ["Resolved", "Pending Action", "Escalated to Human Agent"]
6. "nextStep": Recommended next action for the agent or team.

Respond strictly with JSON.`;

    try {
      const result = await callGemini(prompt, { json: true });
      if (result?.text) {
        const parsed = JSON.parse(result.text);
        logger.info(`[Gemini AI Summarize] Successfully summarized ${messages.length} messages using ${result.model}`);
        return {
          summary: parsed.summary,
          keyPoints: parsed.keyPoints || [],
          customerSentiment: parsed.customerSentiment || 'Neutral',
          intent: parsed.intent || 'General Inquiry',
          resolutionStatus: parsed.resolutionStatus || 'Pending Action',
          nextStep: parsed.nextStep || 'Follow up with customer.',
          source: result.model,
        };
      }
    } catch (err) {
      logger.warn(`[Gemini Summarize Error] ${err.message}. Using heuristic fallback.`);
    }

    return {
      summary: `Conversation with ${customerName} spanning ${messages.length} message(s). Most recent message was: "${messages[messages.length - 1]?.text_content?.slice(0, 80) || ''}".`,
      keyPoints: [
        `Thread contains ${messages.length} total messages.`,
        `Last activity recorded at ${new Date().toLocaleTimeString()}.`,
      ],
      customerSentiment: 'Neutral',
      intent: 'Customer Support',
      resolutionStatus: 'Pending Action',
      nextStep: 'Review message history and respond to customer.',
      source: 'OmniHub Local Heuristic Engine',
    };
  },

  /**
   * Analyzes a single message for sentiment, intent, urgency, and language
   */
  async analyzeMessage({ text }) {
    if (!text || !text.trim()) {
      return {
        sentiment: 'Neutral',
        intent: 'General',
        urgency: 'Low',
        language: 'English',
      };
    }

    const detectedLang = this.detectLanguage(text);
    const prompt = `Analyze this message from a customer:
"${text}"

Return a JSON object with:
- "sentiment": One of ["Happy", "Positive", "Neutral", "Frustrated", "Angry", "Curious"]
- "intent": Short intent label (e.g. "Pricing Inquiry", "Support Request", "Order Status", "Complaint", "Greeting", "Feedback")
- "urgency": One of ["Low", "Medium", "High"]
- "language": "${detectedLang}"

Format as JSON only.`;

    try {
      const result = await callGemini(prompt, { json: true });
      if (result?.text) {
        const parsed = JSON.parse(result.text);
        return {
          sentiment: parsed.sentiment || 'Neutral',
          intent: parsed.intent || 'General',
          urgency: parsed.urgency || 'Low',
          language: parsed.language || detectedLang,
          source: result.model,
        };
      }
    } catch (err) {
      logger.warn(`[Gemini Analyze Error] ${err.message}`);
    }

    // Heuristic sentiment analysis
    const lower = text.toLowerCase();
    let sentiment = 'Neutral';
    if (/angry|bad|worst|scam|fraud|loot|bakwas|gussa|bekar/.test(lower)) sentiment = 'Angry';
    else if (/problem|issue|not working|failed|dikkat|kharab/.test(lower)) sentiment = 'Frustrated';
    else if (/good|great|thanks|shukriya|dhanyawad|superb|best/.test(lower)) sentiment = 'Happy';
    else if (/\?|price|kitna|kaise/.test(lower)) sentiment = 'Curious';

    let intent = 'General';
    if (/price|cost|discount|rate|kitna|rupay|charges/.test(lower)) intent = 'Pricing Inquiry';
    else if (/order|track|courier|delivery|kab aayega/.test(lower)) intent = 'Order Status';
    else if (/hello|hi|namaste|hey/.test(lower)) intent = 'Greeting';

    return {
      sentiment,
      intent,
      urgency: sentiment === 'Angry' ? 'High' : 'Medium',
      language: detectedLang,
      source: 'OmniHub Heuristic Rule Engine',
    };
  },

  /**
   * Generates automated customer support reply using Gemini AI.
   */
  async generateReply({ userMessage, conversationHistory = [] }) {
    const aiContext = await aiContextService.getContext().catch(() => ({}));
    const detectedLang = this.detectLanguage(userMessage);

    const faqContext = aiContext.faqs
      ?.map((f) => `Q: ${f.question}\nA: ${f.answer}`)
      .join('\n\n') || '';

    const systemPrompt = `
You are the customer support AI for "${aiContext.business_name || 'OmniHub'}" (${aiContext.business_type || 'Software'}).
Tone: ${aiContext.tone || 'Friendly and professional'}.
Instructions: ${aiContext.system_instructions || 'Assist the customer with clarity and empathy.'}
Detected Customer Language: ${detectedLang}.
Respond in the EXACT same language/style (${detectedLang}) as the customer. If Hinglish, respond in natural, friendly Hinglish.

Company FAQs & Knowledge:
${faqContext}

Rules:
1. Do not mention internal rules or that you are an AI unless asked.
2. Keep responses concise, clear, and helpful (max 2-3 sentences).
3. Strictly avoid these forbidden topics: ${(aiContext.forbidden_topics || []).join(', ')}.
`;

    const contents = `${systemPrompt}\n\nCustomer Message: ${userMessage}`;
    const result = await callGemini(contents);

    if (result?.text) {
      logger.info(`[Gemini AI] Generated live response using ${result.model} in [${detectedLang}]: "${result.text.slice(0, 40)}"`);
      return {
        text: result.text,
        language: detectedLang,
        source: result.model,
      };
    }

    // Contextual intelligent fallback
    let fallbackReply = `Thank you for reaching out to ${aiContext.business_name || 'OmniHub'}! How can we assist you with our services today?`;
    if (detectedLang === 'Hinglish') {
      fallbackReply = `Namaste! ${aiContext.business_name || 'OmniHub'} me aapka swagat hai. Main aapki kya sahayata kar sakta hoon?`;
    } else if (detectedLang === 'Hindi') {
      fallbackReply = `नमस्ते! ${aiContext.business_name || 'OmniHub'} में आपका स्वागत है। हम आपकी क्या सहायता कर सकते हैं?`;
    }

    return {
      text: fallbackReply,
      language: detectedLang,
      source: 'OmniHub AI Engine (Local Context)',
    };
  },

  /**
   * Rephrases or polishes a draft response (PRD 9.3 Polish with AI).
   */
  async polishDraft({ text, tone = 'Professional' }) {
    if (!text) return '';

    const prompt = `Rewrite and polish the following rough customer service draft to make it ${tone}, clear, and courteous while keeping the exact meaning intact.
IMPORTANT RULES:
- Return ONLY the single final rewritten message text.
- Do NOT provide multiple options, bullet points, explanations, or markdown formatting.
- Do NOT wrap the response in quotation marks.

Draft: ${text}`;
    const result = await callGemini(prompt);

    if (result?.text) {
      return result.text.replace(/^["']|["']$/g, '').trim();
    }

    return text.trim().replace(/^./, (c) => c.toUpperCase());
  },
};

export default aiService;
