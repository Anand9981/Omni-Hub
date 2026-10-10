import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CircleCheck, Clock3, ExternalLink, Layers3, MailPlus, Rocket, SkipForward, Sparkles, UsersRound } from 'lucide-react';
import HelpTooltip from '../../components/onboarding/HelpTooltip.jsx';
import ProgressBar from '../../components/onboarding/ProgressBar.jsx';
import StepIndicator from '../../components/onboarding/StepIndicator.jsx';
import ChannelConnect from './ChannelConnect.jsx';
import KnowledgeBase from './KnowledgeBase.jsx';
import { onboardingService } from '../../services/onboardingService.js';
import { authService } from '../../services/authDemoService.js';

const STEPS = [
  { id: 'signup', label: 'Create account', shortLabel: 'Account', description: 'Workspace identity' },
  { id: 'verification', label: 'Verify email', shortLabel: 'Verified', description: 'Secure access' },
  { id: 'business', label: 'Business info', shortLabel: 'Business', description: 'Name and working hours' },
  { id: 'channels', label: 'Connect channels', shortLabel: 'Channels', description: 'Choose where customers reach you' },
  { id: 'knowledge', label: 'AI knowledge', shortLabel: 'Knowledge', description: 'Approved business facts' },
  { id: 'menu', label: 'Menu setup', shortLabel: 'Menus', description: 'Guide customer conversations' },
  { id: 'team', label: 'Invite team', shortLabel: 'Team', description: 'Add workspace teammates' },
  { id: 'live', label: 'Go live', shortLabel: 'Launch', description: 'Run your readiness checks' },
];

const TESTS = [
  ['message', 'Test message', 'Send a demo message through a local widget preview.'],
  ['aiReply', 'AI reply check', 'Review the language and business context settings.'],
  ['menu', 'Menu test', 'Walk through the interactive menu preview.'],
  ['approval', 'Approval test', 'Try a held draft and confirm the review flow.'],
  ['analytics', 'Analytics check', 'Open the dashboard analytics overview.'],
];

const INDUSTRIES = ['Retail & ecommerce', 'Professional services', 'Education', 'Healthcare', 'Travel & hospitality', 'Technology', 'Other'];

