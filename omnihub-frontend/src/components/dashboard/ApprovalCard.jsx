import { Check, Clock3, ExternalLink, Pencil, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AIPolishButton from './AIPolishButton.jsx';
import ChannelBadge from './ChannelBadge.jsx';

function waitingLabel(minutes) {
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m waiting`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m waiting`;
}

/**
 * PRD 9.2 - the manual approval row.
 *
 * Action controls are exactly the three the PRD names:
 *   [Approve & Send]  send immediately
 *   [Edit Draft]      change the text before sending
 *   [Reject]          cancel the message
 */
export default function ApprovalCard({
  approval,
  busy = false,
  editing = false,
  onStartEdit,
  onCancelEdit,
  onApprove,
  onReject,
  onSaveEdit,
}) {
  const [draft, setDraft] = useState(approval.proposed_text);

  useEffect(() => {
    setDraft(approval.proposed_text);
  }, [approval.proposed_text, editing]);

  const isUrgent = approval.waitingMinutes >= 10;

  return (
    <article className={`approval-card${isUrgent ? ' is-urgent' : ''}`}>
      <header className="approval-head">
        <div className="approval-who">
          <span className="approval-avatar">{(approval.lead?.full_name || approval.conversation?.sender_name || '?').charAt(0).toUpperCase()}</span>
          <div>
            <Link
              className="approval-name-link"
              title="Open conversation in dashboard"
              to={`/dashboard/${approval.conversation_id?._id || approval.conversation_id || approval.conversation?.id || ''}`}
            >
              <strong>{approval.lead?.full_name || approval.conversation?.sender_name || 'Unknown customer'}</strong>
              <ExternalLink size={12} />
            </Link>
            <small>{approval.conversation?.sender_email || approval.conversation?.external_chat_id}</small>
          </div>
        </div>
        <div className="approval-tags">
          <ChannelBadge platform={approval.platform || approval.conversation?.platform} size="sm" />
          <span className={`approval-wait${isUrgent ? ' is-urgent' : ''}`}>
            <Clock3 size={13} /> {waitingLabel(approval.waitingMinutes)}
          </span>
        </div>
      </header>

      {approval.lastInbound && (
        <div className="approval-context">
          <span className="approval-context-label">Customer wrote</span>
          <p>{approval.lastInbound.text_content}</p>
        </div>
      )}

      <div className="approval-draft">
        <div className="approval-draft-head">
          <span className="approval-source">{approval.source}</span>
          <span className="approval-hold">Held - not sent</span>
        </div>
        {editing ? (
          <textarea
            aria-label="Edit the draft"
            autoFocus
            className="approval-editor"
            onChange={(event) => setDraft(event.target.value)}
            rows={5}
            value={draft}
          />
        ) : (
          <p className="approval-text">{approval.proposed_text}</p>
        )}
      </div>

      {editing ? (
        <div className="approval-actions">
          <AIPolishButton onPolished={(text) => setDraft(text)} text={draft} />
          <div className="approval-actions-right">
            <button className="secondary-button approval-btn" disabled={busy} onClick={onCancelEdit} type="button">
              <RotateCcw size={15} /> Cancel
            </button>
            <button className="primary-button approval-btn" disabled={busy || !draft.trim()} onClick={() => onSaveEdit(draft)} type="button">
              <Check size={15} /> Send edited draft
            </button>
          </div>
        </div>
      ) : (
        <div className="approval-actions">
          <button className="secondary-button approval-btn" disabled={busy} onClick={onStartEdit} type="button">
            <Pencil size={15} /> Edit Draft
          </button>
          <div className="approval-actions-right">
            <button className="secondary-button approval-btn approval-btn--danger" disabled={busy} onClick={() => onReject(approval.id || approval._id)} type="button">
              <X size={15} /> Reject
            </button>
            <button className="primary-button approval-btn" disabled={busy} onClick={() => onApprove(approval.id || approval._id)} type="button">
              <Check size={15} /> {busy ? 'Sending…' : 'Approve & Send'}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}