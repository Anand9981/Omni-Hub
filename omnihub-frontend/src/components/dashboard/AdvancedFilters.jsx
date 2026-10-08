import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronDown, ListFilter, RotateCcw, X } from 'lucide-react';
import { CHANNEL_LIST } from '../../utils/constants.js';

const SORT_OPTIONS = [
  ['latest', 'Latest first'],
  ['oldest', 'Oldest first'],
  ['mostMessages', 'Most messages'],
  ['longestPending', 'Longest pending'],
  ['priority', 'Priority'],
];

export default function AdvancedFilters({ filters, conversations, onChange, onReset }) {
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [panelPosition, setPanelPosition] = useState({ left: 12, top: 12 });
  const tags = useMemo(() => [...new Set(conversations.flatMap((item) => item.lead?.lead_tags || []))].sort(), [conversations]);
  const activeCount = [
    filters.onlyUnread,
    filters.onlyPending,
    filters.onlyHuman,
    filters.platform !== 'all',
    filters.status !== 'all',
    filters.tag !== 'all',
    filters.language !== 'all',
    filters.fromDate,
    filters.toDate,
    filters.assignedToMe,
    filters.onlyUnassigned,
    filters.hasMedia,
    filters.hasLead,
  ].filter(Boolean).length;

  useLayoutEffect(() => {
    if (!expanded) return undefined;
    function positionPanel() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(348, window.innerWidth - 24);
      const height = panelRef.current?.offsetHeight || 360;
      const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
      const below = rect.bottom + height + 8 <= window.innerHeight - 12;
      const top = below ? rect.bottom + 8 : Math.max(12, rect.top - height - 8);
      setPanelPosition({ left, top });
    }
    positionPanel();
    window.addEventListener('resize', positionPanel);
    window.addEventListener('scroll', positionPanel, true);
    return () => {
      window.removeEventListener('resize', positionPanel);
      window.removeEventListener('scroll', positionPanel, true);
    };
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return undefined;
    function closeOnOutsideClick(event) {
      if (!rootRef.current?.contains(event.target) && !panelRef.current?.contains(event.target)) setExpanded(false);
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setExpanded(false);
    }
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [expanded]);

  return (
    <div className="inbox-advanced" ref={rootRef}>
      <button
        aria-expanded={expanded}
        className={`inbox-advanced-trigger${expanded ? ' is-open' : ''}`}
        onClick={() => setExpanded((open) => !open)}
        ref={triggerRef}
        type="button"
      >
        <ListFilter size={14} /> Filters {activeCount > 0 && <span>{activeCount}</span>} <ChevronDown size={13} />
      </button>
      <label className="inbox-sort">
        <span>Sort</span>
        <select aria-label="Sort conversations" onChange={(event) => onChange({ sort: event.target.value })} value={filters.sort}>
          {SORT_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      {expanded && createPortal(
        <div className="inbox-advanced-panel" ref={panelRef} style={{ ...panelPosition, position: 'fixed', bottom: 'auto' }}>
          <header className="inbox-filter-panel-head">
            <div><strong>Advanced filters</strong><small>Refine your inbox with a few details.</small></div>
            <button aria-label="Close filters" onClick={() => setExpanded(false)} type="button"><X size={14} /></button>
          </header>
          <div className="inbox-filter-section">
            <span className="inbox-filter-label">CHANNEL</span>
            <div className="inbox-filter-options inbox-filter-options--channels">
              <button className={filters.platform === 'all' ? 'is-active' : ''} onClick={() => onChange({ platform: 'all' })} type="button">All channels</button>
              {CHANNEL_LIST.map((channel) => <button className={filters.platform === channel.id ? 'is-active' : ''} key={channel.id} onClick={() => onChange({ platform: channel.id })} type="button">{channel.label}</button>)}
            </div>
          </div>
          <div className="inbox-filter-fields">
            <label><span>MESSAGE STATUS</span><select aria-label="Message status" onChange={(event) => onChange({ status: event.target.value })} value={filters.status}><option value="all">Any status</option><option value="pending">Pending</option><option value="sent">Sent</option><option value="failed">Failed</option></select></label>
            <label><span>LEAD TAG</span><select aria-label="Lead tag" onChange={(event) => onChange({ tag: event.target.value })} value={filters.tag}><option value="all">Any tag</option>{tags.map((tag) => <option key={tag}>{tag}</option>)}</select></label>
            <label><span>LANGUAGE</span><select aria-label="Conversation language" onChange={(event) => onChange({ language: event.target.value })} value={filters.language}><option value="all">Any language</option><option>English</option><option>Hindi</option><option>Hinglish</option></select></label>
            <div className="inbox-filter-date">
              <span><CalendarDays size={12} /> ACTIVITY DATE</span>
              <div><input aria-label="Activity from date" onChange={(event) => onChange({ fromDate: event.target.value })} type="date" value={filters.fromDate} /><span>to</span><input aria-label="Activity to date" onChange={(event) => onChange({ toDate: event.target.value })} type="date" value={filters.toDate} /></div>
            </div>
          </div>
          <div className="inbox-filter-checks">
            {[
              ['assignedToMe', 'Assigned to me'],
              ['onlyUnassigned', 'Unassigned'],
              ['hasMedia', 'Has media'],
              ['hasLead', 'Has lead'],
            ].map(([key, label]) => <label key={key}><input checked={filters[key]} onChange={(event) => onChange({ [key]: event.target.checked })} type="checkbox" />{label}</label>)}
          </div>
          <button className="inbox-filter-reset" onClick={onReset} type="button"><RotateCcw size={12} /> Clear all filters</button>
        </div>,
        document.body,
      )}
    </div>
  );
}
