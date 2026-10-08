import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { DIRECTION, SENDER_TYPE } from '../../utils/constants.js';
import MessageStatusIcon from './MessageStatusIcon.jsx';
import DeliveryFailureBadge from './DeliveryFailureBadge.jsx';
import ButtonRenderer from './ButtonRenderer.jsx';

function timeLabel(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function isImage(url) {
  return /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url) || url.startsWith('data:image/');
}

/**
 * One message row.
 *
 * PRD 7 & 9.5 - outbound bubbles carry a delivery indicator, support rich media
 * (PDF brochures, QR images), and post-service interactive buttons.
 * PRD 9.3 - author line distinguishes Auto-Pilot (AI) from human agent.
 */
export default function ChatBubble({ message, platform, customerEmail, customerPhone, onRetry, onButtonAction, retrying = false, retryError, retryErrorMessageId }) {
  const [buttonPath, setButtonPath] = useState([]);
  const outbound = message.direction === DIRECTION.OUTBOUND;
  const author = message.sender_type === SENDER_TYPE.BOT
    ? 'Auto-Pilot'
    : message.sender_type === SENDER_TYPE.AGENT
      ? (message.author_name || 'Agent')
      : null;

  const hasMedia = Boolean(message.media_url);
  const mediaIsImage = hasMedia && isImage(message.media_url);
  const canNavigateBack = buttonPath.length > 0;
  const canReturnToMain = buttonPath.length > 1;
  const chooseButton = (button) => {
    if (typeof button === 'string') {
      onButtonAction?.({ id: `legacy-${button}`, label: button, action: 'input' });
      return;
    }
    if (!button.action) {
      onButtonAction?.({ id: button.id || `legacy-${button.label || button.title}`, label: button.label || button.title, action: 'input' });
      return;
    }
    if (button.action === 'submenu' && button.children?.length) {
      setButtonPath((current) => [...current, button.id]);
      return;
    }
    onButtonAction?.(button);
  };
  let activeButton = message.buttons || [];
  let activeButtonLabel = '';
  buttonPath.forEach((id) => {
    const selected = activeButton.find((button) => button.id === id);
    if (!selected) return;
    activeButtonLabel = selected.label || selected.title;
    activeButton = selected.children || [];
  });

  return (
    <div className={`chat-row${outbound ? ' chat-row--out' : ''}`}>
      <div className={`chat-bubble chat-bubble--${outbound ? 'out' : 'in'}${message.is_note_only ? ' chat-bubble--note' : ''}`}>
        {outbound && author && (
          <span className="chat-author">
            {author}
            {message.sender_type === SENDER_TYPE.BOT && <i>AI</i>}
          </span>
        )}

        {/* Media attachment if present (PRD 7: Dynamic Media Dispatcher) */}
        {hasMedia && (
          <div className="chat-media-wrap">
            {mediaIsImage ? (
              <img
                alt="Attachment"
                className="chat-media-image"
                loading="lazy"
                src={message.media_url}
              />
            ) : (
              <a
                className="chat-media-doc"
                href={message.media_url}
                rel="noreferrer"
                target="_blank"
              >
                <FileText size={18} />
                <span className="chat-media-doc-name">
                  {message.media_name || 'Document Attachment (PDF)'}
                </span>
                <Download size={14} />
              </a>
            )}
          </div>
        )}

        {message.text_content && <p>{message.text_content}</p>}

        {/* Interactive buttons (PRD 7.1 Post-Service Menu) */}
        {Array.isArray(message.buttons) && message.buttons.length > 0 && (
          <>
            {activeButtonLabel && <p className="chat-menu-context">{activeButtonLabel}</p>}
            <ButtonRenderer
              buttons={activeButton}
              canGoBack={canNavigateBack}
              onBack={() => setButtonPath((current) => current.slice(0, -1))}
              onMainMenu={canReturnToMain ? () => setButtonPath([]) : null}
              onSelect={chooseButton}
              platform={platform || message.platform}
            />
          </>
        )}

        {outbound && message.status === 'FAILED' && (
          <DeliveryFailureBadge
            customerEmail={customerEmail}
            customerPhone={customerPhone}
            message={message}
            onRetry={onRetry}
            retrying={retrying}
            retryError={retryErrorMessageId === message.id ? retryError : null}
          />
        )}

        <span className="chat-meta">
          <span>{timeLabel(message.created_at)}</span>
          {outbound && <MessageStatusIcon platform={platform || message.platform} status={message.status} />}
          {outbound && message.retry_queued_at && <span className="chat-retry-queued">Retry queued · demo</span>}
        </span>
      </div>
    </div>
  );
}