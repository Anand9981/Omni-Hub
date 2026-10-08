import { APPROVAL_STATUS, CHANNEL_LIST, DIRECTION, SENDER_TYPE } from '../utils/constants.js';
import { conversationService, demoStore } from './conversationService.js';
import api from '../api/axios.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function rangeDates(range, customStart, customEnd) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  if (range === 'yesterday') {
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() - 1);
  } else if (range === '7d') {
    start.setTime(start.getTime() - 6 * DAY_MS);
  } else if (range === '30d') {
    start.setTime(start.getTime() - 29 * DAY_MS);
  } else if (range === 'custom') {
    if (customStart) {
      const [year, month, day] = customStart.split('-').map(Number);
      start.setFullYear(year, month - 1, day);
    }
    if (customEnd) {
      const [year, month, day] = customEnd.split('-').map(Number);
      end.setFullYear(year, month - 1, day + 1);
    }
  }

  if (end <= start) throw new Error('End date must be on or after the start date.');
  return { start, end };
}

function inRange(date, start, end) {
  const timestamp = new Date(date).getTime();
  return Number.isFinite(timestamp) && timestamp >= start.getTime() && timestamp < end.getTime();
}

function dateKey(date) {
  const parsed = new Date(date);
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
}

function buildHourly(messages) {
  const counts = Array.from({ length: 24 }, (_, hour) => ({ hour, inbound: 0, outbound: 0 }));
  messages.forEach((message) => {
    const hour = new Date(message.created_at).getHours();
    if (Number.isInteger(hour)) counts[hour][message.direction === DIRECTION.INBOUND ? 'inbound' : 'outbound'] += 1;
  });
  return counts.map((item) => ({ ...item, total: item.inbound + item.outbound }));
}

function buildDaily(messages, start, end) {
  const dayCount = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / DAY_MS));
  const days = Array.from({ length: Math.min(dayCount, 31) }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { date: dateKey(date), inbound: 0, outbound: 0 };
  });
  const byDate = new Map(days.map((day) => [day.date, day]));
  messages.forEach((message) => {
    const day = byDate.get(dateKey(message.created_at));
    if (day) day[message.direction === DIRECTION.INBOUND ? 'inbound' : 'outbound'] += 1;
  });
  return days;
}

export const analyticsService = {
  async getDashboard({ range = 'today', startDate, endDate } = {}) {
    try {
      const res = await api.get('/dashboard/analytics', {
        params: { range, startDate, endDate },
      });
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('[analyticsService] Live API unavailable, falling back to local computation:', err.message);
    }

    const { start, end } = rangeDates(range, startDate, endDate);
    const conversations = conversationService.getCachedConversations();
    const allMessages = conversations.flatMap((conversation) => demoStore.messages().filter((m) => m.conversation_id === conversation.id));
    const messages = allMessages.filter((message) => inRange(message.created_at, start, end));
    const inbound = messages.filter((message) => message.direction === DIRECTION.INBOUND);
    const outbound = messages.filter((message) => message.direction === DIRECTION.OUTBOUND);
    const approvals = demoStore.approvals().filter((approval) => inRange(approval.created_at, start, end));
    const pendingApprovals = approvals.filter((approval) => approval.status === APPROVAL_STATUS.PENDING);
    const platformRows = CHANNEL_LIST.map((channel) => {
      const channelMessages = messages.filter((message) => message.platform === channel.id);
      const channelOutbound = channelMessages.filter((message) => message.direction === DIRECTION.OUTBOUND);
      return {
        platform: channel.id,
        channel: channel.label,
        inbound: channelMessages.filter((message) => message.direction === DIRECTION.INBOUND).length,
        outbound: channelOutbound.length,
        aiReplies: channelOutbound.filter((message) => message.sender_type === SENDER_TYPE.BOT).length,
        humanReplies: channelOutbound.filter((message) => message.sender_type === SENDER_TYPE.AGENT).length,
        menuReplies: channelOutbound.filter((message) => message.reply_source === 'MENU').length,
        pending: pendingApprovals.filter((approval) => approval.platform === channel.id).length,
      };
    });
    const aiReplies = outbound.filter((message) => message.sender_type === SENDER_TYPE.BOT).length;
    const humanReplies = outbound.filter((message) => message.sender_type === SENDER_TYPE.AGENT).length;
    const menuReplies = outbound.filter((message) => message.reply_source === 'MENU').length;
    const leadCount = conversations.filter((conversation) =>
      conversation.lead && inRange(conversation.created_at, start, end)).length;
    const answeredInbound = Math.min(inbound.length, aiReplies);

    return {
      range,
      startDate: dateKey(start),
      endDate: dateKey(new Date(end.getTime() - 1)),
      kpis: {
        totalMessages: messages.length,
        automationRate: inbound.length ? Math.round((answeredInbound / inbound.length) * 100) : 0,
        pendingApprovals: pendingApprovals.length,
        averageLatency: 1.2,
        activeConversations: conversations.length,
        leadsGenerated: leadCount,
      },
      platformRows,
      hourly: buildHourly(messages),
      daily: buildDaily(messages, start, end),
      responseBreakdown: [
        { id: 'ai', label: 'AI auto-replied', value: aiReplies },
        { id: 'menu', label: 'Interactive menu', value: menuReplies },
        { id: 'human', label: 'Human agent', value: humanReplies },
        { id: 'pending', label: 'Pending approval', value: pendingApprovals.length },
      ],
      inboundTotal: inbound.length,
      outboundTotal: outbound.length,
      refreshedAt: new Date().toISOString(),
    };
  },

  getReportRows(data) {
    return [
      {
        Report: data.range,
        Period: `${data.startDate} to ${data.endDate}`,
        Channel: 'All channels',
        Inbound: data.inboundTotal,
        'AI replies': data.responseBreakdown.find((row) => row.id === 'ai')?.value || 0,
        'Menu replies': data.responseBreakdown.find((row) => row.id === 'menu')?.value || 0,
        'Human replies': data.responseBreakdown.find((row) => row.id === 'human')?.value || 0,
        Outbound: data.outboundTotal,
        'Pending approval': data.kpis.pendingApprovals,
        'Total messages': data.kpis.totalMessages,
        'AI resolution rate': `${data.kpis.automationRate}%`,
        'Average latency': `${data.kpis.averageLatency}s`,
        'Active conversations': data.kpis.activeConversations,
        'Leads generated': data.kpis.leadsGenerated,
      },
      ...data.platformRows.map((row) => ({
        Report: data.range,
        Period: `${data.startDate} to ${data.endDate}`,
        Channel: row.channel,
        Inbound: row.inbound,
        'AI replies': row.aiReplies,
        'Menu replies': row.menuReplies,
        'Human replies': row.humanReplies,
        Outbound: row.outbound,
        'Pending approval': row.pending,
        'Total messages': '',
        'AI resolution rate': '',
        'Average latency': '',
        'Active conversations': '',
        'Leads generated': '',
      })),
    ];
  },
};
