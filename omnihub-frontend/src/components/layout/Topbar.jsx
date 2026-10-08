import { useLocation } from 'react-router-dom';

const pageMeta = {
  '/dashboard': { title: 'Conversations', subtitle: 'Every channel in one inbox — approve, edit, or take over a thread.' },
  '/approvals': { title: 'Approval queue', subtitle: 'AI drafts held for review. Nothing is dispatched until you decide.' },
  '/analytics': { title: 'Analytics', subtitle: 'A clear view of conversations, channel traffic, and team response.' },
  '/reports': { title: 'Reports', subtitle: 'Explore daily, weekly, and monthly workspace summaries.' },
  '/agents': { title: 'Agents', subtitle: 'Manage availability, capacity, and customer conversation assignments.' },
  '/leads': { title: 'Leads', subtitle: 'Customer profiles, pipeline status and channel context in one place.' },
  '/canned-responses': { title: 'Quick replies', subtitle: 'Create and manage consistent, personalized responses for every channel.' },
  '/security': { title: 'Account security', subtitle: 'Protect your workspace and review recent sign-in activity.' },
  '/sessions': { title: 'Active sessions', subtitle: 'Review and end the devices signed in to this account.' },
  '/backup-codes': { title: 'Backup codes', subtitle: 'Emergency access if you ever lose your email.' },
  '/onboarding': { title: 'Workspace setup', subtitle: 'A guided checklist to prepare your workspace for launch.' },
  '/billing': { title: 'Billing plans', subtitle: 'Review future plan options and save local preferences.' },
  '/subscription': { title: 'Subscription', subtitle: 'Review trial status, usage and future billing structure.' },
  '/channels': { title: 'Channel setup guides', subtitle: 'Step-by-step API setup, webhook references and safe credential handling.' },
};

/**
 * Workspace header. The title is derived from the active route so each page
 * announces itself instead of every page sharing one heading.
 */
export default function Topbar({ user }) {
  const { pathname } = useLocation();
  const meta = pathname.startsWith('/agents/')
    ? { title: 'Agent profile', subtitle: 'Review workload, service performance, and agent availability.' }
    : pageMeta[pathname] || { title: 'Workspace', subtitle: '' };

  return (
    <header className="dash-topbar">
      <div className="dash-topbar-copy">
        <h1>{meta.title}</h1>
        {meta.subtitle && <p>{meta.subtitle}</p>}
      </div>
      <div className="dash-topbar-aside">
        <span className="dash-role-pill">{user?.role || 'Admin'}</span>
      </div>
    </header>
  );
}