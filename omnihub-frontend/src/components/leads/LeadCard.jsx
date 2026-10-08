import { ArrowUpRight, Mail, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChannelBadge from '../dashboard/ChannelBadge.jsx';
import LeadStatusBadge from './LeadStatusBadge.jsx';
import LeadTags from './LeadTags.jsx';
import { LEAD_STATUS } from '../../utils/constants.js';

const STATUSES = Object.values(LEAD_STATUS);

export default function LeadCard({ lead, onStatusChange, onTagsChange, readOnly = false, highlighted = false }) {
  const initial = (lead.full_name || '?').trim().charAt(0).toUpperCase();
  return (
    <article className={`lead-directory-card${highlighted ? ' is-highlighted' : ''}`}>
      <div className="lead-directory-card-top">
        <span className="lead-directory-avatar">{initial}</span>
        <div className="lead-directory-identity">
          <strong>{lead.full_name}</strong>
          <span>{lead.email_address || 'Email not captured'}</span>
        </div>
        <ChannelBadge platform={lead.platform} size="sm" withLabel={false} />
      </div>
      <div className="lead-card-contact">
        <span><Mail size={13} />{lead.email_address || 'Not shared'}</span>
        <span><Phone size={13} />{lead.phone_number || 'Not shared'}</span>
      </div>
      <div className="lead-card-status-row">
        <span>LEAD STATUS</span>
        {readOnly ? <LeadStatusBadge status={lead.status} /> : (
          <select aria-label={`Status for ${lead.full_name}`} onChange={(event) => onStatusChange(lead.id, event.target.value)} value={lead.status}>
            {STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
        )}
      </div>
      <div className="lead-card-tags">
        <span className="lead-card-label">TAGS</span>
        <LeadTags compact onChange={(tags) => onTagsChange(lead.id, tags)} readOnly={readOnly} tags={lead.lead_tags || []} />
      </div>
      <div className="lead-card-footer">
        <span><MessageCircle size={13} />{lead.unread ? `${lead.unread} unread` : 'Conversation'} · {lead.platform}</span>
        <Link aria-label={`Open conversation with ${lead.full_name}`} to={`/dashboard/${lead.conversation_id}`}>Open thread <ArrowUpRight size={14} /></Link>
      </div>
    </article>
  );
}
