import { Clock3, MessagesSquare, Send, Star } from 'lucide-react';

const METRICS = [
  { key: 'chatsHandled', label: 'Chats handled', icon: MessagesSquare, format: (value) => value },
  { key: 'averageFirstResponseMinutes', label: 'First response', icon: Clock3, format: (value) => value == null ? '—' : `${value}m` },
  { key: 'messagesSent', label: 'Messages sent', icon: Send, format: (value) => value },
  { key: 'satisfaction', label: 'CSAT', icon: Star, format: (value) => `${value.toFixed(1)} / 5` },
];

export default function AgentPerformance({ agent, compact = false }) {
  return (
    <div className={`agent-performance${compact ? ' agent-performance--compact' : ''}`}>
      {METRICS.map(({ key, label, icon: Icon, format }) => (
        <div className="agent-performance-metric" key={key}>
          <span className="agent-performance-icon"><Icon size={15} /></span>
          <span className="agent-performance-copy">
            <small>{label}</small>
            <strong>{format(agent[key] ?? (key === 'averageFirstResponseMinutes' ? null : 0))}</strong>
          </span>
        </div>
      ))}
      {!compact && (
        <div className="agent-resolution-note">
          <span>Average resolution</span>
          <strong>{agent.avgResolutionHours}h</strong>
          <small>Sampled from this agent’s demo performance profile</small>
        </div>
      )}
    </div>
  );
}
