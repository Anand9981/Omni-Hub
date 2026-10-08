import { Check, Clock3, FileEdit, X } from 'lucide-react';

const STATUS_META = {
  DRAFT: { label: 'Draft', icon: FileEdit, tone: 'draft' },
  PENDING: { label: 'Pending review', icon: Clock3, tone: 'pending' },
  APPROVED: { label: 'Approved', icon: Check, tone: 'approved' },
  REJECTED: { label: 'Rejected', icon: X, tone: 'rejected' },
};

export default function TemplateStatusBadge({ status = 'DRAFT' }) {
  const meta = STATUS_META[status] || STATUS_META.DRAFT;
  const Icon = meta.icon;
  return <span className={`template-status template-status--${meta.tone}`}><Icon size={13} />{meta.label}</span>;
}
