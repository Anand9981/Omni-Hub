import { Clock3, CornerDownLeft, Search, Star, Zap } from 'lucide-react';

function relativeUsed(response) {
  if (!response.lastUsedAt) return `${response.usageCount} uses`;
  const minutes = Math.round((Date.now() - new Date(response.lastUsedAt).getTime()) / 60000);
  if (minutes < 1) return 'just used';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}

export default function QuickReplyMenu({
  responses,
  query = '',
  mode = 'recent',
  selectedIndex = 0,
  error,
  onModeChange,
  onSelect,
  onClose,
}) {
  const needle = query.replace(/^\//, '').trim().toLowerCase();
  const matching = responses.filter((response) => {
    if (mode === 'favorites' && !response.favorite) return false;
    if (needle && ![
      response.title,
      response.shortcut,
      response.category,
      response.language,
      response.content,
    ].some((value) => value.toLowerCase().includes(needle))) return false;
    return true;
  }).sort((a, b) => mode === 'recent'
    ? new Date(b.lastUsedAt || 0) - new Date(a.lastUsedAt || 0) || b.usageCount - a.usageCount
    : Number(b.favorite) - Number(a.favorite) || b.usageCount - a.usageCount);

  return (
    <section aria-label="Quick replies" className="quick-reply-menu" onKeyDown={(event) => event.stopPropagation()}>
      <header className="quick-reply-head">
        <div><span className="quick-reply-mark"><Zap size={14} /></span><span><strong>Quick replies</strong><small>Personalized, ready to send</small></span></div>
        <button aria-label="Close quick replies" className="quick-reply-close" onClick={onClose} type="button">Esc</button>
      </header>
      <div className="quick-reply-tabs" role="group" aria-label="Quick reply view">
        <button aria-pressed={mode === 'recent'} className={mode === 'recent' ? 'is-active' : ''} onClick={() => onModeChange('recent')} type="button"><Clock3 size={12} /> Recent</button>
        <button aria-pressed={mode === 'favorites'} className={mode === 'favorites' ? 'is-active' : ''} onClick={() => onModeChange('favorites')} type="button"><Star size={12} /> Favorites</button>
        {needle && <span className="quick-reply-query"><Search size={11} /> /{needle}</span>}
      </div>
      {error && <p className="quick-reply-error" role="alert">{error}</p>}
      <div className="quick-reply-results">
        {matching.length ? matching.map((response, index) => (
          <button
            aria-label={`Insert ${response.title}, shortcut ${response.shortcut}`}
            className={`quick-reply-option${index === selectedIndex ? ' is-selected' : ''}`}
            key={response.id}
            onClick={() => onSelect(response)}
            type="button"
          >
            <span className="quick-reply-option-icon"><Zap size={13} /></span>
            <span className="quick-reply-option-copy"><strong>{response.title}</strong><small>{response.content}</small><span className="quick-reply-option-meta">{response.category} <i /> {response.language} <i /> {relativeUsed(response)}</span></span>
            <span className="quick-reply-shortcut">{response.shortcut}</span>
            {response.favorite && <Star className="quick-reply-favorite" fill="currentColor" size={12} />}
          </button>
        )) : (
          <div className="quick-reply-empty"><Search size={17} /><strong>No matching replies</strong><small>Try a shortcut, category or phrase.</small></div>
        )}
      </div>
      <footer className="quick-reply-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> insert</span><span>Ctrl+1–9 favorites</span></footer>
    </section>
  );
}
