import { demoStore } from './conversationService.js';
import { LEAD_STATUS } from '../utils/constants.js';
import api from '../api/axios.js';

export const LEAD_STATUSES = Object.values(LEAD_STATUS);

function lastMessageFor(messages, conversationId) {
  return messages
    .filter((message) => message.conversation_id === conversationId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;
}

export const leadService = {
  async listLeads() {
    try {
      const res = await api.get('/dashboard/leads');
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data.map((lead) => ({
          ...lead,
          id: lead._id || lead.id,
          conversation_id: lead.conversation_id?._id || lead.conversation_id?.id || lead.conversation_id,
          full_name: lead.full_name || lead.conversation_id?.sender_name || 'Prospect',
          phone_number: lead.phone_number || lead.conversation_id?.sender_phone || '',
          email_address: lead.email_address || lead.conversation_id?.sender_email || '',
          platform: lead.conversation_id?.platform || 'unknown',
          external_chat_id: lead.conversation_id?.external_chat_id || '',
          lead_tags: lead.lead_tags || [],
          status: lead.status || 'New',
        }));
      }
    } catch (err) {
      console.warn('[leadService] Backend leads fetch error, using local fallback:', err.message);
    }

    demoStore.ensureSeed();
    const conversations = demoStore.conversations();
    const messages = demoStore.messages();
    const leads = demoStore.leads();
    return leads.map((lead) => {
      const conversation = conversations.find((item) => item.id === lead.conversation_id);
      const lastMessage = lastMessageFor(messages, lead.conversation_id);
      return {
        ...lead,
        full_name: lead.full_name || conversation?.sender_name || 'Unknown contact',
        phone_number: lead.phone_number || conversation?.sender_phone || '',
        email_address: lead.email_address || conversation?.sender_email || '',
        platform: conversation?.platform || 'unknown',
        external_chat_id: conversation?.external_chat_id || '',
        assigned_agent_id: conversation?.assigned_agent_id || null,
        unread: conversation?.unread || 0,
        last_message: lastMessage,
        updated_at: lead.updated_at || lastMessage?.created_at || conversation?.created_at || null,
      };
    }).sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
  },

  async getLead(leadId) {
    const list = await this.listLeads();
    return list.find((lead) => lead.id === leadId) || null;
  },

  async updateLead(leadId, updates) {
    demoStore.ensureSeed();
    const leads = demoStore.leads();
    const target = leads.find((lead) => lead.id === leadId);
    const convId = target?.conversation_id || leadId;

    try {
      await api.patch(`/dashboard/leads/${convId}`, updates);
    } catch (err) {
      console.warn('[leadService] Backend lead update warning:', err.message);
    }
    if (!target) throw new Error('That lead could not be found.');
    if (updates.status && !LEAD_STATUSES.includes(updates.status)) {
      throw new Error('Choose a valid lead status.');
    }
    if (updates.lead_tags) {
      if (!Array.isArray(updates.lead_tags)) throw new Error('Lead tags must be a list.');
      updates = { ...updates, lead_tags: [...new Set(updates.lead_tags.map((tag) => (
        String(tag).trim().replace(/^#*/, '').toUpperCase()
      )).filter(Boolean).map((tag) => `#${tag}`))] };
      if (updates.lead_tags.some((tag) => tag.length > 32)) throw new Error('Lead tags must be 32 characters or fewer.');
    }
    for (const key of ['full_name', 'phone_number', 'email_address']) {
      if (updates[key] !== undefined && typeof updates[key] !== 'string') {
        throw new Error(`Lead ${key.replace('_', ' ')} must be text.`);
      }
    }
    if (updates.email_address && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email_address)) {
      throw new Error('Enter a valid email address.');
    }
    const updated = { ...target, ...updates, updated_at: new Date().toISOString() };
    demoStore.saveLeads(leads.map((lead) => (lead.id === leadId ? updated : lead)));
    return this.listLeads();
  },

  async updateLeadForConversation(conversationId, updates) {
    try {
      await api.patch(`/dashboard/leads/${conversationId}`, updates);
    } catch (err) {
      console.warn('[leadService] Backend update lead for conversation warning:', err.message);
    }
    demoStore.ensureSeed();
    let lead = demoStore.leads().find((item) => item.conversation_id === conversationId);
    if (!lead) {
      const conversation = demoStore.conversations().find((item) => item.id === conversationId);
      if (!conversation) return this.listLeads();
      lead = {
        id: demoStore.newId('lead'),
        conversation_id: conversationId,
        full_name: conversation.sender_name || '',
        phone_number: conversation.sender_phone || '',
        email_address: conversation.sender_email || '',
        lead_tags: [],
        status: 'New',
      };
      demoStore.saveLeads([...demoStore.leads(), lead]);
    }
    return this.updateLead(lead.id, updates);
  },
};
