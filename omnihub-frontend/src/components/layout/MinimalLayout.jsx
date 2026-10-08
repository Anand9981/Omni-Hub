import { MessageCircle } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import Footer from './Footer.jsx';

/**
 * Focused shell for single-purpose screens: email verification, OTP entry,
 * password recovery.
 *
 * Deliberately carries no marketing panel. These are steps in a task, not
 * landing screens, so the page has one job and nothing competes with it.
 */
export default function MinimalLayout() {
  return (
    <div className="minimal-shell">
      <header className="minimal-header">
        <Link aria-label="OmniHub home" className="brand" to="/login">
          <span className="brand-mark">
            <MessageCircle size={20} strokeWidth={2.3} />
            <span />
          </span>
          <span className="brand-name">omni<span>hub</span></span>
        </Link>
        <a className="minimal-help" href="mailto:hello@omnihub.app">Need help?</a>
      </header>

      <main className="minimal-main">
        <div className="minimal-content">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}