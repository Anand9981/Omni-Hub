import { demoStore } from './conversationService.js';
import { ROLES } from '../utils/permissions.js';
import { SENDER_TYPE } from '../utils/constants.js';
import api from '../api/axios.js';

const AGENTS_KEY = 'omnihub.demo.agents';
const ROUND_ROBIN_KEY = 'omnihub.demo.agentRoundRobinCursor';

const SEEDED_AGENTS = [
  {
    id: 'agent-ava',
    name: 'Ava Patel',
    email: 'ava.patel@omnihub.demo',
    role: ROLES.SUPER_ADMIN,
    title: 'Support lead',
    team: 'Customer experience',
    status: 'online',
    skills: ['WhatsApp', 'Technical support', 'English', 'Hindi'],
    territory: 'India · APAC',
    maxConcurrentChats: 5,
    satisfaction: 4.9,
    avgResolutionHours: 2.4,
  },
  {
    id: 'agent-noah',
    name: 'Noah Williams',
    email: 'noah.williams@omnihub.demo',
    role: 'Agent',
    title: 'Senior support specialist',
    team: 'Customer experience',
    status: 'online',
    skills: ['Instagram', 'Sales', 'English', 'Demo requests'],
    territory: 'Global',
    maxConcurrentChats: 5,
    satisfaction: 4.8,
    avgResolutionHours: 3.1,
  },
  {
    id: 'agent-mei',
    name: 'Mei Chen',
    email: 'mei.chen@omnihub.demo',
    role: 'Agent',
    title: 'Product specialist',
    team: 'Product support',
    status: 'away',
    skills: ['Discord', 'API', 'Technical support', 'English'],
    territory: 'APAC',
    maxConcurrentChats: 5,
    satisfaction: 4.7,
    avgResolutionHours: 2.8,
  },
  {
    id: 'agent-liam',
    name: "Liam O'Connor",
    email: 'liam.oconnor@omnihub.demo',
    role: 'Agent',
    title: 'Sales specialist',
    team: 'Growth',
    status: 'online',
    skills: ['Telegram', 'LinkedIn', 'Pricing', 'English'],
    territory: 'EMEA',
    maxConcurrentChats: 5,
    satisfaction: 4.9,
    avgResolutionHours: 1.9,
  },
];

function readAgents() {
  const raw = localStorage.getItem(AGENTS_KEY);
  if (!raw) {
    localStorage.setItem(AGENTS_KEY, JSON.stringify(SEEDED_AGENTS));
    return SEEDED_AGENTS;
  }
  try {
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) throw new Error('Agent data must be an array.');
    return stored;
  } catch (error) {
    console.error('Could not read demo agents.', error);
    return SEEDED_AGENTS;
  }
}

function saveAgents(agents) {
  localStorage.setItem(AGENTS_KEY, JSON.stringify(agents));
}

function normalize(value) {
  return String(value || '').toLowerCase();
}

function matchingScore(agent, conversation, strategy) {
  const lead = demoStore.leads().find((item) => item.conversation_id === conversation.id);
  const context = normalize([
    conversation.platform,
    conversation.sender_name,
    lead?.status,
    ...(lead?.lead_tags || []),
  ].join(' '));
  const skills = (agent.skills || []).reduce((score, skill) => score + (context.includes(normalize(skill)) ? 1 : 0), 0);
  const inIndia = String(conversation.sender_phone || '').startsWith('+91');
  const territory = normalize(agent.territory);
  const territoryMatch = inIndia
    ? territory.includes('india') || territory.includes('apac')
    : territory.includes('global');
  return (strategy === 'skill' ? skills * 100 : territoryMatch ? 100 : 0);
}

