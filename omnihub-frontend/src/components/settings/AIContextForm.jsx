import { useEffect, useState } from 'react';
import { BookOpenText, Check, CircleAlert, Link2, Save, ShieldCheck, Sparkles } from 'lucide-react';
import { aiService } from '../../services/aiService.js';

const TONES = [
  'Professional, friendly, and helpful',
  'Warm and conversational',
  'Concise and direct',
];

export default function AIContextForm() {
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setContext(aiService.getContext());
    } catch (loadError) {
      setError(loadError.message || 'AI context could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  const update = (field, value) => {
    setContext((current) => ({ ...current, [field]: value }));
    setSaved(false);
    setError('');
  };

  async function save(event) {
    event.preventDefault();
    if (!context || saving) return;
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      setContext(aiService.saveContext(context));
      setSaved(true);
    } catch (saveError) {
      setError(saveError.message || 'AI context could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="ai-context-loading" role="status">Loading AI context…</div>;
  if (!context) return <div className="ai-context-alert" role="alert">{error || 'AI context could not be loaded.'}</div>;

  return (
    <form className="ai-context-page" onSubmit={save}>
      <header className="ai-context-hero">
        <div className="ai-context-hero-copy">
          <span className="ai-context-eyebrow"><Sparkles size={13} /> AI WORKSPACE SETTINGS</span>
          <h1>Helpful replies,<br /><em>grounded in your business.</em></h1>
          <p>Give the assistant approved facts and resources to use—never guessed pricing, promises, or made-up details.</p>
        </div>
        <div className="ai-context-hero-mark" aria-hidden="true">
          <span><BookOpenText size={28} /></span>
          <small>BUSINESS<br />KNOWLEDGE</small>
        </div>
      </header>

      {error && <div className="ai-context-alert" role="alert"><CircleAlert size={15} /> {error}</div>}

      <div className="ai-context-layout">
        <div className="ai-context-fields">
          <section className="ai-context-card">
            <header><span>01</span><div><strong>Business identity</strong><small>Set the name and response style the assistant should use.</small></div></header>
            <label>Business name
              <input maxLength={100} onChange={(event) => update('businessName', event.target.value)} placeholder="e.g. Northstar Studio" required value={context.businessName} />
            </label>
            <label>Response tone
              <select onChange={(event) => update('tone', event.target.value)} value={context.tone}>
                {TONES.map((tone) => <option key={tone} value={tone}>{tone}</option>)}
              </select>
            </label>
          </section>

          <section className="ai-context-card">
            <header><span>02</span><div><strong>Approved knowledge</strong><small>Only include facts that are safe to share with customers.</small></div></header>
            <label>Services offered <small>One service per line</small>
              <textarea maxLength={2000} onChange={(event) => update('services', event.target.value)} placeholder={'Shared inbox setup\nCustomer support automation'} rows={4} value={context.services} />
            </label>
            <label>Business hours
              <input maxLength={500} onChange={(event) => update('workingHours', event.target.value)} placeholder="e.g. Monday–Saturday, 10:00 AM–7:00 PM" value={context.workingHours} />
            </label>
            <label>Pricing information <small>Leave blank if pricing should not be quoted</small>
              <textarea maxLength={1000} onChange={(event) => update('pricing', event.target.value)} placeholder="Approved price ranges or a note to request a custom quote" rows={3} value={context.pricing} />
            </label>
            <label>Resource links <small>One secure HTTPS link per line</small>
              <textarea maxLength={2000} onChange={(event) => update('assetLinks', event.target.value)} placeholder={'https://example.com/setup-guide\nhttps://example.com/product-catalog'} rows={3} value={context.assetLinks} />
            </label>
          </section>
        </div>

        <aside className="ai-context-aside">
          <section className="ai-context-guardrail">
            <span><ShieldCheck size={17} /> TRUST & SAFETY</span>
            <h2>Facts, not fiction.</h2>
            <ul>
              <li>Unconfigured pricing is never invented.</li>
              <li>Unknown questions receive a clear team follow-up message.</li>
              <li>Replies are limited to three sentences.</li>
              <li>A human reviews polished drafts before sending.</li>
            </ul>
            <div><Link2 size={14} /> Only HTTPS resource links can be saved.</div>
          </section>
          <div className="ai-context-demo-note">
            <strong>Local demo mode</strong>
            <span>No AI provider is connected. Context and preferences are saved only in this browser; real Gemini generation requires a backend.</span>
          </div>
        </aside>
      </div>

      <footer className="ai-context-savebar">
        <span>{saved ? <><Check size={15} /> Saved in this browser</> : 'Business context stays private to this browser demo.'}</span>
        <button className="primary-button" disabled={saving} type="submit"><Save size={15} /> {saving ? 'Saving…' : saved ? 'Saved' : 'Save AI context'}</button>
      </footer>
    </form>
  );
}
