import { CalendarClock, Palmtree } from 'lucide-react';

export default function HolidayModeToggle({ value, onChange }) {
  const update = (changes) => onChange({ ...value, ...changes });
  return (
    <section className={`hours-card holiday-mode-card${value.enabled ? ' is-enabled' : ''}`}>
      <header className="hours-card-head">
        <span className="hours-card-icon hours-card-icon--gold"><Palmtree size={18} /></span>
        <div><h3>Holiday mode</h3><p>Pause normal availability and use a holiday-specific reply.</p></div>
        <label className="hours-switch hours-switch--holiday">
          <input checked={value.enabled} onChange={(event) => update({ enabled: event.target.checked })} type="checkbox" />
          <span>{value.enabled ? 'On holiday' : 'Off'}</span>
        </label>
      </header>
      <div className="holiday-mode-fields">
        <label className="hours-input-label"><span><CalendarClock size={13} /> Start date</span><input onChange={(event) => update({ startDate: event.target.value })} type="date" value={value.startDate} /></label>
        <label className="hours-input-label"><span><CalendarClock size={13} /> Resume date</span><input onChange={(event) => update({ endDate: event.target.value })} type="date" value={value.endDate} /></label>
      </div>
      <label className="hours-input-label holiday-message-label"><span>Holiday auto-reply</span><textarea maxLength={500} onChange={(event) => update({ message: event.target.value })} rows={3} value={value.message} /></label>
      <label className="holiday-auto-resume"><input checked={value.autoResume} onChange={(event) => update({ autoResume: event.target.checked })} type="checkbox" /><span><strong>Automatically resume regular hours</strong><small>Turn holiday mode off after the resume date.</small></span></label>
    </section>
  );
}
