import { ArrowUpRight, Check, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import Footer from './Footer.jsx';

/**
 * Marketing shell for sign-in and account creation.
 *
 * Split view: the form is the task, the panel on the right explains the
 * product. Task-focused screens (verification, password recovery, backup
 * codes) use MinimalLayout instead, so each page reads as its own step.
 */
export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <header className="auth-site-header">
        <Link className="brand" to="/login" aria-label="OmniHub home">
          <span className="brand-mark"><MessageCircle size={20} strokeWidth={2.3} /><span /></span>
          <span className="brand-name">omni<span>hub</span></span>
        </Link>
        <div className="site-header-trust"><ShieldCheck size={16} /> Secure workspace access</div>
      </header>
      <main className="auth-main">
        <div className="auth-content"><Outlet /></div>
      </main>
      <aside className="auth-aside">
        <div className="aside-orb aside-orb--one" /><div className="aside-orb aside-orb--two" />
        <div className="aside-inner">
          <div className="aside-topline"><Sparkles size={15} /> YOUR CUSTOMER CONVERSATIONS, TOGETHER</div>
          <h1>Every conversation.<br /><span>One clear view.</span></h1>
          <p className="aside-copy">Bring your customer messages into one calm, organized workspace—so your team can focus on what matters.</p>
          <div className="preview-window">
            <div className="preview-head">
              <div className="preview-avatar">S</div><div><strong>Sarah Mitchell</strong><small>Telegram · 2 min ago</small></div>
              <span className="preview-status"><i /> Online</span>
            </div>
            <div className="preview-messages">
              <div className="preview-bubble preview-bubble--incoming">Hi! Could you tell me more about your plans?</div>
              <div className="preview-bubble preview-bubble--outgoing">Of course! I’d be happy to help. ✨</div>
              <div className="preview-typing"><span /><span /><span /> OmniHub is thinking</div>
            </div>
            <div className="preview-input">Write a thoughtful reply... <ArrowUpRight size={15} /></div>
          </div>
          <div className="aside-stat-grid" aria-label="OmniHub workspace highlights">
            <div className="aside-stat"><span className="aside-stat-icon">06</span><div><strong>Connected channels</strong><small>All in one inbox</small></div></div>
            <div className="aside-stat"><span className="aside-stat-icon aside-stat-icon--mint"><Check size={15} /></span><div><strong>Always in sync</strong><small>Built for your team</small></div></div>
          </div>
          <div className="aside-proof">
            <div className="proof-icon"><ShieldCheck size={18} /></div>
            <div><strong>Security that stays out of your way</strong><span><Check size={13} /> Two-step verification built in</span></div>
          </div>
          <div className="aside-floating-note"><span className="floating-sparkle"><Sparkles size={14} /></span><div><strong>Thoughtful by default</strong><small>Human stays in control</small></div><span className="floating-live">LIVE</span></div>
          <div className="aside-bottom">A little more human, a lot more connected.</div>
        </div>
      </aside>
      <Footer />
    </div>
  );
}