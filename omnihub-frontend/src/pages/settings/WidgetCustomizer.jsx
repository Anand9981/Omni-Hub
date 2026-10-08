import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Clipboard, Code2, Eye, MessageCircle, RotateCcw, Save, ShieldCheck, Volume2, VolumeX, WandSparkles } from 'lucide-react';
import ChatWidget from '../../components/widget/ChatWidget.jsx';
import { widgetService, WIDGET_LANGUAGES, WIDGET_POSITIONS, WIDGET_SIZES } from '../../services/widgetService.js';
import { authService } from '../../services/authDemoService.js';
import { canManageApprovals } from '../../utils/permissions.js';
import { businessHoursService } from '../../services/businessHoursService.js';

function snapshotBusinessHours(settings) {
  return {
    timezone: settings.timezone,
    weeklySchedule: settings.weeklySchedule,
    holidays: settings.holidays,
    specialHours: settings.specialHours,
    holidayMode: settings.holidayMode,
  };
}

function makeEmbedCode(config) {
  const options = {
    apiKey: config.apiKey,
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    textColor: config.textColor,
    position: config.position,
    size: config.size,
    language: config.language,
    welcomeMessage: config.welcomeMessage,
    offlineMessage: config.offlineMessage,
    avatarUrl: config.avatarUrl,
    soundNotification: config.soundNotification,
    offlineMode: config.offlineMode,
    businessHours: config.businessHours,
  };
  return `<script>window.OmniHubConfig = ${JSON.stringify(options)};</script>\n<script src="${window.location.origin}/widget.js" async></script>`;
}

function formatDuration(total, completed) {
  if (!completed) return '0 sec';
  const seconds = Math.round(total / completed);
  return seconds < 60 ? `${seconds} sec` : `${Math.floor(seconds / 60)} min ${seconds % 60} sec`;
}

