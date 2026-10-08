import { ChartNoAxesCombined, FileBarChart2, KeyRound, Laptop2, LayoutDashboard, LogOut, ShieldCheck, ShieldQuestion, UsersRound, ContactRound, MessageSquareText, Clock3, FileCheck2, Sparkles, MessagesSquare, Rocket, CreditCard, ReceiptText, Webhook } from 'lucide-react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { conversationService } from '../../services/conversationService.js';
import { canManageApprovals } from '../../utils/permissions.js';

const workspaceItems = [
  { to: '/dashboard', label: 'Conversations', description: 'Unified inbox', icon: LayoutDashboard, wide: true },
  { to: '/analytics', label: 'Analytics', description: 'Workspace performance', icon: ChartNoAxesCombined },
  { to: '/reports', label: 'Reports', description: 'Export traffic summaries', icon: FileBarChart2 },
  { to: '/agents', label: 'Agents', description: 'Team & assignments', icon: UsersRound },
  { to: '/leads', label: 'Leads', description: 'Customer relationships', icon: ContactRound },
  { to: '/canned-responses', label: 'Quick replies', description: 'Team response library', icon: MessageSquareText },
  { to: '/business-hours', label: 'Business hours', description: 'Availability & away replies', icon: Clock3 },
  { to: '/ai-context', label: 'AI context', description: 'Language & business knowledge', icon: Sparkles },
  { to: '/widget-settings', label: 'Website widget', description: 'Customize & embed chat', icon: MessagesSquare },
  { to: '/channels', label: 'Channel setup guides', description: 'API keys, webhooks & steps', icon: Webhook },
  { to: '/templates', label: 'WhatsApp templates', description: 'Approval & localization', icon: FileCheck2 },
  { to: '/onboarding', label: 'Setup journey', description: 'Workspace launch checklist', icon: Rocket },
  { to: '/billing', label: 'Billing plans', description: 'Future plan preferences', icon: CreditCard },
  { to: '/subscription', label: 'Subscription', description: 'Status, usage & invoices', icon: ReceiptText },
  { to: '/approvals', label: 'Approvals', description: 'Held AI drafts', icon: ShieldQuestion, badge: true },
];

const accountItems = [
  { to: '/security', label: 'Account security', description: 'Protection overview', icon: ShieldCheck },
  { to: '/sessions', label: 'Active sessions', description: 'Signed-in devices', icon: Laptop2 },
  { to: '/backup-codes', label: 'Backup codes', description: 'Emergency access', icon: KeyRound },
];

/**
 * Workspace navigation.
 *
 * Grouped so the messaging product (workspace) sits apart from the account
 * area. The Approvals badge mirrors the real held-draft count, which is the
 * "pending approval bottleneck counter" named in PRD 12.3.
 */
export default function Sidebar({ user, onSignOut }) {
  const pendingCount = useSelector((state) => state.approvals.pending.length);
  const fallbackCount = pendingCount || conversationService.getPendingCount();

  const renderItem = ({ to, label, description, icon: Icon, badge }) => (
    <NavLink
      className={({ isActive }) => `dash-nav-item${isActive ? ' is-active' : ''}`}
      key={to}
      to={to}
    >
      <span className="dash-nav-icon"><Icon size={17} /></span>
      <span className="dash-nav-copy">
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      {badge && fallbackCount > 0 && <span className="dash-nav-badge">{fallbackCount}</span>}
    </NavLink>
  );

  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-brand">
        <span className="brand-mark brand-mark--sm"><ShieldCheck size={18} strokeWidth={2.3} /></span>
        <span className="brand-name">omni<span>hub</span></span>
      </div>

      <nav aria-label="Workspace" className="dash-nav">
        <span className="dash-nav-label">Workspace</span>
        {workspaceItems.filter((item) => !['/approvals', '/agents', '/business-hours', '/ai-context', '/widget-settings', '/templates', '/onboarding', '/billing', '/subscription', '/channels'].includes(item.to) || canManageApprovals(user?.role)).map(renderItem)}

        <span className="dash-nav-label dash-nav-label--gap">Account</span>
        {accountItems.map(renderItem)}
      </nav>

      <div className="dash-sidebar-foot">
        <div className="dash-user">
          <span className="dash-user-avatar">{(user?.name || user?.email || 'A').charAt(0).toUpperCase()}</span>
          <span className="dash-user-copy">
            <strong>{user?.name || 'Workspace admin'}</strong>
            <small>{user?.email}</small>
          </span>
        </div>
        <button className="dash-signout" onClick={onSignOut} type="button">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}