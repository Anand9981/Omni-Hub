import { useEffect, useState } from 'react';
import { ArrowRight, CalendarClock, Check, CircleHelp, Clock3, CreditCard, FileText, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { billingService, BILLING_CYCLES, GRACE_PERIOD_DAYS, SUBSCRIPTION_PLANS } from '../../services/billingService.js';
import { conversationService } from '../../services/conversationService.js';

export default function Subscription() {
  const [preferences, setPreferences] = useState(null);
  const [usage, setUsage] = useState({ messages: 0, channels: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setPreferences(billingService.getPreferences());
      const conversations = conversationService.listConversations();
      setUsage({
        messages: conversations.reduce((total, item) => total + item.messageCount, 0),
        channels: new Set(conversations.map((item) => item.platform)).size,
      });
    } catch (loadError) {
      setError(loadError.message || 'Subscription details could not be loaded.');
    }
  }, []);

  if (!preferences) return <div className="billing-message" role={error ? 'alert' : 'status'}>{error || 'Loading subscription details…'}</div>;
  const plan = SUBSCRIPTION_PLANS.find((item) => item.id === preferences.selectedPlan) || SUBSCRIPTION_PLANS[0];
  const cycle = BILLING_CYCLES.find((item) => item.id === preferences.billingCycle) || BILLING_CYCLES[0];

  return (
    <div className="subscription-page">
      <header className="billing-hero subscription-hero">
        <div><span><CalendarClock size={14} /> SUBSCRIPTION OVERVIEW</span><h1>Ready for the next<br /><em>chapter.</em></h1><p>Review future plan preferences, payment history and usage structure in one place.</p></div>
        <div className="billing-hero-lock"><Clock3 size={27} /><strong>Trial workspace</strong><small>No renewal date set</small></div>
      </header>
      {error && <div className="billing-error" role="alert">{error}</div>}

      <section className="subscription-current-card">
        <header><span><ShieldCheck size={17} /> CURRENT SUBSCRIPTION</span><b>No active subscription</b></header>
        <div className="subscription-current-main"><div><small>Future plan preference</small><h2>{plan.name}</h2><p>{cycle.label} billing{cycle.discount ? ` · ${cycle.discount}% discount on launch` : ''}</p></div><Link to="/billing">Manage plan <ArrowRight size={13} /></Link></div>
        <div className="subscription-card-foot"><span>Trial mode · no payment method · no charges</span><span>Auto-renew: {preferences.autoRenew ? 'preference on; not active' : 'off'}</span></div>
      </section>

      <div className="subscription-overview-grid">
        <section className="subscription-detail-card">
          <header><span><CreditCard size={15} /></span><div><strong>Payment method</strong><small>Gateway integration is planned, not connected.</small></div></header>
          <div className="subscription-empty-state"><span><CreditCard size={18} /></span><strong>No payment method on file</strong><p>Razorpay, Stripe, Fonepay and UPI options are reserved for a future billing release.</p><Link to="/billing">View gateway options <ArrowRight size={12} /></Link></div>
        </section>

        <section className="subscription-detail-card">
          <header><span><FileText size={15} /></span><div><strong>Invoices & payment history</strong><small>Nothing has been charged to this workspace.</small></div></header>
          <div className="subscription-empty-state"><span><FileText size={18} /></span><strong>No invoices yet</strong><p>Invoice PDFs and transaction history will appear here after billing is implemented.</p><span className="subscription-future-badge">Future scope</span></div>
        </section>
      </div>

      <section className="subscription-usage-card">
        <header><span><Clock3 size={15} /></span><div><strong>Usage snapshot</strong><small>Local demo history · not a monthly billable report</small></div><CircleHelp size={15} /></header>
        <div className="subscription-usage-grid">
          <div><span>Messages in local history</span><strong>{usage.messages.toLocaleString()}</strong><small>Monthly tracking awaits backend metering</small></div>
          <div><span>Channels in local history</span><strong>{usage.channels}</strong><small>Active connection status is not verified</small></div>
          <div><span>Storage & API calls</span><strong>Not metered</strong><small>Production usage service required</small></div>
        </div>
      </section>

      <section className="subscription-grace-card">
        <span><CalendarClock size={16} /></span>
        <div><strong>Planned payment grace period · {GRACE_PERIOD_DAYS} days</strong><p>If an invoice becomes overdue after billing launches, the workspace would enter a seven-day grace period before any service suspension. Reminder delivery, payment retries, and suspension decisions are not active in this demo.</p></div>
        <span className="subscription-future-badge">Future scope</span>
      </section>

      <div className="subscription-scope-note"><Check size={15} /><span><strong>Safe by design:</strong> this page is a future-ready structure only. No checkout, auto-renewal, prorating, grace-period suspension, invoices or payment processing is active.</span></div>
    </div>
  );
}