function onboardingChecklist(progress) {
  return [
    { label: 'Business profile', done: Boolean(progress.business.name.trim()) },
    { label: 'At least one channel ready', done: Object.values(progress.channels).some((channel) => channel.connected) },
    { label: 'Knowledge base started', done: Boolean(progress.knowledge.text.trim() || progress.knowledge.files.length || progress.knowledge.faqs.length || progress.knowledge.websiteUrl.trim()) },
    { label: 'Team invites prepared', done: progress.invitedAgents.length > 0 },
  ];
}

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const stored = onboardingService.getProgress();
      if (stored.status === 'not_started' || stored.status === 'skipped') {
        setProgress(onboardingService.updateProgress({ status: 'in_progress', currentStep: stored.currentStep || 3 }));
      } else {
        setProgress(stored);
      }
      onboardingService.fetchProgress().then((remote) => {
        if (remote) setProgress(remote);
      });
    } catch (loadError) {
      setError(loadError.message || 'Setup progress could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  const save = (updates) => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const next = onboardingService.updateProgress(updates);
      setProgress(next);
      return next;
    } catch (saveError) {
      setError(saveError.message || 'Setup progress could not be saved.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const currentStep = progress?.currentStep || 3;

  const moveTo = (nextStep) => {
    if (!progress || saving) return;
    const saved = save({
      status: 'in_progress',
      currentStep: nextStep,
    });
    if (saved) setNotice('Your setup progress is saved in this browser.');
  };

  const skip = () => {
    try {
      onboardingService.skip();
      navigate('/dashboard', { replace: true });
    } catch (skipError) {
      setError(skipError.message || 'Setup could not be skipped right now.');
    }
  };

  const addAgent = (event) => {
    event.preventDefault();
    const email = agentEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid team member email address.');
      return;
    }
    if (progress.invitedAgents.includes(email)) {
      setError('This team member is already on the invite list.');
      return;
    }
    const next = save({ invitedAgents: [...progress.invitedAgents, email] });
    if (next) setAgentEmail('');
  };

  const complete = () => {
    try {
      onboardingService.finish();
      navigate('/dashboard', { replace: true });
    } catch (finishError) {
      setError(finishError.message || 'The workspace could not be marked ready.');
    }
  };

  const identity = authService.getCurrentUser();
  const checklist = progress ? onboardingChecklist(progress) : [];

  if (loading) return <div className="onboarding-loading" role="status">Loading your setup journey…</div>;
  if (!progress) return <div className="onboarding-page-error" role="alert">{error || 'Setup could not be loaded. Refresh the page to retry.'}</div>;

  return (
    <div className="onboarding-page">
      <header className="onboarding-hero">
        <div className="onboarding-hero-copy">
          <span><Sparkles size={14} /> YOUR OMNIHUB WORKSPACE</span>
          <h1>Let’s get your team<br /><em>ready for every conversation.</em></h1>
          <p>A few guided steps now make it easier to support customers across your channels.</p>
          <div className="onboarding-identity"><span>{identity?.name?.charAt(0) || 'O'}</span><div><strong>{identity?.name || 'Workspace admin'}</strong><small>{identity?.email || 'Signed-in account'} · account and email verification complete</small></div></div>
        </div>
        <div className="onboarding-hero-art" aria-hidden="true"><span><Rocket size={31} /></span><i /><i /><i /></div>
      </header>

      <ProgressBar currentStep={currentStep} totalSteps={STEPS.length} />
      {error && <div className="onboarding-page-error" role="alert">{error}</div>}
      {notice && <div className="onboarding-page-notice" role="status"><Check size={14} />{notice}</div>}

      <div className="onboarding-workspace">
        <aside className="onboarding-step-sidebar">
          <div className="onboarding-side-heading"><strong>Your setup journey</strong><span>Step {currentStep} of {STEPS.length}</span></div>
          <StepIndicator completedSteps={[1, 2]} currentStep={currentStep} steps={STEPS} />
          <div className="onboarding-checklist">
            <span>WORKSPACE CHECKLIST</span>
            {checklist.map((item) => <div key={item.label}><span className={item.done ? 'is-done' : ''}>{item.done ? <Check size={11} /> : <Clock3 size={11} />}</span>{item.label}</div>)}
          </div>
          <div className="onboarding-help-card"><HelpTooltip title="Need a hand?">You can skip setup and return later from the sidebar. Channel credentials are never stored by this browser demo.</HelpTooltip><p>Setup saves automatically when you move between steps.</p></div>
        </aside>

        <main className="onboarding-step-panel">
          {currentStep === 1 && (
            <section className="onboarding-content-step">
              <span className="onboarding-step-eyebrow">STEP 01 · ACCOUNT</span>
              <h2>Your workspace account is ready.</h2>
              <p>You registered with a verified email and can sign in securely. Continue to set up your business profile.</p>
              <div className="onboarding-complete-item"><CircleCheck size={19} /><span><strong>{identity?.email}</strong><small>Account verified for this browser demo</small></span></div>
            </section>
          )}

          {currentStep === 2 && (
            <section className="onboarding-content-step">
              <span className="onboarding-step-eyebrow">STEP 02 · EMAIL VERIFICATION</span>
              <h2>Your email is verified.</h2>
              <p>This signed-in session already completed email verification and the one-time security check.</p>
              <div className="onboarding-complete-item"><CircleCheck size={19} /><span><strong>Verified workspace admin</strong><small>{identity?.email}</small></span></div>
            </section>
          )}

          {currentStep === 3 && (
            <section className="onboarding-content-step">
              <span className="onboarding-step-eyebrow">STEP 03 · BUSINESS PROFILE</span>
              <h2>Tell us about your business.</h2>
              <p>These details help your team and future automations use the right context.</p>
              <div className="onboarding-business-form">
                <label>Business name<input maxLength={100} onChange={(event) => save({ business: { name: event.target.value } })} placeholder="e.g. Northstar Studio" value={progress.business.name} /></label>
                <label>Industry<select onChange={(event) => save({ business: { industry: event.target.value } })} value={progress.business.industry}><option value="">Choose your industry</option>{INDUSTRIES.map((industry) => <option key={industry}>{industry}</option>)}</select></label>
                <label>Business hours<input maxLength={160} onChange={(event) => save({ business: { hours: event.target.value } })} placeholder="e.g. Monday–Saturday, 10 AM–7 PM" value={progress.business.hours} /></label>
                <p>For detailed schedules, holidays and away messages, use <Link to="/business-hours">Business hours settings <ExternalLink size={12} /></Link>.</p>
              </div>
            </section>
          )}

          {currentStep === 4 && (
            <section className="onboarding-content-step">
              <span className="onboarding-step-eyebrow">STEP 04 · CHANNEL CONNECTION</span>
              <h2>Meet your customers where they are.</h2>
              <p>Choose a channel and follow its setup guide. You can connect more channels later.</p>
              <ChannelConnect channels={progress.channels} disabled={saving} onChange={(channels) => save({ channels })} />
            </section>
          )}

          {currentStep === 5 && (
            <section className="onboarding-content-step">
              <span className="onboarding-step-eyebrow">STEP 05 · KNOWLEDGE BASE</span>
              <h2>Give replies a trusted source.</h2>
              <p>Add approved information, FAQs and useful resources for your team.</p>
              <KnowledgeBase disabled={saving} onChange={(knowledge) => save({ knowledge })} value={progress.knowledge} />
            </section>
          )}

          {currentStep === 6 && (
            <section className="onboarding-content-step">
              <span className="onboarding-step-eyebrow">STEP 06 · INTERACTIVE MENU</span>
              <h2>Guide the next conversation.</h2>
              <p>Design nested customer paths, automated replies, and useful media before you go live.</p>
              <div className="onboarding-menu-callout"><span><Layers3 size={20} /></span><div><strong>Interactive Menu Studio</strong><small>Up to three levels, platform-aware button limits and a customer preview.</small></div></div>
              <Link className="onboarding-launch-link" to="/dashboard">Open the dashboard to launch Menu Studio <ArrowRight size={14} /></Link>
              <div className="onboarding-menu-hint"><Check size={13} /> You can skip this step and configure menus later from an admin conversation.</div>
            </section>
          )}

          {currentStep === 7 && (
            <section className="onboarding-content-step">
              <span className="onboarding-step-eyebrow">STEP 07 · TEAM INVITES</span>
              <h2>Bring your teammates in.</h2>
              <p>Collect the people who should help manage customer conversations. Real email invitations need a backend.</p>
              <form className="onboarding-invite-form" onSubmit={addAgent}><label>Team member email<span><MailPlus size={15} /><input onChange={(event) => setAgentEmail(event.target.value)} placeholder="teammate@company.com" type="email" value={agentEmail} /></span></label><button className="onboarding-secondary-button" type="submit"><UsersRound size={14} /> Add to invite list</button></form>
              {progress.invitedAgents.length > 0 && <div className="onboarding-invite-list">{progress.invitedAgents.map((email) => <div key={email}><span>{email}</span><small>Ready to invite · demo only</small></div>)}</div>}
              <div className="onboarding-inline-note">No email is sent and no agent account is created. Invite delivery is prepared for the future team service.</div>
            </section>
          )}

          {currentStep === 8 && (
            <section className="onboarding-content-step onboarding-go-live">
              <span className="onboarding-step-eyebrow">STEP 08 · GO LIVE</span>
              <h2>Run your readiness checks.</h2>
              <p>These checks point to the workspace screens where you can verify each experience.</p>
              <div className="onboarding-test-list">
                {TESTS.map(([id, label, detail]) => (
                  <label className={progress.tests[id] ? 'is-tested' : ''} key={id}>
                    <input checked={progress.tests[id]} onChange={(event) => save({ tests: { [id]: event.target.checked } })} type="checkbox" />
                    <span><strong>{label}</strong><small>{detail}</small></span>
                    {id === 'message' && <Link aria-label="Open dashboard to test messages" to="/dashboard">Open <ExternalLink size={11} /></Link>}
                    {id === 'aiReply' && <Link aria-label="Open AI context settings" to="/ai-context">Open <ExternalLink size={11} /></Link>}
                    {id === 'menu' && <Link aria-label="Open dashboard for menu test" to="/dashboard">Open <ExternalLink size={11} /></Link>}
                    {id === 'approval' && <Link aria-label="Open approvals" to="/approvals">Open <ExternalLink size={11} /></Link>}
                    {id === 'analytics' && <Link aria-label="Open analytics" to="/analytics">Open <ExternalLink size={11} /></Link>}
                  </label>
                ))}
              </div>
              <div className="onboarding-ready-note"><Rocket size={16} /><span><strong>Ready when you are</strong><small>Finishing onboarding does not activate external channel connections in this demo.</small></span></div>
            </section>
          )}

          <footer className="onboarding-navigation">
            <button className="onboarding-skip-button" disabled={saving} onClick={skip} type="button"><SkipForward size={14} /> Skip for now</button>
            <div>
              {currentStep > 1 && <button className="onboarding-back-button" disabled={saving} onClick={() => moveTo(currentStep - 1)} type="button"><ArrowLeft size={14} /> Back</button>}
              {currentStep < STEPS.length
                ? <button className="onboarding-next-button" disabled={saving} onClick={() => moveTo(currentStep + 1)} type="button">{saving ? 'Saving…' : 'Save & continue'} <ArrowRight size={14} /></button>
                : <button className="onboarding-next-button" disabled={saving} onClick={complete} type="button">Finish setup <Check size={14} /></button>}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
