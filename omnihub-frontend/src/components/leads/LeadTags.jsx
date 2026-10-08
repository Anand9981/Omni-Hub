import { Plus, X } from 'lucide-react';
import { useState } from 'react';

export const SUGGESTED_LEAD_TAGS = ['#HOT_LEAD', '#PRICING_INQUIRY', '#SETUP_ISSUE', '#DEMO_REQUEST', '#VIP'];

export default function LeadTags({ tags = [], onChange, readOnly = false, suggestions = false, compact = false }) {
  const [value, setValue] = useState('');
  const normalizedTags = [...new Set(tags)];

  const addTag = (raw) => {
    const tag = `#${String(raw).trim().replace(/^#+/, '').replace(/\s+/g, '_').toUpperCase()}`;
    if (tag.length > 1 && !normalizedTags.includes(tag)) onChange?.([...normalizedTags, tag]);
    setValue('');
  };

  const removeTag = (tag) => onChange?.(normalizedTags.filter((item) => item !== tag));
  const availableSuggestions = SUGGESTED_LEAD_TAGS.filter((tag) => !normalizedTags.includes(tag));

  return (
    <div className={`lead-tags-editor${compact ? ' lead-tags-editor--compact' : ''}`}>
      <div className="lead-tags-list">
        {normalizedTags.length ? normalizedTags.map((tag) => (
          <span className={`lead-chip${tag === '#VIP' || tag === '#HOT_LEAD' ? ' lead-chip--priority' : ''}`} key={tag}>
            {tag}
            {!readOnly && <button aria-label={`Remove ${tag}`} onClick={() => removeTag(tag)} type="button"><X size={11} /></button>}
          </span>
        )) : <span className="lead-tags-none">No tags yet</span>}
      </div>
      {!readOnly && (
        <>
          {suggestions && availableSuggestions.length > 0 && (
            <div className="lead-tag-suggestions">
              {availableSuggestions.slice(0, 4).map((tag) => (
                <button key={tag} onClick={() => addTag(tag)} type="button">+ {tag}</button>
              ))}
            </div>
          )}
          <form className="lead-tag-entry" onSubmit={(event) => { event.preventDefault(); addTag(value); }}>
            <input aria-label="Add a lead tag" maxLength={30} onChange={(event) => setValue(event.target.value)} placeholder="Add a tag…" value={value} />
            <button aria-label="Add tag" disabled={!value.trim()} type="submit"><Plus size={14} /></button>
          </form>
        </>
      )}
    </div>
  );
}