function withWorkload(agent, conversations, messages) {
  const assigned = conversations.filter((conversation) => (
    String(conversation.assigned_agent_id?._id || conversation.assigned_agent_id || '') === String(agent.id)
  ));
  const sent = messages.filter((message) => (
    assigned.some((conversation) => conversation.id === message.conversation_id)
    && message.sender_type === SENDER_TYPE.AGENT
    && message.direction === 'OUTBOUND'
  ));

  const responseMinutes = assigned.flatMap((conversation) => {
    const thread = messages
      .filter((message) => message.conversation_id === conversation.id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const firstInbound = thread.find((message) => message.direction === 'INBOUND');
    const firstAgentReply = firstInbound && thread.find((message) => (
      message.sender_type === SENDER_TYPE.AGENT
      && message.direction === 'OUTBOUND'
      && new Date(message.created_at) >= new Date(firstInbound.created_at)
    ));
    return firstAgentReply
      ? [(new Date(firstAgentReply.created_at) - new Date(firstInbound.created_at)) / 60000]
      : [];
  });

  const maxConcurrent = Number(agent.maxConcurrentChats || 5);
  const activeChats = Math.max(Number(agent.activeChats || 0), assigned.length);
  const status = activeChats >= maxConcurrent ? 'busy' : (agent.status || 'online');
  return {
    ...agent,
    id: String(agent._id || agent.id),
    maxConcurrentChats: maxConcurrent,
    skills: Array.isArray(agent.skills) && agent.skills.length ? agent.skills : ['General support', 'WhatsApp', 'Telegram'],
    territory: agent.territory || 'India · APAC',
    avgResolutionHours: Number(agent.avgResolutionHours || 2.4),
    status,
    activeChats,
    availableSlots: Math.max(0, maxConcurrent - activeChats),
    chatsHandled: activeChats,
    messagesSent: Math.max(Number(agent.messagesSent || 0), sent.length),
    averageFirstResponseMinutes: responseMinutes.length
      ? Math.round(responseMinutes.reduce((sum, value) => sum + value, 0) / responseMinutes.length)
      : (agent.averageFirstResponseMinutes ?? 2),
    satisfaction: Number(Number(agent.satisfaction || 4.9).toFixed(1)),
  };
}

export const agentService = {
  ensureCurrentUserAgent(user) {
    demoStore.ensureSeed();
    if (user?.role !== ROLES.AGENT) return null;
    const email = String(user.email || '').trim().toLowerCase();
    if (!email) throw new Error('Your agent account needs an email address to open its assigned inbox.');
    const agents = readAgents();
    const existing = agents.find((agent) => agent.id === user.agentId || agent.id === user.id || agent.email.toLowerCase() === email);
    if (existing) return existing.id;

    const agent = {
      id: user.id || demoStore.newId('agent'),
      name: user.name || email,
      email,
      role: ROLES.AGENT,
      title: 'Support agent',
      team: 'Customer experience',
      status: 'online',
      skills: ['General support'],
      territory: 'Global',
      maxConcurrentChats: 5,
      satisfaction: 4.8,
      avgResolutionHours: 3,
    };
    saveAgents([...agents, agent]);
    return agent.id;
  },

  listAgentsSync() {
    demoStore.ensureSeed();
    const conversations = demoStore.conversations();
    const messages = demoStore.messages();
    return readAgents().map((agent) => withWorkload(agent, conversations, messages));
  },

  async listAgents() {
    demoStore.ensureSeed();
    const conversations = demoStore.conversations();
    const messages = demoStore.messages();

    try {
      const res = await api.get('/dashboard/agents');
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const remoteAgents = res.data.data.map((a) => ({
          ...a,
          id: String(a._id || a.id),
        }));
        const remoteEmails = new Set(remoteAgents.map((a) => String(a.email || '').toLowerCase()));
        const merged = [
          ...remoteAgents,
          ...SEEDED_AGENTS.filter((s) => !remoteEmails.has(s.email.toLowerCase())),
        ];
        saveAgents(merged);
        return merged.map((agent) => withWorkload(agent, conversations, messages));
      }
    } catch (err) {
      console.warn('[agentService] Backend listAgents fallback:', err.message);
    }

    return readAgents().map((agent) => withWorkload(agent, conversations, messages));
  },

  getAgent(agentId) {
    return this.listAgentsSync().find((agent) => agent.id === agentId) || null;
  },

  getAgentConversations(agentId) {
    demoStore.ensureSeed();
    const conversations = demoStore.conversations();
    const messages = demoStore.messages();
    return conversations
      .filter((conversation) => conversation.assigned_agent_id === agentId)
      .map((conversation) => ({
        ...conversation,
        lastMessage: messages
          .filter((message) => message.conversation_id === conversation.id)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null,
        lead: demoStore.leads().find((lead) => lead.conversation_id === conversation.id) || null,
      }));
  },

  async assignConversation(conversationId, agentId) {
    demoStore.ensureSeed();
    try {
      if (/^[0-9a-f]{24}$/i.test(String(conversationId))) {
        await api.post(`/dashboard/agents/${conversationId}/assign`, {
          agentId: /^[0-9a-f]{24}$/i.test(String(agentId || '')) ? agentId : null,
        });
      }
    } catch (err) {
      console.warn('[agentService] Backend assignConversation fallback:', err.message);
    }

    const conversations = demoStore.conversations();
    const updated = conversations.map((item) => (
      item.id === conversationId
        ? { ...item, assigned_agent_id: agentId || null, updated_at: new Date().toISOString() }
        : item
    ));
    demoStore.saveConversations(updated);
    return { conversationId, agentId: agentId || null, agents: await this.listAgents() };
  },

  async autoAssign(conversationId, strategy = 'load') {
    demoStore.ensureSeed();
    const available = (await this.listAgents()).filter((agent) => agent.status === 'online' && agent.availableSlots > 0);
    if (!available.length) throw new Error('No online agents have capacity right now.');

    const conversation = demoStore.conversations().find((item) => item.id === conversationId) || { id: conversationId, platform: 'whatsapp' };
    let chosen;
    if (strategy === 'roundRobin') {
      const cursor = Number(localStorage.getItem(ROUND_ROBIN_KEY) || 0);
      chosen = available[cursor % available.length];
      localStorage.setItem(ROUND_ROBIN_KEY, String(cursor + 1));
    } else {
      chosen = [...available].sort((a, b) => {
        const scoreDifference = matchingScore(b, conversation, strategy) - matchingScore(a, conversation, strategy);
        return scoreDifference || (a.activeChats / a.maxConcurrentChats) - (b.activeChats / b.maxConcurrentChats);
      })[0];
    }
    return await this.assignConversation(conversationId, chosen.id);
  },

  async updateAgent(agentId, updates) {
    demoStore.ensureSeed();
    const allowedStatuses = ['online', 'busy', 'away', 'offline'];
    if (updates.status && !allowedStatuses.includes(updates.status)) {
      throw new Error('Choose a valid agent status.');
    }
    if (updates.maxConcurrentChats !== undefined
      && (!Number.isInteger(updates.maxConcurrentChats) || updates.maxConcurrentChats < 1 || updates.maxConcurrentChats > 10)) {
      throw new Error('Concurrent chats must be between 1 and 10.');
    }

    try {
      if (/^[0-9a-f]{24}$/i.test(String(agentId))) {
        await api.put(`/dashboard/agents/${agentId}`, updates);
      }
    } catch (err) {
      console.warn('[agentService] Backend updateAgent fallback:', err.message);
    }

    const agents = readAgents();
    const updated = agents.map((agent) => (agent.id === agentId ? { ...agent, ...updates } : agent));
    saveAgents(updated);
    return await this.listAgents();
  },
};
