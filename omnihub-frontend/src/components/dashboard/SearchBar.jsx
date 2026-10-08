import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="inbox-search inbox-search--premium">
      <Search aria-hidden="true" size={16} />
      <input
        aria-label="Search conversations"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search names, email, phone, messages..."
        type="search"
        value={value}
      />
      {value && (
        <button aria-label="Clear search" className="inbox-search-clear" onClick={() => onChange('')} type="button">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