export default function WidgetCustomizer() {
  const [config, setConfig] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('design');
  const canManage = canManageApprovals(authService.getCurrentUser()?.role);

  useEffect(() => {
    if (!canManage) {
      setLoading(false);
      return;
    }
    try {
      setConfig({
        ...widgetService.getConfig(),
        businessHours: snapshotBusinessHours(businessHoursService.getSettings()),
      });
      setAnalytics(widgetService.getAnalytics());
    } catch (loadError) {
      setError(loadError.message || 'Widget settings could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [canManage]);

  const code = useMemo(() => config ? makeEmbedCode(config) : '', [config]);
  const update = (field, value) => {
    setConfig((current) => ({ ...current, [field]: value }));
    setSaved(false);
    setCopied(false);
    setError('');
  };

  const save = (event) => {
    event?.preventDefault();
    if (!config) return;
    setError('');
    setSaved(false);
    try {
      const next = widgetService.saveConfig(config);
      setConfig(next);
      setAnalytics(widgetService.getAnalytics());
      setSaved(true);
    } catch (saveError) {
      setError(saveError.message || 'Widget settings could not be saved.');
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setError('');
    } catch (copyError) {
      setError(copyError.message || 'Clipboard access was denied. Select and copy the embed code manually.');
    }
  };

  const rotateKey = () => {
    if (!window.confirm('Rotate the widget API key? Existing website embeds will stop working until they are updated.')) return;
    try {
      setConfig(widgetService.rotateApiKey(config));
      setSaved(true);
      setCopied(false);
      setError('');
    } catch (keyError) {
      setError(keyError.message || 'The widget key could not be rotated.');
    }
  };

  if (!canManage) return <div className="alert alert--error" role="alert">Only workspace admins can configure the website widget.</div>;
  if (loading) return <div className="widget-customizer-loading" role="status">Loading widget settings…</div>;
  if (!config) return <div className="alert alert--error" role="alert">{error || 'Widget settings could not be loaded.'}</div>;

  const stats = analytics || { opens: 0, messages: 0, leads: 0, totalSessionSeconds: 0, completedSessions: 0 };

  return (
    <div className="widget-customizer-page">
      <header className="widget-customizer-hero">
        <div className="widget-customizer-hero-copy">
          <span><WandSparkles size={13} /> WEBSITE EXPERIENCE</span>
          <h1>A welcome that feels<br /><em>like your brand.</em></h1>
          <p>Customize your support widget, preview it live, and embed it on your website with one small script.</p>
        </div>
        <div className="widget-customizer-hero-art" aria-hidden="true"><MessageCircle size={34} /><i /><i /><i /></div>
      </header>

      <div className="widget-analytics-strip" aria-label="Local widget analytics">
        <div><span>Widget opens</span><strong>{stats.opens.toLocaleString()}</strong></div>
        <div><span>Messages sent</span><strong>{stats.messages.toLocaleString()}</strong></div>
        <div><span>Lead conversions</span><strong>{stats.leads.toLocaleString()}</strong></div>
        <div><span>Avg. session</span><strong>{formatDuration(stats.totalSessionSeconds, stats.completedSessions)}</strong></div>
        <small>Browser-local demo metrics</small>
      </div>

      {error && <div className="widget-customizer-error" role="alert">{error}</div>}

      <div className="widget-customizer-workspace">
        <div className="widget-customizer-editor">
          <div className="widget-customizer-tabs" role="tablist" aria-label="Widget settings sections">
            <button aria-selected={activeTab === 'design'} className={activeTab === 'design' ? 'is-active' : ''} onClick={() => setActiveTab('design')} role="tab" type="button"><WandSparkles size={14} /> Design</button>
            <button aria-selected={activeTab === 'behavior'} className={activeTab === 'behavior' ? 'is-active' : ''} onClick={() => setActiveTab('behavior')} role="tab" type="button"><ShieldCheck size={14} /> Behavior</button>
            <button aria-selected={activeTab === 'embed'} className={activeTab === 'embed' ? 'is-active' : ''} onClick={() => setActiveTab('embed')} role="tab" type="button"><Code2 size={14} /> Install</button>
          </div>

          {activeTab === 'design' && (
            <section className="widget-settings-card" role="tabpanel">
              <header><strong>Brand & layout</strong><small>Make the chat bubble feel native to your site.</small></header>
              <div className="widget-color-grid">
                {[['primaryColor', 'Primary'], ['secondaryColor', 'Secondary'], ['textColor', 'Text']].map(([key, label]) => (
                  <label className="widget-color-field" key={key}><span>{label}</span><span><input aria-label={`${label} color`} onChange={(event) => update(key, event.target.value)} type="color" value={config[key]} />{config[key]}</span></label>
                ))}
              </div>
              <div className="widget-field-pair">
                <label>Position<select onChange={(event) => update('position', event.target.value)} value={config.position}>{WIDGET_POSITIONS.map((position) => <option key={position.id} value={position.id}>{position.label}</option>)}</select></label>
                <label>Widget size<select onChange={(event) => update('size', event.target.value)} value={config.size}>{WIDGET_SIZES.map((size) => <option key={size.id} value={size.id}>{size.label}</option>)}</select></label>
              </div>
              <label>Chat language<select onChange={(event) => update('language', event.target.value)} value={config.language}>{WIDGET_LANGUAGES.map((language) => <option key={language} value={language}>{language}</option>)}</select></label>
              <label>Welcome message<input maxLength={180} onChange={(event) => update('welcomeMessage', event.target.value)} value={config.welcomeMessage} /></label>
              <label>Agent avatar <small>Optional public HTTPS image URL</small><input onChange={(event) => update('avatarUrl', event.target.value)} placeholder="https://example.com/agent.jpg" value={config.avatarUrl} /></label>
            </section>
          )}

          {activeTab === 'behavior' && (
            <section className="widget-settings-card" role="tabpanel">
              <header><strong>Conversation behavior</strong><small>Set what visitors see when your team is unavailable.</small></header>
              <label>Offline message<textarea maxLength={240} onChange={(event) => update('offlineMessage', event.target.value)} rows={3} value={config.offlineMessage} /></label>
              <button aria-pressed={config.offlineMode} className={`widget-setting-toggle${config.offlineMode ? ' is-enabled' : ''}`} onClick={() => update('offlineMode', !config.offlineMode)} type="button">
                <span><strong>Offline mode</strong><small>Show the leave-a-message experience in the widget.</small></span><i>{config.offlineMode ? 'On' : 'Off'}</i>
              </button>
              <button aria-pressed={config.soundNotification} className={`widget-setting-toggle${config.soundNotification ? ' is-enabled' : ''}`} onClick={() => update('soundNotification', !config.soundNotification)} type="button">
                <span>{config.soundNotification ? <Volume2 size={15} /> : <VolumeX size={15} />}<strong>Sound notification</strong><small>Play a subtle tone when the demo assistant replies.</small></span><i>{config.soundNotification ? 'On' : 'Off'}</i>
              </button>
              <div className="widget-settings-notice"><ShieldCheck size={15} /> Outside-hours messages use your local schedule snapshot. Live agent availability and routing need a backend; this switch forces offline mode for previews.</div>
              <div className="widget-hours-source"><span><ShieldCheck size={14} /> Outside-hours behavior follows your workspace schedule.</span><Link to="/business-hours">Manage business hours</Link></div>
            </section>
          )}

          {activeTab === 'embed' && (
            <section className="widget-settings-card widget-embed-card" role="tabpanel">
              <header><strong>Install on your website</strong><small>Paste this snippet just before your closing <code>&lt;/body&gt;</code> tag.</small></header>
              <div className="widget-api-key-row"><span><ShieldCheck size={14} /> Public widget key</span><code>{config.apiKey}</code><button onClick={rotateKey} type="button"><RotateCcw size={13} /> Rotate key</button></div>
              <label>Embed code<textarea aria-label="Widget embed code" readOnly rows={8} value={code} /></label>
              <button className="widget-copy-button" onClick={copyCode} type="button">{copied ? <Check size={15} /> : <Clipboard size={15} />}{copied ? 'Copied to clipboard' : 'Copy embed code'}</button>
              <div className="widget-settings-notice"><Code2 size={15} /> The embed uses a sandboxed cross-origin iframe. API key and appearance config are public widget settings, not secret credentials.</div>
            </section>
          )}
        </div>

        <aside className="widget-live-preview">
          <header><span><Eye size={14} /> LIVE PREVIEW</span><small>Changes appear instantly</small></header>
          <div className={`widget-preview-stage widget-preview-${config.position}`}>
            <div className="widget-preview-sitebar"><span /><span /><span /></div>
            <div className="widget-preview-sitecopy"><i /><i /><i /><b /></div>
            <div className="widget-preview-sitecard"><span /><i /><i /></div>
            <ChatWidget initialConfig={config} preview />
          </div>
          <div className="widget-preview-foot"><span /> {config.offlineMode || (config.businessHours && !widgetService.isWithinBusinessHours(config.businessHours)) ? 'Offline experience' : 'Online experience'}<span className="widget-preview-foot-size">{config.size} · {config.language}</span></div>
        </aside>
      </div>

      <footer className="widget-customizer-savebar">
        <span>{saved ? <><Check size={15} /> Widget settings saved in this browser</> : 'Embed code follows your current preview. Save to keep changes for your next visit.'}</span>
        <button className="primary-button" onClick={save} type="button"><Save size={15} /> {saved ? 'Saved' : 'Save widget'}</button>
      </footer>
    </div>
  );
}
