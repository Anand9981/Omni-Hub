import { useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authDemoService.js';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

/** Routes that need the full canvas instead of the readable reading column. */
const FULL_WIDTH_ROUTES = ['/dashboard', '/analytics', '/reports', '/agents', '/leads', '/canned-responses', '/widget-settings', '/onboarding', '/billing', '/subscription', '/channels'];

/**
 * Authenticated workspace shell: sidebar navigation plus a page header.
 *
 * This is intentionally a different frame from the public auth screens so the
 * account area reads as a separate place, not another sign-in page.
 */
export default function DashboardLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = authService.getCurrentUser();

  const signOut = useCallback(() => {
    authService.signOut();
    navigate('/login', { replace: true });
  }, [navigate]);

  const wide = FULL_WIDTH_ROUTES.includes(pathname) || pathname.startsWith('/agents/');
  const inbox = pathname === '/dashboard' || pathname.startsWith('/dashboard/');

  return (
    <div className={`dash-shell${inbox ? ' dash-shell--inbox' : ''}`}>
      <Sidebar onSignOut={signOut} user={user} />
      <div className="dash-body">
        <Topbar user={user} />
        <main className={`dash-main${wide ? ' dash-main--wide' : ''}${inbox ? ' dash-main--inbox' : ''}`}>
          <div className={wide ? 'dash-content dash-content--wide' : 'dash-content'}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}