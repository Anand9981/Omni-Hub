import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, CircleHelp, CreditCard, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { billingService, BILLING_CYCLES, PAYMENT_GATEWAYS, SUBSCRIPTION_PLANS } from '../../services/billingService.js';
import { conversationService } from '../../services/conversationService.js';

export default function Billing() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [activeChannels, setActiveChannels] = useState([]);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    try {
      setPreferences(billingService.getPreferences());
      const conversations = conversationService.listConversations();
      setActiveChannels([...new Set(conversations.map((item) => item.platform))]);
      setMessageCount(conversations.reduce((total, item) => total + item.messageCount, 0));
    } catch (loadError) {
      setError(loadError.message || 'Billing information could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  const chosenPlan = useMemo(
    () => SUBSCRIPTION_PLANS.find((plan) => plan.id === preferences?.selectedPlan) || SUBSCRIPTION_PLANS[0],
    [preferences?.selectedPlan],
  );
  const messageUsagePercent = typeof chosenPlan.messages === 'number'
    ? Math.min(100, (messageCount / chosenPlan.messages) * 100)
    : 0;

  const update = (field, value) => {
    setPreferences((current) => ({ ...current, [field]: value }));
    setSaved(false);
    setError('');
  };

  const save = () => {
    try {
      setPreferences(billingService.savePreferences(preferences));
      setSaved(true);
      setError('');
    } catch (saveError) {
      setError(saveError.message || 'Billing preference could not be saved.');
    }
  };

  if (loading) return <div className="billing-loading" role="status">Loading billing structure…</div>;
  if (!preferences) return <div className="billing-message" role="alert">{error || 'Billing information could not be loaded.'}</div>;

  return (
    <div className="billing-page">
      <header className="billing-hero">
        <div><span><CreditCard size={14} /> FUTURE BILLING STRUCTURE</span><h1>Pricing when<br /><em>you’re ready.</em></h1><p>Plans and payment options are prepared for a future launch. This trial workspace will never charge you.</p></div>
        <div className="billing-hero-lock"><LockKeyhole size={27} /><strong>Payments disabled</strong><small>No gateway is connected</small></div>
      </header>
      {error && <div className="billing-error" role="alert">{error}</div>}
      <section className="billing-status-card">
        <div className="billing-status-mark"><ShieldCheck size={18} /></div>
        <div><span>WORKSPACE STATUS</span><h2>Trial · No active subscription</h2><p>Choose a plan preference below to prepare for a future subscription. It will not start billing or alter workspace access.</p></div>
        <Link to="/subscription">View subscription <ArrowRight size={13} /></Link>
      </section>

      <section className="billing-plans-section">
        <header className="billing-section-heading"><div><span>PLANS FROM THE PRD</span><h2>Choose a future plan</h2></div><label>Billing cycle<select onChange={(event) => update('billingCycle', event.target.value)} value={preferences.billingCycle}>{BILLING_CYCLES.map((cycle) => <option key={cycle.id} value={cycle.id}>{cycle.label}{cycle.discount ? ` · save ${cycle.discount}%` : ''}</option>)}</select></label></header>
        <div className="billing-plan-grid">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <article className={`billing-plan-card${preferences.selectedPlan === plan.id ? ' is-selected' : ''}${plan.id === 'standard' ? ' is-featured' : ''}`} key={plan.id}>
              {plan.id === 'standard' && <span className="billing-plan-ribbon"><Sparkles size={11} /> Recommended</span>}
              <div className="billing-plan-title"><h3>{plan.name}</h3>{preferences.selectedPlan === plan.id && <span><Check size={11} /> Preferred</span>}</div>
              <div className="billing-plan-price"><strong>{plan.id === 'custom' ? 'Let’s talk' : 'Pricing later'}</strong>{plan.id !== 'custom' && <small>future launch</small>}</div>
              <p>{typeof plan.channels === 'number' ? `${plan.channels} ${plan.channels === 1 ? 'channel' : 'channels'}` : plan.channels} · {typeof plan.messages === 'number' ? `${plan.messages.toLocaleString()} messages / month` : `${plan.messages} messages`}</p>
              <ul>{plan.features.map((feature) => <li key={feature}><Check size={13} /> {feature}</li>)}</ul>
              <button aria-pressed={preferences.selectedPlan === plan.id} className={preferences.selectedPlan === plan.id ? 'is-selected' : ''} onClick={() => update('selectedPlan', plan.id)} type="button">{preferences.selectedPlan === plan.id ? 'Selected preference' : plan.id === 'custom' ? 'Select custom' : 'Select plan'}</button>
            </article>
          ))}
        </div>
      </section>

      <div className="billing-detail-grid">
        <section className="billing-detail-card">
          <header><span><CreditCard size={15} /></span><div><strong>Payment gateway structure</strong><small>Future integration targets from the PRD</small></div></header>
          <div className="billing-gateway-grid">
            {PAYMENT_GATEWAYS.map((gateway) => <label className={preferences.paymentGateway === gateway.id ? 'is-selected' : ''} key={gateway.id}><input checked={preferences.paymentGateway === gateway.id} onChange={() => update('paymentGateway', gateway.id)} name="paymentGateway" type="radio" /><span><strong>{gateway.label}</strong><small>{gateway.region} · not connected</small></span></label>)}
          </div>
          <p className="billing-muted-note"><CircleHelp size={13} /> Selecting a gateway stores a preference only. No payment details are collected.</p>
        </section>

        <section className="billing-detail-card">
          <header><span><Sparkles size={15} /></span><div><strong>Workspace usage snapshot</strong><small>Local demo data · not a billable period</small></div></header>
          <div className="billing-usage-row"><span>Conversation messages</span><strong>{messageCount.toLocaleString()}</strong></div>
          <div className="billing-usage-row"><span>Channels seen in demo data</span><strong>{activeChannels.length}</strong></div>
          <div className="billing-usage-row"><span>File storage and API requests</span><strong>Backend required</strong></div>
          <div aria-label={typeof chosenPlan.messages === 'number' ? `${messageUsagePercent.toFixed(0)}% of the selected plan's monthly message limit` : 'No numeric message limit for the selected plan'} className="billing-usage-bar"><span style={{ width: `${messageUsagePercent}%` }} /></div>
          <small className="billing-muted-note">Monthly limits and overages require server-side metering. Historic local demo messages are not counted as current-month usage.</small>
        </section>
      </div>

      <section className="billing-cycle-card">
        <div><strong>Auto-renewal preference</strong><small>Recurring billing is not active in the trial.</small></div>
        <button aria-pressed={preferences.autoRenew} className={`billing-toggle${preferences.autoRenew ? ' is-on' : ''}`} onClick={() => update('autoRenew', !preferences.autoRenew)} type="button"><span />{preferences.autoRenew ? 'Preference on' : 'Preference off'}</button>
      </section>

      <footer className="billing-savebar"><span>{saved ? <><Check size={14} /> Future billing preferences saved locally</> : 'Future scope only · no plan, renewal or payment is activated.'}</span><button className="primary-button" onClick={save} type="button">Save preferences <Check size={14} /></button></footer>
    </div>
  );
}
