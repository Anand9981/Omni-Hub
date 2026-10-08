import { AlertTriangle, Mail, MessageCircle, RotateCcw } from 'lucide-react';

const MAX_ATTEMPTS = 3;

export default function DeliveryFailureBadge({ message, customerEmail, customerPhone, onRetry, retrying = false, retryError }) {
  const attempts = Number(message.delivery_attempts || message.retry_attempts || 1);
  const reason = message.failure_reason || message.delivery_error || 'The channel did not confirm delivery.';
  const canRetry = attempts < MAX_ATTEMPTS;
  const subject = encodeURIComponent('Message delivery follow-up');
  const body = encodeURIComponent(message.text_content || '');
  const phone = (customerPhone || '').replace(/[^\d+]/g, '');

  return (
    <div className="delivery-failure" role="group" aria-label="Message delivery failure">
      <div className="delivery-failure-heading">
        <span><AlertTriangle size={13} /> Delivery failed</span>
        <small>{attempts}/{MAX_ATTEMPTS} attempts used</small>
      </div>
      <p>{reason}</p>
      {retryError && <p className="delivery-retry-error" role="alert">{retryError}</p>}
      <div className="delivery-failure-actions">
        {canRetry ? (
          <button disabled={retrying} onClick={() => onRetry?.(message.id)} type="button">
            <RotateCcw size={12} /> {retrying ? 'Queuing…' : `Retry · attempt ${attempts + 1}/${MAX_ATTEMPTS}`}
          </button>
        ) : <span className="delivery-retry-limit">Three-attempt limit reached</span>}
        {customerEmail && <a href={`mailto:${customerEmail}?subject=${subject}&body=${body}`}><Mail size={12} /> Email</a>}
        {phone && <a href={`sms:${phone}?body=${body}`}><MessageCircle size={12} /> SMS</a>}
      </div>
      <small className="delivery-demo-note">Frontend demo · fallback opens your email/SMS app; no message was sent automatically.</small>
    </div>
  );
}
