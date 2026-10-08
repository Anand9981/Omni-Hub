const STATUS_TONES = {
  New: 'new',
  Contacted: 'contacted',
  Qualified: 'qualified',
  Converted: 'converted',
  Lost: 'lost',
};

export default function LeadStatusBadge({ status = 'New' }) {
  return <span className={`lead-status-badge lead-status-badge--${STATUS_TONES[status] || 'new'}`}>{status}</span>;
}
