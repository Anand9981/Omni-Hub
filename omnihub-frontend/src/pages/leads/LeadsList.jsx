import { useEffect, useMemo, useState } from 'react';
import { ArrowDownWideNarrow, ArrowUpRight, Download, Search, UsersRound } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import LeadCard from '../../components/leads/LeadCard.jsx';
import { clearLeadError, loadLeads, updateLead } from '../../store/leadSlice.js';
import { loadAgents } from '../../store/agentSlice.js';
import { authService } from '../../services/authDemoService.js';
import { isReadOnly } from '../../utils/permissions.js';
import { LEAD_STATUS } from '../../utils/constants.js';

const STATUS_FILTERS = ['All leads', ...Object.values(LEAD_STATUS)];

function downloadCsv(leads) {
  const columns = ['Name', 'Email', 'Phone', 'Status', 'Tags', 'Channel', 'Last message'];
  const rows = leads.map((lead) => [
    lead.full_name,
    lead.email_address,
    lead.phone_number,
    lead.status,
    (lead.lead_tags || []).join(' '),
    lead.platform,
    lead.last_message?.text_content || '',
  ]);
  const csv = [columns, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `omnihub-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function LeadsList() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { items: leads, status, error } = useSelector((state) => state.leads);
  const { currentAgentId } = useSelector((state) => state.agents);
  const [statusFilter, setStatusFilter] = useState('All leads');
  const [search, setSearch] = useState('');
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [sort, setSort] = useState('recent');
  const user = authService.getCurrentUser();
  const readOnly = isReadOnly(user?.role);
  const scoped = user?.role === 'Agent';

  useEffect(() => {
    dispatch(loadLeads());
    if (scoped) dispatch(loadAgents(user));
  }, [dispatch, scoped, user?.email, user?.name, user?.role]);

  useEffect(() => {
    const requestedLead = searchParams.get('lead');
    const lead = requestedLead && leads.find((item) => item.id === requestedLead);
    if (lead) setSearch(lead.full_name);
  }, [leads.length, searchParams]);

  const workspaceLeads = scoped
    ? leads.filter((lead) => lead.assigned_agent_id === currentAgentId)
    : leads;

  const counts = useMemo(() => workspaceLeads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {}), [workspaceLeads]);

  const visibleLeads = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return workspaceLeads.filter((lead) => {
      if (statusFilter !== 'All leads' && lead.status !== statusFilter) return false;
      if (priorityOnly && !(lead.lead_tags || []).some((tag) => ['#HOT_LEAD', '#VIP'].includes(tag))) return false;
      if (!needle) return true;
      return [lead.full_name, lead.email_address, lead.phone_number, lead.platform, ...(lead.lead_tags || [])]
        .some((value) => String(value || '').toLowerCase().includes(needle));
    }).sort((a, b) => sort === 'name'
      ? a.full_name.localeCompare(b.full_name)
      : new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
  }, [workspaceLeads, priorityOnly, search, sort, statusFilter]);

  const qualified = (counts.Qualified || 0) + (counts.Converted || 0);
  const priority = workspaceLeads.filter((lead) => (lead.lead_tags || []).some((tag) => ['#HOT_LEAD', '#VIP'].includes(tag))).length;
  const waitingForAgentProfile = scoped && !currentAgentId && status !== 'error';
  const onStatusChange = (leadId, value) => dispatch(updateLead({ leadId, updates: { status: value } }));
  const onTagsChange = (leadId, value) => dispatch(updateLead({ leadId, updates: { lead_tags: value } }));

  return (
    <div className="leads-page">
      <section className="leads-hero">
        <div className="leads-hero-copy">
          <span className="leads-eyebrow"><UsersRound size={14} /> CUSTOMER RELATIONSHIPS</span>
          <h2>Know every<br /><span>conversation behind the lead.</span></h2>
          <p>One considered view of your customers, captured details and next best follow-up—across every channel.</p>
          <Link className="leads-hero-link" to="/dashboard">Back to conversations <ArrowUpRight size={14} /></Link>
        </div>
        <div aria-label={`${workspaceLeads.length} customer profiles`} className="leads-hero-visual">
          <span className="leads-hero-orbit leads-hero-orbit--outer" />
          <span className="leads-hero-orbit leads-hero-orbit--inner" />
          <span className="leads-hero-count">{String(workspaceLeads.length).padStart(2, '0')}</span>
          <span className="leads-hero-label">CUSTOMER PROFILES</span>
          <span className="leads-hero-spark" />
        </div>
      </section>

      <div className="leads-kpis">
        <article className="leads-kpi"><span className="leads-kpi-icon"><UsersRound size={17} /></span><div><small>Total profiles</small><strong>{workspaceLeads.length}</strong></div><span className="leads-kpi-caption">Across all channels</span></article>
        <article className="leads-kpi"><span className="leads-kpi-icon leads-kpi-icon--blue">◉</span><div><small>Qualified pipeline</small><strong>{qualified}</strong></div><span className="leads-kpi-caption">Qualified + converted</span></article>
        <article className="leads-kpi"><span className="leads-kpi-icon leads-kpi-icon--amber">✦</span><div><small>Priority leads</small><strong>{priority}</strong></div><span className="leads-kpi-caption">Hot lead or VIP</span></article>
        <article className="leads-kpi"><span className="leads-kpi-icon leads-kpi-icon--mint">✓</span><div><small>Converted</small><strong>{counts.Converted || 0}</strong></div><span className="leads-kpi-caption">Marked won</span></article>
      </div>

      <section className="leads-directory">
        <header className="leads-directory-head">
          <div><span className="leads-section-kicker">LEAD INTELLIGENCE</span><h3>Your customers <span>{visibleLeads.length}</span></h3><p>Lead details update from incoming messages and your team’s edits.</p></div>
          <div className="leads-directory-actions">
            <label className="leads-search"><Search size={16} /><input aria-label="Search leads" onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, tag…" value={search} /></label>
            <button className="leads-export-button" disabled={!leads.length} onClick={() => downloadCsv(visibleLeads)} type="button"><Download size={14} /> Export CSV</button>
          </div>
        </header>
        <div className="leads-filter-toolbar">
          <div className="leads-status-tabs" role="group" aria-label="Filter leads by pipeline status">
            {STATUS_FILTERS.map((filter) => (
              <button aria-pressed={statusFilter === filter} className={statusFilter === filter ? 'is-active' : ''} key={filter} onClick={() => setStatusFilter(filter)} type="button">
                {filter}<span>{filter === 'All leads' ? workspaceLeads.length : counts[filter] || 0}</span>
              </button>
            ))}
          </div>
          <div className="leads-extra-filters">
            <button aria-pressed={priorityOnly} className={`leads-priority-filter${priorityOnly ? ' is-active' : ''}`} onClick={() => setPriorityOnly(!priorityOnly)} type="button">✦ Priority</button>
            <label className="leads-sort"><ArrowDownWideNarrow size={14} /><select aria-label="Sort leads" onChange={(event) => setSort(event.target.value)} value={sort}><option value="recent">Recent activity</option><option value="name">Name A–Z</option></select></label>
          </div>
        </div>
        {error && <div className="alert alert--error" role="alert">{error}<button className="alert-dismiss" onClick={() => dispatch(clearLeadError())} type="button">Dismiss</button></div>}
        {(status === 'loading' && !leads.length) || waitingForAgentProfile
          ? <div className="empty-state">Loading customer profiles…</div>
          : null}
        {status !== 'loading' && visibleLeads.length === 0 && <div className="leads-empty"><span><UsersRound size={22} /></span><strong>No leads match this view.</strong><small>Try another status or clear the search to see more customer records.</small></div>}
        <div className="leads-card-grid">
          {visibleLeads.map((lead) => (
            <LeadCard
              highlighted={searchParams.get('lead') === lead.id}
              key={lead.id}
              lead={lead}
              onStatusChange={onStatusChange}
              onTagsChange={onTagsChange}
              readOnly={readOnly}
            />
          ))}
        </div>
        <footer className="leads-directory-foot"><span>Showing {visibleLeads.length} of {workspaceLeads.length} leads</span><span>Profile data is stored in this browser demo</span></footer>
      </section>
    </div>
  );
}
