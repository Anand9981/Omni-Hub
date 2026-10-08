import { ArrowRight, Clock3, History, KeyRound, Laptop2, MapPin, Shield, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authDemoService.js';

const workspaceRoles = [
  ['Super Admin', 'Full system access'],
  ['Admin', 'Dashboard access and approvals'],
  ['Agent', 'Assigned conversations'],
  ['Viewer', 'Read-only access'],
];

export default function SecurityHome() {
  const user = authService.getCurrentUser();
  const sessions = authService.getSessions();
  const loginAudit = authService.getLoginAudit();
  return (
    <div className="page-card security-home">
      <div className="account-card">
        <div className="account-avatar">{(user?.name || user?.email || 'A').charAt(0).toUpperCase()}</div>
        <div className="account-info"><strong>{user?.name || 'Workspace admin'}</strong><span>{user?.email}</span></div>
        <span className="role-pill">{user?.role || 'Admin'}</span>
      </div>
      <div className="security-section-title">SECURITY & SESSIONS</div>
      <Link className="settings-row" to="/sessions"><span className="settings-row-icon"><Laptop2 size={17} /></span><span className="settings-row-copy"><strong>Active sessions</strong><small>{sessions.length} of 3 devices in use</small></span><ArrowRight size={16} /></Link>
      <div className="settings-row settings-row--static"><span className="settings-row-icon settings-row-icon--green"><Shield size={17} /></span><span className="settings-row-copy"><strong>Two-step verification</strong><small>Email verification is enabled</small></span><span className="status-pill">Enabled</span></div>
      <Link className="settings-row" to="/backup-codes"><span className="settings-row-icon"><KeyRound size={17} /></span><span className="settings-row-copy"><strong>Backup codes</strong><small>Keep a secure way back in</small></span><ArrowRight size={16} /></Link>
      <div className="roles-panel">
        <div className="security-section-title">WORKSPACE ROLES</div>
        {workspaceRoles.map(([role, description]) => (
          <div className="role-row" key={role}>
            <strong>{role}</strong><span>{description}</span>
          </div>
        ))}
      </div>
      <div className="session-policy">
        <div className="security-section-title">SESSION POLICY</div>
        <div><span>Access token</span><strong>40 hours</strong></div>
        <div><span>Refresh token</span><strong>7 days · rotated</strong></div>
        <div><span>Inactive timeout</span><strong>40 hours</strong></div>
        <div><span>New-device alerts</span><strong className="policy-demo">Backend connection required</strong></div>
      </div>
      <section className="login-audit" aria-labelledby="login-audit-heading">
        <div className="login-audit-heading">
          <div className="security-section-title" id="login-audit-heading"><History size={13} /> RECENT SIGN-INS</div>
          <span>Latest activity</span>
        </div>
        {loginAudit.length ? loginAudit.slice(0, 5).map((entry) => (
          <div className="login-audit-row" key={entry.id}>
            <span className="login-audit-icon"><Laptop2 size={14} /></span>
            <span className="login-audit-details">
              <strong>{entry.device}{entry.trustedDevice && <i>TRUSTED</i>}</strong>
              <small>{new Date(entry.createdAt).toLocaleString()}</small>
            </span>
            <span className="login-audit-location"><MapPin size={12} /> IP unavailable</span>
          </div>
        )) : <p className="login-audit-empty">No sign-ins recorded in this browser yet.</p>}
        <p className="login-audit-note">Login history is stored locally for this demo. IP logging and new-device email alerts require a backend.</p>
      </section>
      <div className="recent-login"><Clock3 size={14} /> Last sign-in {loginAudit[0] ? new Date(loginAudit[0].createdAt).toLocaleString() : 'not recorded'} <span>·</span><UserRound size={14} /> {user?.role || 'Admin'}</div>
      <div className="demo-note"><span className="demo-note-dot" /> Frontend demo · This account is stored only in this browser.</div>
    </div>
  );
}
