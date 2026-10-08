import { Languages, MessageSquareText } from 'lucide-react';
import { AWAY_MESSAGE_LANGUAGES } from '../../services/businessHoursService.js';

export default function AwayMessageForm({ value, onChange }) {
  const update = (changes) => onChange({ ...value, ...changes });
  return (
    <section className="hours-card">
      <header className="hours-card-head">
        <span className="hours-card-icon hours-card-icon--violet"><MessageSquareText size={18} /></span>
        <div><h3>Away message</h3><p>Set expectations when customers reach you outside staffed hours.</p></div>
        <label className="hours-switch">
          <input checked={value.enabled} onChange={(event) => update({ enabled: event.target.checked })} type="checkbox" />
          <span>{value.enabled ? 'Enabled' : 'Disabled'}</span>
        </label>
      </header>
      <div className="away-language-tabs" aria-label="Away message language">
        {AWAY_MESSAGE_LANGUAGES.map((language) => (
          <button aria-pressed={value.language === language} className={value.language === language ? 'is-active' : ''} key={language} onClick={() => update({ language })} type="button">
            <Languages size={13} /> {language}
          </button>
        ))}
      </div>
      <label className="hours-input-label">
        <span>{value.language} auto-reply</span>
        <textarea maxLength={500} onChange={(event) => update({ messages: { ...value.messages, [value.language]: event.target.value } })} rows={4} value={value.messages[value.language] || ''} />
        <small>{(value.messages[value.language] || '').length}/500 · This message is sent only outside business hours.</small>
      </label>
      <div className="away-detail-grid">
        <label className="hours-input-label"><span>Expected response time</span><input maxLength={100} onChange={(event) => update({ expectedResponse: event.target.value })} placeholder="e.g. within 24 hours" value={value.expectedResponse} /></label>
        <label className="hours-input-label"><span>Emergency contact <em>Optional</em></span><input maxLength={100} onChange={(event) => update({ emergencyContact: event.target.value })} placeholder="Phone, email or URL" value={value.emergencyContact} /></label>
      </div>
    </section>
  );
}
