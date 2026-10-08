import AutoPilotToggle from './AutoPilotToggle.jsx';
import ChannelBadge from './ChannelBadge.jsx';
import LeadSidebar from './LeadSidebar.jsx';
import NotesList from '../notes/NotesList.jsx';

const CHANNEL_SOURCE = {
  telegram: 'Telegram Bot API',
  discord: 'Discord Gateway',
  whatsapp: 'WhatsApp Cloud API',
  instagram: 'Instagram Graph API',
  linkedin: 'LinkedIn Messaging',
  webchat: 'Website widget (Socket.io)',
};

/**
 * PRD 9.1 / 10 / 16 - right panel: Lead CRM details, Auto-Pilot toggle,
 * customer tags, and internal notes.
 */
export default function RightPanel({
  conversation,
  lead,
  leadError,
  messageCount,
  notes = [],
  noteError,
  agents = [],
  currentAgentId,
  noteNotifications = [],
  onToggleAutoPilot,
  onAddNote,
  onDeleteNote,
  onUpdateLead,
  readOnly = false,
}) {
  if (!conversation) {
    return (
      <section className="panel panel--right" aria-label="Lead details">
        <div className="panel-head"><h2 className="panel-title">Lead details</h2></div>
        <div className="empty-state">Select a conversation to see customer details.</div>
      </section>
    );
  }

  return (
    <section className="panel panel--right" aria-label="Lead details">
      <div className="panel-head">
        <h2 className="panel-title">Lead details</h2>
        <ChannelBadge platform={conversation.platform} size="sm" />
      </div>

      <LeadSidebar conversation={conversation} lead={lead} onUpdate={onUpdateLead} readOnly={readOnly} />
      {leadError && <div className="alert alert--error lead-sidebar-error" role="alert">{leadError}</div>}

      {/* PRD 9.1: Interactive Auto-Pilot Switch in Right Panel */}
      {!readOnly && <div className="lead-control-box">
        <span className="lead-block-title">Automation Control</span>
        <AutoPilotToggle
          enabled={conversation.auto_pilot === 'ON'}
          onChange={(enabled) => onToggleAutoPilot?.(enabled)}
        />
      </div>}

      <NotesList
        agents={agents}
        currentAgentId={currentAgentId}
        error={noteError}
        notes={notes}
        notifications={noteNotifications}
        onAddNote={onAddNote}
        onDeleteNote={onDeleteNote}
        readOnly={readOnly}
      />

      <div className="lead-meta">
        <span className="lead-block-title">Conversation Overview</span>
        <div><span>Channel</span><strong>{CHANNEL_SOURCE[conversation.platform] || conversation.platform}</strong></div>
        <div><span>Messages</span><strong>{messageCount}</strong></div>
        <div><span>Auto-Pilot</span><strong>{conversation.auto_pilot === 'ON' ? 'Enabled' : 'Human takeover'}</strong></div>
        <div><span>Approval mode</span><strong>{conversation.approval_mode === 'MANUAL' ? 'Manual' : 'Auto-approve'}</strong></div>
        <div><span>Opened</span><strong>{new Date(conversation.created_at).toLocaleString()}</strong></div>
      </div>
    </section>
  );
}