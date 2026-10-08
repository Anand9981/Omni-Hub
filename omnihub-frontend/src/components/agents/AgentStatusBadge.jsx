import { Circle } from 'lucide-react';

const STATUS_LABELS = {
  online: 'Online',
  busy: 'At capacity',
  away: 'Away',
  offline: 'Offline',
};

export default function AgentStatusBadge({ status = 'offline' }) {
  return (
    <span className={`agent-status-badge agent-status-badge--${status}`}>
      <Circle size={7} fill="currentColor" />
      {STATUS_LABELS[status] || STATUS_LABELS.offline}
    </span>
  );
}
