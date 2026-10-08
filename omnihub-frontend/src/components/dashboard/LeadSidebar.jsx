import { Building2, Mail, Phone, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import LeadStatusBadge from '../leads/LeadStatusBadge.jsx';
import LeadTags from '../leads/LeadTags.jsx';
import { LEAD_STATUS } from '../../utils/constants.js';

const STATUSES = Object.values(LEAD_STATUS);

export default function LeadSidebar({ conversation, lead, onUpdate, readOnly = false }) {
  const name = lead?.full_name || conversation?.sender_name || 'Unknown contact';
  const leadUrl = lead?.id ? `/leads?lead=${encodeURIComponent(lead.id)}` : '/leads';

  if (!conversation) return <div className="empty-state">Select a conversation to see customer details.</div>;

  return (
    <div className="lead-sidebar-content">
      <div className="lead-sidebar-profile">
        <span className="lead-sidebar-avatar">{name.charAt(0).toUpperCase()}</span>
        <div className="lead-sidebar-identity">
          <strong>{name}</strong>
          <small>{lead?.company || conversation.platform}</small>
        </div>
        <Link aria-label={`Open ${name} in leads`} className="lead-sidebar-open" to={leadUrl}><Building2 size={14} /></Link>
      </div>
      <div className="lead-sidebar-status">
        <span>Pipeline status</span>
        {readOnly ? <LeadStatusBadge status={lead?.status || 'New'} /> : (
          <select aria-label="Lead status" onChange={(event) => onUpdate?.({ status: event.target.value })} value={lead?.status || 'New'}>
            {STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
        )}
      </div>
      <dl className="lead-sidebar-fields">
        <div><dt><UserRound size={14} /> Contact name</dt><dd>{name}</dd></div>
        <div><dt><Phone size={14} /> Phone</dt><dd>{lead?.phone_number || conversation.sender_phone || 'Not shared yet'}</dd></div>
        <div><dt><Mail size={14} /> Email</dt><dd className="is-breakable">{lead?.email_address || conversation.sender_email || 'Not shared yet'}</dd></div>
        <div><dt><Building2 size={14} /> Platform ID</dt><dd className="is-breakable">{conversation.external_chat_id || '—'}</dd></div>
      </dl>
      <div className="lead-sidebar-tags">
        <span className="lead-sidebar-section-title">Lead tags</span>
        <LeadTags onChange={(lead_tags) => onUpdate?.({ lead_tags })} readOnly={readOnly} suggestions={!readOnly} tags={lead?.lead_tags || []} />
      </div>
    </div>
  );
}
