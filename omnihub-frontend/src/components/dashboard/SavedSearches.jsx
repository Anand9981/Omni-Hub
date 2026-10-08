import { useState } from 'react';
import { BookmarkPlus, Copy, Plus, Trash2, X } from 'lucide-react';

function hasFilters(filters) {
  return Boolean(
    filters.query
    || filters.platform !== 'all'
    || filters.status !== 'all'
    || filters.tag !== 'all'
    || filters.language !== 'all'
    || filters.fromDate
    || filters.toDate
    || filters.onlyUnread
    || filters.onlyPending
    || filters.onlyHuman
    || filters.onlyUnassigned
    || filters.assignedToMe
    || filters.hasMedia
    || filters.hasLead
    || filters.sort !== 'latest',
  );
}

export default function SavedSearches({ filters, searches, onApply, onSave, onDelete }) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState('');

  async function shareSearch(search) {
    const url = new URL(window.location.href);
    url.searchParams.set('filters', JSON.stringify(search.filters));
    try {
      await navigator.clipboard.writeText(url.toString());
      setFeedback(`Link copied: ${search.name}`);
    } catch (error) {
      console.error('Could not copy the saved search link.', error);
      setFeedback('Clipboard access was denied. Copy the URL from your address bar after applying the search.');
    }
  }

  async function save(event) {
    event.preventDefault();
    const result = await onSave(name, filters);
    if (result) {
      setName('');
      setSaving(false);
    }
  }

  return (
    <section aria-label="Saved searches" className="saved-searches">
      <div className="saved-searches-heading">
        <span><BookmarkPlus size={13} /> SAVED VIEWS</span>
        <button aria-label="Save current search" onClick={() => { setFeedback(''); setSaving((open) => !open); }} type="button"><Plus size={13} /></button>
      </div>
      {saving && (
        <form className="saved-search-form" onSubmit={save}>
          <input autoFocus aria-label="Saved search name" maxLength={40} onChange={(event) => setName(event.target.value)} placeholder="Name this search…" value={name} />
          <button aria-label="Save search" disabled={!name.trim()} type="submit">Save</button>
          <button aria-label="Cancel save" onClick={() => setSaving(false)} type="button"><X size={13} /></button>
        </form>
      )}
      {searches.length > 0 ? (
        <div className="saved-search-list">
          {searches.map((search) => (
            <div className="saved-search-item" key={search.id}>
              <button className="saved-search-name" onClick={() => { onApply(search.filters); setFeedback(''); }} title={`Apply ${search.name}`} type="button"><span>{search.name}</span><small>{hasFilters(search.filters) ? 'Filtered view' : 'All conversations'}</small></button>
              <button aria-label={`Copy link to ${search.name}`} className="saved-search-action" onClick={() => shareSearch(search)} title="Copy shareable link" type="button"><Copy size={12} /></button>
              <button aria-label={`Delete ${search.name}`} className="saved-search-action saved-search-delete" onClick={() => onDelete(search.id)} title="Delete saved search" type="button"><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      ) : <p className="saved-search-empty">Save a filtered view for one-click access.</p>}
      {feedback && <p className="saved-search-feedback" role="status">{feedback}</p>}
    </section>
  );
}
