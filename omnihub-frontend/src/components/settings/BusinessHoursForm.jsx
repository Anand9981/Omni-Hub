import { CalendarDays, Clock3, Plus, Trash2 } from 'lucide-react';
function updateShift(schedule, dayIndex, shiftIndex, field, value) {
  return schedule.map((day, index) => index !== dayIndex ? day : ({
    ...day,
    shifts: day.shifts.map((shift, itemIndex) => itemIndex === shiftIndex ? { ...shift, [field]: value } : shift),
  }));
}

export default function BusinessHoursForm({ value, onChange }) {
  const updateDay = (dayIndex, updates) => onChange({
    ...value,
    weeklySchedule: value.weeklySchedule.map((day, index) => index === dayIndex ? { ...day, ...updates } : day),
  });

  const addShift = (dayIndex) => {
    const day = value.weeklySchedule[dayIndex];
    const lastEnd = day.shifts.at(-1)?.end || '09:00';
    const [hour, minute] = lastEnd.split(':').map(Number);
    if (hour >= 22) return;
    const start = `${String(hour + 1).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const end = `${String(Math.min(hour + 5, 23)).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    updateDay(dayIndex, { enabled: true, shifts: [...day.shifts, { start, end }] });
  };

  const updateCollection = (key, rows) => onChange({ ...value, [key]: rows });
  const addSpecial = () => updateCollection('specialHours', [
    ...value.specialHours,
    { id: crypto.randomUUID(), date: '', label: '', closed: false, shifts: [{ start: '10:00', end: '19:00' }] },
  ]);
  const addHoliday = () => updateCollection('holidays', [...value.holidays, { id: crypto.randomUUID(), date: '', name: '' }]);

  return (
    <section className="hours-card">
      <header className="hours-card-head">
        <span className="hours-card-icon"><Clock3 size={18} /></span>
        <div><h3>Weekly schedule</h3><p>Set regular availability and split shifts for every day.</p></div>
      </header>
      <label className="hours-timezone-field">
        <span>Workspace time zone</span>
        <select onChange={(event) => onChange({ ...value, timezone: event.target.value })} value={value.timezone}>
          {[...new Set([value.timezone, ...(Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : ['UTC'])])].sort().map((zone) => <option key={zone}>{zone}</option>)}
        </select>
        <small>Auto-detected from this browser; schedule times use this zone.</small>
      </label>
      <div className="hours-week-list">
        {value.weeklySchedule.map((day, dayIndex) => (
          <div className={`hours-day-row${day.enabled ? '' : ' is-closed'}`} key={day.day}>
            <label className="hours-day-toggle">
              <input checked={day.enabled} onChange={(event) => updateDay(dayIndex, {
                enabled: event.target.checked,
                shifts: event.target.checked && !day.shifts.length ? [{ start: '10:00', end: '19:00' }] : day.shifts,
              })} type="checkbox" />
              <strong>{day.day}</strong>
            </label>
            {day.enabled ? (
              <div className="hours-shifts">
                {day.shifts.map((shift, shiftIndex) => (
                  <div className="hours-shift" key={`${day.day}-${shiftIndex}`}>
                    <input aria-label={`${day.day} shift ${shiftIndex + 1} start`} onChange={(event) => onChange({ ...value, weeklySchedule: updateShift(value.weeklySchedule, dayIndex, shiftIndex, 'start', event.target.value) })} type="time" value={shift.start} />
                    <span>to</span>
                    <input aria-label={`${day.day} shift ${shiftIndex + 1} end`} onChange={(event) => onChange({ ...value, weeklySchedule: updateShift(value.weeklySchedule, dayIndex, shiftIndex, 'end', event.target.value) })} type="time" value={shift.end} />
                    {day.shifts.length > 1 && <button aria-label={`Remove ${day.day} shift ${shiftIndex + 1}`} onClick={() => updateDay(dayIndex, { shifts: day.shifts.filter((_, index) => index !== shiftIndex) })} type="button"><Trash2 size={13} /></button>}
                  </div>
                ))}
                <button className="hours-inline-action" disabled={day.shifts.at(-1)?.end >= '22:00'} onClick={() => addShift(dayIndex)} type="button"><Plus size={13} /> Add shift</button>
              </div>
            ) : <span className="hours-closed-label">Closed</span>}
          </div>
        ))}
      </div>
      <div className="hours-exceptions">
        <div className="hours-subsection-head">
          <span className="hours-card-icon hours-card-icon--gold"><CalendarDays size={17} /></span>
          <div><h4>Special hours</h4><p>Override weekly hours for sales, events or one-off dates.</p></div>
          <button className="hours-add-button" onClick={addSpecial} type="button"><Plus size={14} /> Add date</button>
        </div>
        {value.specialHours.length === 0 && <p className="hours-empty-hint">No special hours scheduled.</p>}
        {value.specialHours.map((item) => (
          <div className="hours-exception-row" key={item.id}>
            <input aria-label="Special hours date" onChange={(event) => updateCollection('specialHours', value.specialHours.map((entry) => entry.id === item.id ? { ...entry, date: event.target.value } : entry))} type="date" value={item.date} />
            <input aria-label="Special hours name" onChange={(event) => updateCollection('specialHours', value.specialHours.map((entry) => entry.id === item.id ? { ...entry, label: event.target.value } : entry))} placeholder="e.g. Sale day" value={item.label} />
            <label className="hours-closed-check"><input checked={item.closed} onChange={(event) => updateCollection('specialHours', value.specialHours.map((entry) => entry.id === item.id ? { ...entry, closed: event.target.checked } : entry))} type="checkbox" /> Closed</label>
            {!item.closed && item.shifts.map((shift, shiftIndex) => (
              <div className="hours-shift" key={shiftIndex}>
                <input aria-label="Special hours start" onChange={(event) => updateCollection('specialHours', value.specialHours.map((entry) => entry.id === item.id ? { ...entry, shifts: entry.shifts.map((row, index) => index === shiftIndex ? { ...row, start: event.target.value } : row) } : entry))} type="time" value={shift.start} />
                <span>to</span>
                <input aria-label="Special hours end" onChange={(event) => updateCollection('specialHours', value.specialHours.map((entry) => entry.id === item.id ? { ...entry, shifts: entry.shifts.map((row, index) => index === shiftIndex ? { ...row, end: event.target.value } : row) } : entry))} type="time" value={shift.end} />
              </div>
            ))}
            <button aria-label="Remove special hours" className="hours-remove-button" onClick={() => updateCollection('specialHours', value.specialHours.filter((entry) => entry.id !== item.id))} type="button"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
      <div className="hours-exceptions hours-holidays">
        <div className="hours-subsection-head">
          <span className="hours-card-icon hours-card-icon--rose"><CalendarDays size={17} /></span>
          <div><h4>Holiday calendar</h4><p>Mark dates when your workspace will be unavailable.</p></div>
          <button className="hours-add-button" onClick={addHoliday} type="button"><Plus size={14} /> Add holiday</button>
        </div>
        {value.holidays.length === 0 && <p className="hours-empty-hint">No holidays added yet.</p>}
        {value.holidays.map((holiday) => (
          <div className="hours-holiday-row" key={holiday.id}>
            <input aria-label="Holiday date" onChange={(event) => updateCollection('holidays', value.holidays.map((entry) => entry.id === holiday.id ? { ...entry, date: event.target.value } : entry))} type="date" value={holiday.date} />
            <input aria-label="Holiday name" onChange={(event) => updateCollection('holidays', value.holidays.map((entry) => entry.id === holiday.id ? { ...entry, name: event.target.value } : entry))} placeholder="Holiday name" value={holiday.name} />
            <button aria-label={`Remove ${holiday.name || 'holiday'}`} className="hours-remove-button" onClick={() => updateCollection('holidays', value.holidays.filter((entry) => entry.id !== holiday.id))} type="button"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </section>
  );
}
