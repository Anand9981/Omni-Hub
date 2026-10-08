/**
 * App-wide constants for the OmniHub workspace.
 *
 * Channel colours follow PRD 12.2 (Multi-Platform Comparison Bar Chart):
 * green WhatsApp, magenta Instagram, blue Telegram, purple Discord,
 * dark blue LinkedIn, teal Web Chat.
 */

export const CHANNELS = {
  whatsapp: { id: 'whatsapp', label: 'WhatsApp', short: 'WA', color: '#1fa855', tint: '#e8f8ef' },
  instagram: { id: 'instagram', label: 'Instagram', short: 'IG', color: '#c837ab', tint: '#fbeaf6' },
  telegram: { id: 'telegram', label: 'Telegram', short: 'TG', color: '#2f8fd8', tint: '#e8f3fc' },
  discord: { id: 'discord', label: 'Discord', short: 'DC', color: '#6b5bd2', tint: '#efecfc' },
  linkedin: { id: 'linkedin', label: 'LinkedIn', short: 'LI', color: '#1d4d8f', tint: '#e8eef8' },
  webchat: { id: 'webchat', label: 'Web chat', short: 'WC', color: '#1f9e94', tint: '#e6f6f4' },
};

export const CHANNEL_LIST = Object.values(CHANNELS);

export function getChannel(platform) {
  return CHANNELS[platform] || { id: platform, label: platform, short: '??', color: '#7c8899', tint: '#f2f5f9' };
}

/** PRD 9.4 - per-conversation Auto-Pilot switch. */
export const AUTO_PILOT = { ON: 'ON', OFF: 'OFF' };

/** PRD 9.2 - client approval toggle. AUTO sends immediately, MANUAL holds. */
export const APPROVAL_MODE = { AUTO: 'AUTO', MANUAL: 'MANUAL' };

/** PRD 9.5 - message status indicators. */
export const MESSAGE_STATUS = {
  SENT: { id: 'SENT', label: 'Sent', tone: 'neutral' },
  DELIVERED: { id: 'DELIVERED', label: 'Delivered', tone: 'info' },
  READ: { id: 'READ', label: 'Read', tone: 'success' },
  PENDING_APPROVAL: { id: 'PENDING_APPROVAL', label: 'Pending approval', tone: 'warn' },
  REJECTED: { id: 'REJECTED', label: 'Rejected', tone: 'danger' },
  FAILED: { id: 'FAILED', label: 'Failed', tone: 'danger' },
};

export function getMessageStatus(status) {
  return MESSAGE_STATUS[status] || { id: status, label: status, tone: 'neutral' };
}

export const APPROVAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  EDITED: 'EDITED',
  REJECTED: 'REJECTED',
};

/** Module 6 universal schema - who produced the message. */
export const SENDER_TYPE = { USER: 'USER', AGENT: 'AGENT', BOT: 'BOT' };
export const DIRECTION = { INBOUND: 'INBOUND', OUTBOUND: 'OUTBOUND' };

/** PRD 10.2 - lead status and automatic tags. */
export const LEAD_STATUS = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  CONVERTED: 'Converted',
  LOST: 'Lost',
};

export const LEAD_TAGS = ['#HOT_LEAD', '#PRICING_INQUIRY', '#SETUP_ISSUE', '#SUPPORT', '#DEMO_REQUEST'];

/** PRD 9.3 - draft states the Approvals queue can show. */
export const APPROVAL_FILTERS = [
  { id: 'all', label: 'All pending' },
  { id: 'high', label: 'High intent' },
  { id: 'oldest', label: 'Longest waiting' },
];