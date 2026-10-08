import { CHANNELS } from './constants.js';

export const CHANNEL_COLORS = Object.fromEntries(
  Object.values(CHANNELS).map((channel) => [channel.id, channel.color]),
);

export const TRAFFIC_COLORS = {
  inbound: '#2457d6',
  outbound: '#b5c7eb',
  ai: '#2457d6',
  menu: '#21836d',
  human: '#d29a48',
  pending: '#9ba8bb',
};

export const CHANNEL_SERIES = Object.values(CHANNELS).map((channel) => ({
  id: channel.id,
  label: channel.label,
  color: channel.color,
}));
