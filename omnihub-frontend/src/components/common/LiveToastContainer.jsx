import React from 'react';
import ChannelBadge from '../dashboard/ChannelBadge.jsx';

export default function LiveToastContainer({ toasts = [], onOpen, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="live-toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="live-toast-item"
          onClick={() => onOpen?.(toast.conversationId)}
          role="alert"
        >
          <div className="live-toast-badge-col">
            <ChannelBadge platform={toast.platform} size="sm" withLabel={false} />
          </div>
          <div className="live-toast-content">
            <div className="live-toast-header">
              <strong className="live-toast-sender">{toast.sender || 'Customer'}</strong>
              <span className="live-toast-time">Just now</span>
            </div>
            <p className="live-toast-body">{toast.text}</p>
          </div>
          <button
            type="button"
            className="live-toast-close"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss?.(toast.id);
            }}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
