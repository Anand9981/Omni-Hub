import { Languages } from 'lucide-react';
import { AI_LANGUAGE_OPTIONS } from '../../services/aiService.js';

export default function LanguageSelector({ value = 'auto', onChange, disabled = false }) {
  return (
    <label className="ai-language-selector">
      <Languages aria-hidden="true" size={14} />
      <span className="sr-only">Polish language</span>
      <select
        aria-label="Polish language"
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        value={value}
      >
        {AI_LANGUAGE_OPTIONS.map((language) => (
          <option key={language.id} value={language.id}>{language.label}</option>
        ))}
      </select>
    </label>
  );
}
