import { Check, Edit3, Layers3, MessageSquareDashed, Radio, RotateCcw, ShieldQuestion, Sparkles, UserRound, X, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { APPROVAL_MODE } from '../../utils/constants.js';
import AIPolishButton from './AIPolishButton.jsx';
import AutoPilotToggle from './AutoPilotToggle.jsx';
import ChannelBadge from './ChannelBadge.jsx';
import ChatBubble from './ChatBubble.jsx';
import MessageInput from './MessageInput.jsx';
import AssignAgentModal from './AssignAgentModal.jsx';
import MenuBuilder from './MenuBuilder.jsx';
import AISummarizeModal from './AISummarizeModal.jsx';

/**
 * PRD 9.1 - center panel: the live conversation.
 * PRD 9.2 - inline action controls: Send, Approve, Edit, Reject
 * PRD 9.3 - Polish with AI
 * PRD 9.4 - Auto-Pilot per-conversation toggle
 */
export default function CenterPanel({
  conversation,
  canApprove = true,
  messages,
  sending,
  typing,
  onSend,
  onSendMenu,
  onMenuButton,
  menuActionError,
  onClearMenuActionError,
  onRetryMessage,
  retryingMessageId,
  retryError,
  retryErrorMessageId,
  onToggleAutoPilot,
  onChangeApprovalMode,
  onSimulate,
  onApproveDraft,
  onRejectDraft,
  onSaveDraftEdit,
  socketMode,
  readOnly = false,
  canAssign = true,
  agents = [],
  assignmentLoading = false,
  assignmentError = null,
  onAssignAgent,
  onAutoAssignAgent,
  onClearAgentError,
}) {
  const scrollRef = useRef(null);
  const [editingDraft, setEditingDraft] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [menuBuilderOpen, setMenuBuilderOpen] = useState(false);
  const [summarizeOpen, setSummarizeOpen] = useState(false);

  useEffect(() => {
    if (conversation?.heldDraft) {
      setDraftText(conversation.heldDraft.proposed_text || '');
      setEditingDraft(false);
    }
  }, [conversation?.heldDraft?.id, conversation?.heldDraft?.proposed_text]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = conversation?.heldDraft ? 0 : node.scrollHeight;
  }, [messages.length, conversation?.id, conversation?.heldDraft?.id, typing]);

  if (!conversation) {
    return (
      <section className="panel panel--center" aria-label="Conversation">
        <div className="empty-state empty-state--tall">
          <MessageSquareDashed size={26} />
          Pick a conversation from the inbox to open it here.
        </div>
      </section>
    );
  }

  const manual = conversation.approval_mode === APPROVAL_MODE.MANUAL;
  const autoPilotOff = conversation.auto_pilot === 'OFF';

  return (
    <section className="panel panel--center" aria-label="Conversation">
      <header className="thread-head">
        <div className="thread-head-main">
          <div className="thread-who">
            <span className="thread-avatar">{(conversation.sender_name || '?').charAt(0).toUpperCase()}</span>
            <div className="thread-who-copy">
              <strong>{conversation.sender_name}</strong>
              <span className="thread-sub">
                <ChannelBadge platform={conversation.platform} size="sm" />
                <span>{conversation.external_chat_id}</span>
                {conversation.sentiment && (
                  <span className="ai-head-badge" title={`Sentiment: ${conversation.sentiment}`}>
                    {conversation.sentiment}
                  </span>
                )}
                {conversation.intent && (
                  <span className="ai-head-badge ai-head-badge--intent" title={`Intent: ${conversation.intent}`}>
                    {conversation.intent}
                  </span>
                )}
              </span>
            </div>
          </div>

          {canAssign && (
            <div className="thread-assignee">
              {conversation.assigned_agent_id ? (
                <>
                  <span className="thread-assignee-avatar">
                    {(agents.find((agent) => agent.id === conversation.assigned_agent_id)?.name || 'A').split(' ').map((part) => part[0]).slice(0, 2).join('')}
                  </span>
                  <span className="thread-assignee-copy">
                    <small>ASSIGNED TO</small>
                    <strong>{agents.find((agent) => agent.id === conversation.assigned_agent_id)?.name || 'Agent'}</strong>
                  </span>
                </>
              ) : <span className="thread-assignee-unassigned">Unassigned</span>}
              <button
                className="thread-assign-button"
                onClick={() => { onClearAgentError?.(); setAssignOpen(true); }}
                type="button"
              >
                <UserRound size={14} /> Assign
              </button>
            </div>
          )}
        </div>

        {!readOnly && <div className="thread-controls">
          <button
            type="button"
            className="ai-summary-header-btn"
            onClick={() => setSummarizeOpen(true)}
            title="Auto-Summarize Conversation with Gemini AI"
          >
            <Sparkles size={14} className="sparkle-anim" />
            <span>AI Summary</span>
          </button>

          <div className="approval-switch" role="group" aria-label="Approval mode">
            <button
              className={manual ? '' : 'is-active'}
              onClick={() => onChangeApprovalMode(APPROVAL_MODE.AUTO)}
              title="AI responses sent automatically"
              type="button"
            >
              <Zap size={14} /> Auto-send
            </button>
            <button
              className={manual ? 'is-active' : ''}
              onClick={() => onChangeApprovalMode(APPROVAL_MODE.MANUAL)}
              title="Hold AI drafts for approval"
              type="button"
            >
              <ShieldQuestion size={14} /> Hold for approval
            </button>
          </div>

          <AutoPilotToggle
            compact
            enabled={!autoPilotOff}
            onChange={(next) => onToggleAutoPilot(next)}
          />

          <button className="simulate-button" onClick={onSimulate} title={`Transport: ${socketMode}`} type="button">
            <Radio size={14} /> Simulate inbound
          </button>
          {canApprove && <button className="menu-studio-trigger" onClick={() => setMenuBuilderOpen(true)} type="button">
            <Layers3 size={14} /> Menu studio
          </button>}
        </div>}
      </header>

      {menuBuilderOpen && (
        <MenuBuilder
          initialPlatform={conversation.platform}
          onClose={() => setMenuBuilderOpen(false)}
          onSendMenu={onSendMenu}
        />
      )}

      {manual && (
        <div className="thread-banner thread-banner--warn">
          <ShieldQuestion size={15} />
          AI replies are held for your review before sending.
        </div>
      )}

      {autoPilotOff && (
        <div className="thread-banner">
          <Radio size={15} />
          Auto-Pilot is OFF — Human takeover active. Automated triggers are paused for this thread.
        </div>
      )}

      {menuActionError && (
        <div className="thread-banner thread-banner--warn menu-action-error" role="alert">
          <span>{menuActionError}</span>
          <button aria-label="Dismiss menu action error" onClick={onClearMenuActionError} type="button"><X size={14} /></button>
        </div>
      )}

      {assignOpen && (
        <AssignAgentModal
          agents={agents}
          currentAgentId={conversation.assigned_agent_id}
          error={assignmentError}
          loading={assignmentLoading}
          onAssign={(agentId) => onAssignAgent?.(agentId).then(() => setAssignOpen(false)).catch(() => {})}
          onAutoAssign={(strategy) => onAutoAssignAgent?.(strategy).then(() => setAssignOpen(false)).catch(() => {})}
          onClose={() => setAssignOpen(false)}
        />
      )}

      {/* PRD 9.1 & 9.2: Center Panel Inline Approval Controls */}
      <div className="thread-scroll" ref={scrollRef}>
      {conversation.heldDraft && (
        <div className="thread-approval-box">
          <div className="thread-approval-header">
            <div className="thread-approval-title">
              <ShieldQuestion size={16} />
              <strong>AI Draft Held for Approval</strong>
              <span className="approval-source-badge">{conversation.heldDraft.source || 'AI proposed reply'}</span>
            </div>
            <span className="thread-approval-sub">
              Review, edit, or reject before customer delivery
            </span>
          </div>

          {!canApprove ? (
            <div className="thread-approval-content">
              <p className="thread-approval-quote">“{conversation.heldDraft.proposed_text}”</p>
              <span className="thread-approval-sub">Only an Admin can review this draft.</span>
            </div>
          ) : editingDraft ? (
            <div className="thread-approval-edit">
              <textarea
                aria-label="Edit proposed AI draft"
                className="thread-approval-textarea"
                onChange={(e) => setDraftText(e.target.value)}
                rows={3}
                value={draftText}
              />
              <div className="thread-approval-actions">
                <AIPolishButton
                  onPolished={(text) => setDraftText(text)}
                  text={draftText}
                />
                <div className="thread-approval-actions-right">
                  <button
                    className="secondary-button approval-btn"
                    onClick={() => {
                      setDraftText(conversation.heldDraft.proposed_text || '');
                      setEditingDraft(false);
                    }}
                    type="button"
                  >
                    <RotateCcw size={14} /> Cancel
                  </button>
                  <button
                    className="primary-button approval-btn"
                    disabled={!draftText.trim()}
                    onClick={() => {
                      onSaveDraftEdit?.(conversation.heldDraft.id, draftText.trim());
                      setEditingDraft(false);
                    }}
                    type="button"
                  >
                    <Check size={14} /> Send edited draft
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="thread-approval-content">
              <p className="thread-approval-quote">“{conversation.heldDraft.proposed_text}”</p>
              <div className="thread-approval-actions">
                <button
                  className="secondary-button approval-btn"
                  onClick={() => setEditingDraft(true)}
                  type="button"
                >
                  <Edit3 size={14} /> Edit Draft
                </button>
                <div className="thread-approval-actions-right">
                  <button
                    className="secondary-button approval-btn approval-btn--danger"
                    onClick={() => onRejectDraft?.(conversation.heldDraft.id)}
                    type="button"
                  >
                    <X size={14} /> Reject
                  </button>
                  <button
                    className="primary-button approval-btn"
                    onClick={() => onApproveDraft?.(conversation.heldDraft.id)}
                    type="button"
                  >
                    <Check size={14} /> Approve & Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

        {messages.length === 0
          ? <div className="empty-state">No messages in this conversation yet.</div>
          : messages.map((message) => <ChatBubble
            customerEmail={conversation.sender_email}
            customerPhone={conversation.sender_phone}
            key={message.id}
            message={message}
            onButtonAction={onMenuButton}
            onRetry={onRetryMessage}
            platform={conversation.platform}
            retrying={retryingMessageId === message.id}
            retryErrorMessageId={retryErrorMessageId}
            retryError={retryingMessageId === message.id ? retryError : null}
          />)}

        {typing && (
          <div className="chat-row">
            <div className="chat-bubble chat-bubble--in chat-bubble--typing">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      <MessageInput
        businessName={conversation.lead?.company}
        conversationId={conversation.id}
        conversation={conversation}
        messages={messages}
        customerName={conversation.lead?.full_name || conversation.sender_name}
        disabled={autoPilotOff && readOnly}
        onSend={onSend}
        platform={conversation.platform}
        readOnly={readOnly}
        sending={sending}
      />

      <AISummarizeModal
        isOpen={summarizeOpen}
        onClose={() => setSummarizeOpen(false)}
        conversation={conversation}
        messages={messages}
      />
    </section>
  );
}