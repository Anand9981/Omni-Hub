import { ArrowUpRight, CheckCircle2, Clock3, Inbox, ShieldQuestion } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ApprovalCard from '../../components/dashboard/ApprovalCard.jsx';
import {
  approveDraft,
  clearNotice,
  loadApprovals,
  rejectDraft,
  saveDraftEdit,
  startEditing,
  stopEditing,
} from '../../store/approvalSlice.js';
import { loadConversations } from '../../store/conversationSlice.js';
import { loadMessages } from '../../store/messageSlice.js';

/**
 * PRD 9.2 - the pending approval queue.
 *
 * Nothing here is sent automatically: every row is either approved, edited then
 * sent, or rejected. That gate is the whole point of Human-in-the-Loop.
 */
export default function Approvals() {
  const dispatch = useDispatch();
  const { pending, resolved, editingId, busyId, notice, error, status } = useSelector((state) => state.approvals);

  useEffect(() => {
    dispatch(loadApprovals());
  }, [dispatch]);

  const stats = useMemo(() => {
    if (!pending.length) return { count: 0, oldest: 0, channels: 0 };
    return {
      count: pending.length,
      oldest: Math.max(...pending.map((item) => item.waitingMinutes)),
      channels: new Set(pending.map((item) => item.platform)).size,
    };
  }, [pending]);

  /** After a decision the inbox badge and thread history must reflect it. */
  function refreshAfter(conversationId) {
    dispatch(loadConversations());
    if (conversationId) dispatch(loadMessages(conversationId));
  }

  function handleApprove(approvalId) {
    const target = pending.find((item) => item.id === approvalId);
    dispatch(approveDraft({ approvalId })).then(() => refreshAfter(target?.conversation_id));
  }

  function handleReject(approvalId) {
    const target = pending.find((item) => item.id === approvalId);
    dispatch(rejectDraft({ approvalId })).then(() => refreshAfter(target?.conversation_id));
  }

  function handleSaveEdit(approvalId, text) {
    const target = pending.find((item) => item.id === approvalId);
    dispatch(approveDraft({ approvalId, text })).then(() => refreshAfter(target?.conversation_id));
  }

  return (
    <div className="approvals-page">
      <section className="approvals-hero">
        <div className="approvals-hero-copy">
          <span className="approvals-hero-eyebrow"><ShieldQuestion size={13} /> HUMAN-IN-THE-LOOP</span>
          <h2>Every reply,<br /><span>with your approval.</span></h2>
          <p>Review AI drafts, add your voice, and make sure every customer conversation feels considered.</p>
          <Link className="approvals-hero-link" to="/dashboard">Open conversations <ArrowUpRight size={14} /></Link>
        </div>
        <div className="approvals-hero-focus" aria-label={`${stats.count} drafts are awaiting review`}>
          <span className="approvals-focus-orbit approvals-focus-orbit--outer" />
          <span className="approvals-focus-orbit approvals-focus-orbit--inner" />
          <span className="approvals-focus-count">{String(stats.count).padStart(2, '0')}</span>
          <span className="approvals-focus-label">DRAFTS TO REVIEW</span>
          <span className="approvals-focus-ring" />
          <span className="approvals-focus-spark" />
        </div>
      </section>

      <div className="approval-stats">
        <div className="approval-stat">
          <span className="approval-stat-icon"><ShieldQuestion size={18} /></span>
          <div><strong>{stats.count}</strong><small>Drafts waiting</small></div>
        </div>
        <div className="approval-stat">
          <span className="approval-stat-icon approval-stat-icon--warn"><Clock3 size={18} /></span>
          <div><strong>{stats.oldest}m</strong><small>Longest wait</small></div>
        </div>
        <div className="approval-stat">
          <span className="approval-stat-icon approval-stat-icon--mint"><CheckCircle2 size={18} /></span>
          <div><strong>{resolved.length}</strong><small>Resolved recently</small></div>
        </div>
        <div className="approval-stat">
          <span className="approval-stat-icon"><Inbox size={18} /></span>
          <div><strong>{stats.channels}</strong><small>Channels affected</small></div>
        </div>
      </div>

      {notice && (
        <div className="alert alert--success" role="status">
          <CheckCircle2 size={16} /> {notice}
          <button className="alert-dismiss" onClick={() => dispatch(clearNotice())} type="button">Dismiss</button>
        </div>
      )}

      {error && <div className="alert alert--error" role="alert">{error}</div>}

      <div className="approval-list">
        {status === 'loading' && !pending.length && <div className="empty-state">Loading the approval queue…</div>}

        {status !== 'loading' && !pending.length && (
          <div className="empty-state empty-state--tall">
            <CheckCircle2 size={26} />
            <strong>Queue is clear.</strong>
            Every held draft has been reviewed. New drafts appear here the moment
            Auto-Pilot proposes a reply while approval mode is on.
          </div>
        )}

        {pending.map((approval) => (
          <ApprovalCard
            approval={approval}
            busy={busyId === approval.id}
            editing={editingId === approval.id}
            key={approval.id}
            onApprove={handleApprove}
            onCancelEdit={() => dispatch(stopEditing())}
            onReject={handleReject}
            onSaveEdit={(text) => handleSaveEdit(approval.id, text)}
            onStartEdit={() => dispatch(startEditing(approval.id))}
          />
        ))}
      </div>

      {resolved.length > 0 && (
        <section className="approval-history">
          <h3 className="lead-block-title">Recently resolved</h3>
          {resolved.map((item) => (
            <div className="approval-history-row" key={item.id}>
              <span className="approval-history-name">{item.lead?.full_name || item.conversation?.sender_name}</span>
              <span className="approval-history-text">{item.proposed_text.slice(0, 90)}…</span>
              <span className={`tag ${item.status === 'REJECTED' ? 'tag--danger' : 'tag--ok'}`}>{item.status}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}