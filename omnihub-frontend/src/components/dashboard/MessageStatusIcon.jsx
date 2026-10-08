import { AlertCircle, Check, CheckCheck, Clock3, X } from 'lucide-react';
import { getMessageStatus } from '../../utils/constants.js';

const STATUS_ICONS = {
  SENT: Check,
  DELIVERED: CheckCheck,
  READ: CheckCheck,
  FAILED: AlertCircle,
  PENDING_APPROVAL: Clock3,
  REJECTED: X,
};

export default function MessageStatusIcon({ status, platform, className = '' }) {
  const normalized = String(status || 'SENT').toUpperCase();
  const meta = getMessageStatus(normalized);
  const Icon = STATUS_ICONS[normalized] || Check;
  const isWhatsAppRead = normalized === 'READ' && platform === 'whatsapp';
  return (
    <span
      aria-label={`${meta.label}${platform ? ` on ${platform}` : ''}`}
      className={`chat-status chat-status--${meta.tone}${isWhatsAppRead ? ' chat-status--whatsapp-read' : ''} ${className}`.trim()}
      role="img"
      title={`${meta.label}${isWhatsAppRead ? ' · blue ticks' : ''}`}
    >
      <Icon aria-hidden="true" size={13} />
      <span>{meta.label}</span>
    </span>
  );
}
