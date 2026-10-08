import { APPROVAL_MODE, APPROVAL_STATUS, AUTO_PILOT, DIRECTION, MESSAGE_STATUS, SENDER_TYPE } from '../utils/constants.js';
import { extractLeadDetails } from '../utils/leadParsing.js';
import api from '../api/axios.js';

/* ------------------------------------------------------------
   Demo store keys. The backend replaces this layer entirely; the
   shapes below mirror the PRD 22 collections, so swapping to the
   API is a data-source change rather than a rewrite.
   ------------------------------------------------------------ */
const CONVERSATIONS_KEY = 'omnihub.demo.conversations';
const MESSAGES_KEY = 'omnihub.demo.messages';
const LEADS_KEY = 'omnihub.demo.leads';
const APPROVALS_KEY = 'omnihub.demo.approvals';
const NOTES_KEY = 'omnihub.demo.notes';
const SAVED_SEARCHES_KEY = 'omnihub.demo.savedConversationSearches';
const SEED_VERSION_KEY = 'omnihub.demo.seedVersion';
const SEED_VERSION = 2;

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Could not read ${key}`, error);
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function minutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function newId(prefix) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function detectLanguage(text) {
  if (/[\u0900-\u097F]/.test(text)) return 'Hindi';
  return /\b(aaj|kal|hai|nahi|karenge|kaam|kya|achha|bhejo|theek|par|mein)\b/i.test(text)
    ? 'Hinglish'
    : 'English';
}

/* ------------------------------------------------------------
   Seed - six channels, mixed languages (PRD 8), one thread
   already taken over by a human, and held drafts to approve.
   ------------------------------------------------------------ */

const SEED_CONVERSATIONS = [
  {
    id: 'cnv-sarah',
    assigned_agent_id: 'agent-liam',
    platform: 'telegram',
    external_chat_id: 'tg-884120',
    sender_name: 'Sarah Mitchell',
    sender_phone: '+91 98200 41122',
    sender_email: 'sarah.mitchell@northwind.co',
    auto_pilot: AUTO_PILOT.ON,
    approval_mode: APPROVAL_MODE.AUTO,
    unread: 0,
    created_at: minutesAgo(320),
  },
  {
    id: 'cnv-rahul',
    assigned_agent_id: 'agent-ava',
    platform: 'whatsapp',
    external_chat_id: 'wa-559031',
    sender_name: 'Rahul Verma',
    sender_phone: '+91 99110 78345',
    sender_email: 'rahul.verma@gmail.com',
    auto_pilot: AUTO_PILOT.OFF,
    approval_mode: APPROVAL_MODE.MANUAL,
    unread: 3,
    created_at: minutesAgo(240),
  },
  {
    id: 'cnv-priya',
    assigned_agent_id: 'agent-noah',
    platform: 'instagram',
    external_chat_id: 'ig-220774',
    sender_name: 'Priya Nair',
    sender_phone: '+91 90045 22190',
    sender_email: 'priya.nair@outlook.com',
    auto_pilot: AUTO_PILOT.ON,
    approval_mode: APPROVAL_MODE.MANUAL,
    unread: 1,
    created_at: minutesAgo(150),
  },
  {
    id: 'cnv-aarav',
    assigned_agent_id: null,
    platform: 'webchat',
    external_chat_id: 'wc-session-4471',
    sender_name: 'Aarav Sharma',
    sender_phone: '+91 88050 11223',
    sender_email: 'aarav.sharma@brightlabs.in',
    auto_pilot: AUTO_PILOT.ON,
    approval_mode: APPROVAL_MODE.AUTO,
    unread: 0,
    created_at: minutesAgo(96),
  },
  {
    id: 'cnv-karan',
    assigned_agent_id: 'agent-mei',
    platform: 'discord',
    external_chat_id: 'dc-771002',
    sender_name: 'Karan Malhotra',
    sender_phone: '',
    sender_email: 'karan.m@devmail.io',
    auto_pilot: AUTO_PILOT.ON,
    approval_mode: APPROVAL_MODE.MANUAL,
    unread: 2,
    created_at: minutesAgo(64),
  },
  {
    id: 'cnv-meera',
    assigned_agent_id: 'agent-liam',
    platform: 'linkedin',
    external_chat_id: 'li-org-3391',
    sender_name: 'Meera Iyer',
    sender_phone: '+91 79000 55841',
    sender_email: 'meera.iyer@vertexgroup.com',
    auto_pilot: AUTO_PILOT.ON,
    approval_mode: APPROVAL_MODE.AUTO,
    unread: 0,
    created_at: minutesAgo(28),
  },
];

const SEED_LEADS = [
  { id: 'lead-sarah', conversation_id: 'cnv-sarah', full_name: 'Sarah Mitchell', phone_number: '+91 98200 41122', email_address: 'sarah.mitchell@northwind.co', lead_tags: ['#PRICING_INQUIRY'], status: 'Qualified' },
  { id: 'lead-rahul', conversation_id: 'cnv-rahul', full_name: 'Rahul Verma', phone_number: '+91 99110 78345', email_address: 'rahul.verma@gmail.com', lead_tags: ['#HOT_LEAD', '#SETUP_ISSUE'], status: 'Contacted' },
  { id: 'lead-priya', conversation_id: 'cnv-priya', full_name: 'Priya Nair', phone_number: '+91 90045 22190', email_address: 'priya.nair@outlook.com', lead_tags: ['#DEMO_REQUEST'], status: 'New' },
  { id: 'lead-aarav', conversation_id: 'cnv-aarav', full_name: 'Aarav Sharma', phone_number: '+91 88050 11223', email_address: 'aarav.sharma@brightlabs.in', lead_tags: ['#SUPPORT'], status: 'Contacted' },
  { id: 'lead-karan', conversation_id: 'cnv-karan', full_name: 'Karan Malhotra', phone_number: '', email_address: 'karan.m@devmail.io', lead_tags: ['#PRICING_INQUIRY'], status: 'New' },
  { id: 'lead-meera', conversation_id: 'cnv-meera', full_name: 'Meera Iyer', phone_number: '+91 79000 55841', email_address: 'meera.iyer@vertexgroup.com', lead_tags: ['#HOT_LEAD'], status: 'Qualified' },
];

/* Messages grouped by conversation id, oldest first. */
const SEED_MESSAGES = {
  'cnv-sarah': [
    { sender_type: SENDER_TYPE.USER, direction: DIRECTION.INBOUND, text_content: 'Hi! Could you share your pricing for the growth plan?', status: 'READ', at: minutesAgo(318) },
    { sender_type: SENDER_TYPE.BOT, direction: DIRECTION.OUTBOUND, text_content: 'Thanks for reaching out, Sarah. Our growth plan starts from a base rate and scales with the channels you connect. Would you like a detailed quote?', status: 'READ', at: minutesAgo(317) },
    { sender_type: SENDER_TYPE.USER, direction: DIRECTION.INBOUND, text_content: 'Yes please. We run three channels currently.', status: 'READ', at: minutesAgo(40) },
    { sender_type: SENDER_TYPE.BOT, direction: DIRECTION.OUTBOUND, text_content: 'Perfect — three channels sit comfortably in the growth tier. I have noted your requirement and a detailed quote will follow shortly.', status: 'DELIVERED', at: minutesAgo(39) },
  ],
  'cnv-rahul': [
    { sender_type: SENDER_TYPE.USER, direction: DIRECTION.INBOUND, text_content: 'Hello, I am Rahul. Setup ke baad messages receive nahi ho rahe.', status: 'READ', at: minutesAgo(238) },
    { sender_type: SENDER_TYPE.BOT, direction: DIRECTION.OUTBOUND, text_content: 'Thanks for writing in, Rahul. I understand setup is not receiving messages. Let me bring in a specialist right away.', status: 'READ', at: minutesAgo(237) },
    { sender_type: SENDER_TYPE.USER, direction: DIRECTION.INBOUND, text_content: 'WhatsApp par webhook verify nahi ho raha, error aa raha hai.', status: 'READ', at: minutesAgo(22) },
    { sender_type: SENDER_TYPE.USER, direction: DIRECTION.INBOUND, text_content: 'Kal tak kaam ho jayega? Hum launch kar rahe hain.', status: 'READ', at: minutesAgo(18) },
    { sender_type: SENDER_TYPE.USER, direction: DIRECTION.INBOUND, text_content: 'Please reply jaldi, urgent hai.', status: 'READ', at: minutesAgo(9) },
  ],
  'cnv-priya': [
    { sender_type: SENDER_TYPE.USER, direction: DIRECTION.INBOUND, text_content: 'Hey! I saw your reel about the unified inbox. Can I get a walkthrough?', status: 'READ', at: minutesAgo(148) },
    { sender_type: SENDER_TYPE.BOT, direction: DIRECTION.OUTBOUND, text_content: 'Hi Priya! Lovely to hear from you. A walkthrough takes about twenty minutes and we can run it whenever suits you.', status: 'READ', at: minutesAgo(147) },
    { sender_type: SENDER_TYPE.USER, direction: DIRECTION.INBOUND, text_content: 'Tomorrow 4 PM works. Please send the invite.', status: 'READ', at: minutesAgo(12) },
  ],
  'cnv-aarav': [
    { sender_type: SENDER_TYPE.USER, direction: DIRECTION.INBOUND, text_content: 'Do you support Discord along with WhatsApp in one dashboard?', status: 'READ', at: minutesAgo(94) },
    { sender_type: SENDER_TYPE.BOT, direction: DIRECTION.OUTBOUND, text_content: 'We do. OmniHub brings WhatsApp, Instagram, Telegram, Discord, LinkedIn and web chat into one inbox with shared contact history.', status: 'READ', at: minutesAgo(93) },
    { sender_type: SENDER_TYPE.USER, direction: DIRECTION.INBOUND, text_content: 'That is exactly what we need. Sending this to my team.', status: 'READ', at: minutesAgo(30) },
  ],
  'cnv-karan': [
    { sender_type: SENDER_TYPE.USER, direction: DIRECTION.INBOUND, text_content: 'Is there an API for pulling conversation history into our own tooling?', status: 'READ', at: minutesAgo(62) },
    { sender_type: SENDER_TYPE.BOT, direction: DIRECTION.OUTBOUND, text_content: 'Yes — the dashboard API exposes conversations and messages, and webhooks keep you in sync as new traffic arrives.', status: 'READ', at: minutesAgo(61) },
    { sender_type: SENDER_TYPE.USER, direction: DIRECTION.INBOUND, text_content: 'Perfect. What about rate limits on that endpoint?', status: 'READ', at: minutesAgo(16) },
    { sender_type: SENDER_TYPE.USER, direction: DIRECTION.INBOUND, text_content: 'Also we are on a Discord dev tier, does that matter?', status: 'READ', at: minutesAgo(7) },
  ],
  'cnv-meera': [
    { sender_type: SENDER_TYPE.USER, direction: DIRECTION.INBOUND, text_content: 'We manage six regional pages. Can agents be scoped per region?', status: 'READ', at: minutesAgo(26) },
    { sender_type: SENDER_TYPE.BOT, direction: DIRECTION.OUTBOUND, text_content: 'They can. Assignment supports manual routing, round-robin, skill-based and territory-based rules, so each agent only sees their own region.', status: 'DELIVERED', at: minutesAgo(25) },
  ],
};

/* Held drafts. These only surface while approval mode is MANUAL (PRD 9.2). */
const SEED_APPROVALS = [
  {
    conversation_id: 'cnv-rahul',
    proposed_text: 'Thank you for your patience, Rahul. A WhatsApp webhook verification error is usually caused by a mismatched verify token. Our team is checking your configuration now and will confirm today.',
    source: 'AI draft · setup issue detected',
    status: APPROVAL_STATUS.PENDING,
    at: minutesAgo(8),
  },
  {
    conversation_id: 'cnv-priya',
    proposed_text: 'Lovely — tomorrow at 4 PM is confirmed. I have sent the calendar invite to your email. See you then, Priya.',
    source: 'AI draft · demo scheduling',
    status: APPROVAL_STATUS.PENDING,
    at: minutesAgo(11),
  },
  {
    conversation_id: 'cnv-karan',
    proposed_text: 'Good questions on both counts. The dashboard API allows one thousand requests per minute per key, and your Discord developer tier does not affect OmniHub — we handle the platform side for you.',
    source: 'AI draft · API inquiry',
    status: APPROVAL_STATUS.PENDING,
    at: minutesAgo(5),
  },
];

const SEED_NOTES = [
  {
    id: 'note-1',
    conversation_id: 'cnv-rahul',
    author_name: 'Priya (Agent)',
    text: 'Client is facing webhook token verification mismatch on WhatsApp Meta console. Requested access to verify payload.',
    created_at: minutesAgo(110),
  },
  {
    id: 'note-2',
    conversation_id: 'cnv-sarah',
    author_name: 'Admin',
    text: 'Interested in annual commitment with 3 connected channels. Follow up with commercial proposal.',
    created_at: minutesAgo(30),
  },
  {
    id: 'note-3',
    conversation_id: 'cnv-priya',
    author_name: 'You',
    text: 'Scheduled product walkthrough demo for tomorrow at 4:00 PM via Google Meet.',
    created_at: minutesAgo(10),
  },
];

/* ------------------------------------------------------------
   Storage bootstrap - the seed is written once per version so a
   reviewer always lands on a populated workspace.
   ------------------------------------------------------------ */

function buildSeed() {
  const messages = [];
  Object.entries(SEED_MESSAGES).forEach(([conversationId, list]) => {
    const platform = SEED_CONVERSATIONS.find((item) => item.id === conversationId)?.platform;
    list.forEach((message, index) => {
      messages.push({
        id: `${conversationId}-m${index + 1}`,
        conversation_id: conversationId,
        platform,
        media_url: null,
        created_at: message.at,
        ...message,
      });
    });
  });

  const approvals = SEED_APPROVALS.map((approval) => ({
    id: newId('apr'),
    conversation_id: approval.conversation_id,
    message_id: null,
    platform: SEED_CONVERSATIONS.find((item) => item.id === approval.conversation_id)?.platform,
    status: approval.status,
    created_at: approval.at,
    proposed_text: approval.proposed_text,
    source: approval.source,
  }));

  return {
    conversations: SEED_CONVERSATIONS.map((item) => ({ ...item, updated_at: item.created_at })),
    messages,
    leads: SEED_LEADS,
    approvals,
    notes: SEED_NOTES,
  };
}

function ensureSeed(force = false) {
  const version = Number(localStorage.getItem(SEED_VERSION_KEY) || 0);
  if (!force && version === SEED_VERSION && readJson(CONVERSATIONS_KEY, null)) {
    const defaults = Object.fromEntries(SEED_CONVERSATIONS.map((item) => [item.id, item.assigned_agent_id]));
    const conversations = demoStore.conversations();
    if (conversations.some((item) => !Object.hasOwn(item, 'assigned_agent_id'))) {
      demoStore.saveConversations(conversations.map((item) => (
        Object.hasOwn(item, 'assigned_agent_id') ? item : { ...item, assigned_agent_id: defaults[item.id] ?? null }
      )));
    }
    return;
  }
  const seed = buildSeed();
  writeJson(CONVERSATIONS_KEY, seed.conversations);
  writeJson(MESSAGES_KEY, seed.messages);
  writeJson(LEADS_KEY, seed.leads);
  writeJson(APPROVALS_KEY, seed.approvals);
  writeJson(NOTES_KEY, seed.notes);
  localStorage.setItem(SEED_VERSION_KEY, String(SEED_VERSION));
}

/* Shared raw accessors. approvalService and SocketContext reuse these so the
   demo layer has a single source of truth. */
export const demoStore = {
  conversations: () => readJson(CONVERSATIONS_KEY, []),
  messages: () => readJson(MESSAGES_KEY, []),
  leads: () => readJson(LEADS_KEY, []),
  approvals: () => readJson(APPROVALS_KEY, []),
  notes: () => readJson(NOTES_KEY, []),
  saveConversations: (rows) => writeJson(CONVERSATIONS_KEY, rows),
  saveMessages: (rows) => writeJson(MESSAGES_KEY, rows),
  saveLeads: (rows) => writeJson(LEADS_KEY, rows),
  saveApprovals: (rows) => writeJson(APPROVALS_KEY, rows),
  saveNotes: (rows) => writeJson(NOTES_KEY, rows),
  ensureSeed,
  newId,
};

const lastMessageOf = (messages, conversationId) => {
  const scoped = messages.filter((message) => message.conversation_id === conversationId);
  return scoped.length ? scoped[scoped.length - 1] : null;
};

let _cachedConversations = [];
let _cachedMessages = {};

export const conversationService = {
  getCachedConversations() {
    return _cachedConversations.length > 0 ? _cachedConversations : this._getLocalConversations();
  },

  _getLocalConversations() {
    ensureSeed();
    const messages = demoStore.messages();
    const leads = demoStore.leads();
    const approvals = demoStore.approvals();

    return demoStore.conversations()
      .map((conversation) => {
        const conversationMessages = messages.filter((message) => message.conversation_id === conversation.id);
        const lastMessage = lastMessageOf(messages, conversation.id);
        const messageText = conversationMessages.map((message) => message.text_content || '').join(' ');
        return {
          ...conversation,
          lastMessage,
          messageText,
          messageStatuses: conversationMessages.map((message) => message.status).filter(Boolean),
          hasMedia: conversationMessages.some((message) => Boolean(message.media_url)),
          language: detectLanguage(messageText),
          messageCount: conversationMessages.length,
          last_activity_at: lastMessage?.created_at || conversation.created_at,
          lead: leads.find((lead) => lead.conversation_id === conversation.id) || null,
          heldDraft: approvals.find((approval) => approval.conversation_id === conversation.id
            && approval.status === APPROVAL_STATUS.PENDING) || null,
        };
      })
      .sort((a, b) => new Date(b.last_activity_at) - new Date(a.last_activity_at));
  },

  /** Inbox list, newest activity first, enriched for the left panel. */
  async listConversations() {
    try {
      const res = await api.get('/dashboard/conversations');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const enriched = res.data.data.map((c) => {
          const cid = c._id || c.id;
          const lastMsg = c.lastMessage || { text_content: '' };
          return {
            ...c,
            id: cid,
            lastMessage: lastMsg,
            messageText: lastMsg.text_content || '',
            unread: c.unread_count ?? c.unread ?? 0,
            status: c.status || 'ACTIVE',
            auto_pilot: c.auto_pilot || 'ON',
            approval_mode: c.approval_mode || 'AUTO',
            messageCount: c.messageCount || 1,
            hasMedia: Boolean(c.hasMedia),
            last_activity_at: c.last_activity_at || c.created_at,
            lead: c.lead || null,
            heldDraft: c.heldDraft || null,
          };
        });
        _cachedConversations = enriched;
        return enriched;
      }
    } catch (err) {
      console.warn('[conversationService] Live API unavailable, falling back:', err.message);
    }
    const fallback = this._getLocalConversations();
    _cachedConversations = fallback;
    return fallback;
  },

  listSavedSearches() {
    const saved = localStorage.getItem(SAVED_SEARCHES_KEY);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) throw new Error('Saved searches must be a list.');
      return parsed;
    } catch (error) {
      console.error('Could not read saved conversation searches.', error);
      throw new Error('Saved searches could not be loaded. Refresh the page to retry.');
    }
  },

  saveConversationSearch({ name, filters }) {
    const title = String(name || '').trim();
    if (!title || title.length > 40) throw new Error('Enter a search name between 1 and 40 characters.');
    const searches = this.listSavedSearches();
    const savedSearch = {
      id: newId('search'),
      name: title,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify([savedSearch, ...searches]));
    return this.listSavedSearches();
  },

  deleteConversationSearch(searchId) {
    const searches = this.listSavedSearches();
    if (!searches.some((search) => search.id === searchId)) throw new Error('That saved search could not be found.');
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches.filter((search) => search.id !== searchId)));
    return this.listSavedSearches();
  },

  async getMessages(conversationId) {
    try {
      const res = await api.get(`/dashboard/messages/${conversationId}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map((m) => ({
          ...m,
          id: m._id || m.id,
          conversation_id: m.conversation_id || conversationId,
          sender_type: m.sender_type || (m.direction === 'INBOUND' ? 'USER' : 'AGENT'),
          direction: m.direction || 'INBOUND',
          text_content: m.text_content || '',
          status: typeof m.status === 'string' ? m.status.toLowerCase() : (m.status?.id || 'delivered'),
          created_at: m.created_at || new Date().toISOString(),
        }));
        _cachedMessages[conversationId] = mapped;
        return mapped;
      }
    } catch (err) {
      console.warn('[conversationService] Live messages API unavailable, fallback:', err.message);
    }
    ensureSeed();
    return demoStore.messages()
      .filter((message) => message.conversation_id === conversationId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  },

  getLead(conversationId) {
    ensureSeed();
    return demoStore.leads().find((lead) => lead.conversation_id === conversationId) || null;
  },

  updateLead(conversationId, updates) {
    const leads = demoStore.leads();
    const target = leads.find((l) => l.conversation_id === conversationId);
    const updatedLead = target
      ? { ...target, ...updates }
      : {
        id: newId('lead'),
        conversation_id: conversationId,
        full_name: '',
        phone_number: '',
        email_address: '',
        lead_tags: [],
        status: 'New',
        ...updates,
      };
    const nextLeads = target
      ? leads.map((l) => (l.conversation_id === conversationId ? updatedLead : l))
      : [...leads, updatedLead];
    demoStore.saveLeads(nextLeads);
    return updatedLead;
  },

  /** PRD 9.4 - Auto-Pilot switch, per conversation. */
  async setAutoPilot(conversationId, enabled) {
    try {
      await api.post(`/dashboard/conversations/${conversationId}/autopilot`, {
        enabled: Boolean(enabled),
        auto_pilot: enabled ? 'ON' : 'OFF',
      });
    } catch (err) {
      console.warn('[conversationService] Live autopilot error:', err.message);
    }
    const rows = demoStore.conversations();
    const stamp = new Date().toISOString();
    const next = rows.map((row) => (row.id === conversationId
      ? { ...row, auto_pilot: enabled ? AUTO_PILOT.ON : AUTO_PILOT.OFF, updated_at: stamp }
      : row));
    demoStore.saveConversations(next);
    return next.find((row) => row.id === conversationId);
  },

  /** PRD 9.2 - client approval toggle, per conversation. */
  async setApprovalMode(conversationId, mode) {
    try {
      await api.post(`/dashboard/conversations/${conversationId}/approval-mode`, {
        approval_mode: mode,
      });
    } catch (err) {
      console.warn('[conversationService] Live approval mode error:', err.message);
    }
    const rows = demoStore.conversations();
    const stamp = new Date().toISOString();
    const next = rows.map((row) => (row.id === conversationId
      ? { ...row, approval_mode: mode, updated_at: stamp }
      : row));
    demoStore.saveConversations(next);
    return next.find((row) => row.id === conversationId);
  },

  async markRead(conversationId) {
    try {
      await api.post(`/dashboard/conversations/${conversationId}/read`);
    } catch (err) {
      // ignore
    }
    const rows = demoStore.conversations();
    demoStore.saveConversations(rows.map((row) => (row.id === conversationId ? { ...row, unread: 0 } : row)));
  },

  /** Appends one message and bumps the conversation activity stamp. */
  async appendMessage(conversationId, payload) {
    try {
      const res = await api.post(`/dashboard/messages/${conversationId}`, {
        text_content: payload.text_content,
        media_url: payload.media_url,
        media_type: payload.media_type,
        media_name: payload.media_name,
        buttons: payload.buttons,
      });
      if (res.data?.success && res.data.data) {
        const saved = {
          ...res.data.data,
          id: res.data.data._id || res.data.data.id,
          ...payload,
        };
        const cur = _cachedMessages[conversationId] || [];
        _cachedMessages[conversationId] = [...cur, saved];
        return saved;
      }
    } catch (err) {
      console.warn('[conversationService] Live message dispatch error:', err.message);
    }

    const conversation = demoStore.conversations().find((row) => row.id === conversationId);
    if (!conversation) {
      return {
        id: newId('msg'),
        conversation_id: conversationId,
        created_at: new Date().toISOString(),
        ...payload,
      };
    }
    const message = {
      id: newId('msg'),
      conversation_id: conversationId,
      platform: conversation?.platform,
      media_url: null,
      created_at: new Date().toISOString(),
      ...payload,
    };
    demoStore.saveMessages([...demoStore.messages(), message]);
    if (payload.direction === DIRECTION.INBOUND) {
      const extracted = extractLeadDetails(payload.text_content);
      const leads = demoStore.leads();
      const existing = leads.find((lead) => lead.conversation_id === conversationId);
      const autoTags = extracted.tags.filter((tag) => !existing?.lead_tags?.includes(tag));
      const updatedLead = {
        ...existing,
        id: existing?.id || newId('lead'),
        conversation_id: conversationId,
        full_name: existing?.full_name || extracted.fullName || '',
        phone_number: existing?.phone_number || extracted.phone || '',
        email_address: existing?.email_address || extracted.email || '',
        lead_tags: [...(existing?.lead_tags || []), ...autoTags],
        status: existing?.status || 'New',
        updated_at: new Date().toISOString(),
      };
      demoStore.saveLeads(existing
        ? leads.map((lead) => (lead.conversation_id === conversationId ? updatedLead : lead))
        : [...leads, updatedLead]);
    }
    demoStore.saveConversations(demoStore.conversations().map((row) => (row.id === conversationId
      ? {
        ...row,
        unread: payload.direction === DIRECTION.INBOUND ? (row.unread || 0) + 1 : row.unread,
        updated_at: message.created_at,
      }
      : row)));
    return message;
  },

  updateMessageDeliveryStatus(conversationId, messageId, status, failureReason = '') {
    const messages = demoStore.messages();
    const target = messages.find((message) => message.id === messageId && message.conversation_id === conversationId);
    if (!target) throw new Error('That message could not be found in this conversation.');
    const allowed = [MESSAGE_STATUS.SENT.id, MESSAGE_STATUS.DELIVERED.id, MESSAGE_STATUS.READ.id, MESSAGE_STATUS.FAILED.id];
    if (!allowed.includes(status)) throw new Error('That delivery receipt status is not supported.');
    if (target.direction !== DIRECTION.OUTBOUND) throw new Error('Delivery receipts apply only to outbound messages.');
    const platform = demoStore.conversations().find((row) => row.id === conversationId)?.platform;
    const receiptStatusesByPlatform = {
      telegram: [MESSAGE_STATUS.SENT.id, MESSAGE_STATUS.DELIVERED.id, MESSAGE_STATUS.READ.id, MESSAGE_STATUS.FAILED.id],
      discord: [MESSAGE_STATUS.SENT.id, MESSAGE_STATUS.DELIVERED.id, MESSAGE_STATUS.FAILED.id],
      whatsapp: [MESSAGE_STATUS.SENT.id, MESSAGE_STATUS.DELIVERED.id, MESSAGE_STATUS.READ.id, MESSAGE_STATUS.FAILED.id],
      instagram: [MESSAGE_STATUS.SENT.id, MESSAGE_STATUS.DELIVERED.id, MESSAGE_STATUS.READ.id, MESSAGE_STATUS.FAILED.id],
      webchat: [MESSAGE_STATUS.SENT.id, MESSAGE_STATUS.DELIVERED.id, MESSAGE_STATUS.READ.id, MESSAGE_STATUS.FAILED.id],
      linkedin: [MESSAGE_STATUS.SENT.id, MESSAGE_STATUS.DELIVERED.id, MESSAGE_STATUS.FAILED.id],
    };
    if (!receiptStatusesByPlatform[platform]?.includes(status)) {
      throw new Error(`${platform || 'This channel'} does not support the ${status.toLowerCase()} receipt.`);
    }
    const deliveryRank = {
      [MESSAGE_STATUS.SENT.id]: 1,
      [MESSAGE_STATUS.DELIVERED.id]: 2,
      [MESSAGE_STATUS.READ.id]: 3,
    };
    if (status !== MESSAGE_STATUS.FAILED.id
      && deliveryRank[target.status] > deliveryRank[status]) return target;
    const now = new Date().toISOString();
    const updated = {
      ...target,
      status,
      status_updated_at: now,
      delivery_log: [
        ...(target.delivery_log || []),
        {
          status,
          at: now,
          source: 'local-demo-receipt',
          ...(status === MESSAGE_STATUS.FAILED.id
            ? { reason: String(failureReason || 'The channel reported a delivery failure.').slice(0, 240) }
            : {}),
        },
      ],
      ...(status === MESSAGE_STATUS.FAILED.id
        ? { failure_reason: String(failureReason || 'The channel reported a delivery failure.').slice(0, 240) }
        : { failure_reason: '' }),
    };
    demoStore.saveMessages(messages.map((message) => message.id === messageId ? updated : message));
    return updated;
  },

  queueMessageRetry(conversationId, messageId) {
    const messages = demoStore.messages();
    const target = messages.find((message) => message.id === messageId && message.conversation_id === conversationId);
    if (!target) throw new Error('That message could not be found in this conversation.');
    if (target.status !== MESSAGE_STATUS.FAILED.id) throw new Error('Only failed messages can be retried.');
    const attempts = Number(target.delivery_attempts || target.retry_attempts || 1);
    if (attempts >= 3) throw new Error('This message has reached the three-attempt delivery limit. Use email or SMS fallback.');
    const now = new Date().toISOString();
    const updated = {
      ...target,
      status: MESSAGE_STATUS.SENT.id,
      delivery_attempts: attempts + 1,
      retry_attempts: attempts,
      retry_queued_at: now,
      delivery_log: [
        ...(target.delivery_log || []),
        { status: MESSAGE_STATUS.SENT.id, attempt: attempts + 1, at: now, source: 'local-demo-retry' },
      ],
    };
    demoStore.saveMessages(messages.map((message) => message.id === messageId ? updated : message));
    return updated;
  },

  /** Held drafts across the workspace, for the sidebar badge. */
  getPendingCount() {
    ensureSeed();
    return demoStore.approvals().filter((row) => row.status === APPROVAL_STATUS.PENDING).length;
  },

  resetDemo() {
    ensureSeed(true);
  },
};