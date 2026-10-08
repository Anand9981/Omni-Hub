import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Check, Clock3, Globe2, MessageCircleMore, Save, ShieldCheck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import BusinessHoursForm from '../../components/settings/BusinessHoursForm.jsx';
import AwayMessageForm from '../../components/settings/AwayMessageForm.jsx';
import HolidayModeToggle from '../../components/settings/HolidayModeToggle.jsx';
import { authService } from '../../services/authDemoService.js';
import { clearBusinessHoursError, loadBusinessHours, saveBusinessHours } from '../../store/businessHoursSlice.js';
import { isReadOnly } from '../../utils/permissions.js';

export default function BusinessHours() {
  const dispatch = useDispatch();
  const { settings, status, saving, error, savedAt } = useSelector((state) => state.businessHours);
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState(false);
  const readOnly = isReadOnly(authService.getCurrentUser()?.role);

  useEffect(() => { dispatch(loadBusinessHours()); }, [dispatch]);
  useEffect(() => { if (settings && !draft) setDraft(structuredClone(settings)); }, [draft, settings]);

  const scheduleSummary = useMemo(() => {
    if (!draft) return { openDays: 0, shifts: 0 };
    return {
      openDays: draft.weeklySchedule.filter((day) => day.enabled).length,
      shifts: draft.weeklySchedule.reduce((total, day) => total + day.shifts.length, 0),
    };
  }, [draft]);

  async function handleSave() {
    if (!draft || saving) return;
    setSaved(false);
    dispatch(clearBusinessHoursError());
    try {
      const updated = await dispatch(saveBusinessHours(draft)).unwrap();
      setDraft(structuredClone(updated));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3500);
    } catch {
      // The rejected thunk exposes its validation/storage message in the page alert.
    }
  }

  if (status === 'loading' || (status === 'idle' && !draft)) {
    return <div className="business-hours-loading" role="status">Loading availability settings…</div>;
  }
  if (!draft) {
    return <div className="alert alert--error hours-page-alert" role="alert">{error || 'Business hours could not be loaded. Refresh to try again.'}</div>;
  }

  return (
    <div className="business-hours-page">
      <header className="business-hours-hero">
        <div className="business-hours-hero-copy">
          <span className="hours-eyebrow"><span /> WORKSPACE SETTINGS</span>
          <h1>Be there when<br /><em>it matters.</em></h1>
          <p>Shape your team’s availability, set clear expectations, and make every off-hours moment feel considered.</p>
          <div className="hours-hero-timezone"><Globe2 size={15} /><span>{draft.timezone}</span><span className="hours-timezone-separator">·</span><span>Times shown in workspace local time</span></div>
        </div>
        <div className="hours-hero-orb" aria-hidden="true">
          <span className="hours-orb-ring hours-orb-ring--one" />
          <span className="hours-orb-ring hours-orb-ring--two" />
          <span className="hours-orb-center"><Clock3 size={28} /></span>
          <span className="hours-orb-label">AVAILABILITY<br />WITH INTENTION</span>
        </div>
        <div className="hours-hero-stats">
          <div><strong>{scheduleSummary.openDays}<small>/7</small></strong><span>Days available</span></div>
          <div><strong>{scheduleSummary.shifts}</strong><span>Weekly shifts</span></div>
          <div><strong>{draft.holidays.length + draft.specialHours.length}</strong><span>Calendar exceptions</span></div>
        </div>
      </header>

      {error && <div className="alert alert--error hours-page-alert" role="alert">{error}</div>}
      {status === 'error' && !error && <div className="alert alert--error hours-page-alert" role="alert">Business hours could not be loaded. Refresh to try again.</div>}

      <div className="business-hours-content">
        <div className="hours-main-column">
          <BusinessHoursForm onChange={setDraft} value={draft} />
          <AwayMessageForm onChange={(awayMessage) => setDraft({ ...draft, awayMessage })} value={draft.awayMessage} />
        </div>
        <aside className="hours-aside">
          <HolidayModeToggle onChange={(holidayMode) => setDraft({ ...draft, holidayMode })} value={draft.holidayMode} />
          <section className="hours-preview-card">
            <span className="hours-preview-kicker"><MessageCircleMore size={14} /> CUSTOMER EXPERIENCE</span>
            <h3>When you’re away,<br />they’re still cared for.</h3>
            <p>{draft.holidayMode.enabled ? draft.holidayMode.message : draft.awayMessage.messages[draft.awayMessage.language]}</p>
            <div className="hours-preview-footer"><ShieldCheck size={14} /> {draft.holidayMode.enabled ? 'Holiday reply active' : draft.awayMessage.enabled ? 'Automatic reply enabled' : 'Automatic reply paused'}</div>
            <ArrowUpRight className="hours-preview-arrow" size={18} />
          </section>
        </aside>
      </div>

      {!readOnly && (
        <div className="hours-save-bar">
          <div className="hours-save-status">
            {saved ? <><Check size={16} /> Changes saved to this browser</>
              : savedAt ? `Last saved ${new Date(savedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                : 'Changes apply to your local demo workspace'}
          </div>
          <button className="hours-save-button" disabled={saving} onClick={handleSave} type="button">
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
          </button>
        </div>
      )}
      {readOnly && <div className="hours-readonly-note">You have view-only access to workspace availability settings.</div>}
    </div>
  );
}
