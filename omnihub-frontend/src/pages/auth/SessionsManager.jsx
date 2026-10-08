import { Laptop2, LogOut, Monitor, Smartphone, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authDemoService.js';

function getDeviceIcon(device) {
  if (/iphone|android|mobile/i.test(device)) return Smartphone;
  if (/mac|windows|linux/i.test(device)) return Monitor;
  return Laptop2;
}

export default function SessionsManager() {
  const [sessions, setSessions] = useState(() => authService.getSessions());
  const current = authService.getCurrentUser();
  const navigate = useNavigate();
  function signOutSession(session) {
    const updated = authService.revokeSession(session.id);
    setSessions(updated);
    if (session.id === current?.id) navigate('/login');
  }
  function signOutOthers() {
    setSessions(authService.revokeOtherSessions());
  }
  return (
    <div className="page-card">
      <div className="session-limit"><span className="session-limit-dot" /> {sessions.length} of 3 device sessions</div>
      <div className="session-list">
        {sessions.length === 0 ? <div className="empty-state">No active sessions. Please sign in again.</div> : sessions.map((session) => {
          const DeviceIcon = getDeviceIcon(session.device);
          const isCurrent = session.id === current?.id;
          return (
            <div className="session-card" key={session.id}>
              <div className={`session-device-icon${isCurrent ? ' session-device-icon--active' : ''}`}><DeviceIcon size={19} /></div>
              <div className="session-details">
                <strong>{session.device || 'Unknown device'} {isCurrent && <span className="current-badge">THIS DEVICE</span>} {session.trustedDevice && <span className="trusted-badge">TRUSTED</span>}</strong>
                <span>{session.email}</span>
                <small>Signed in {new Date(session.createdAt).toLocaleString()}</small>
                <small>Last active {new Date(session.lastActiveAt || session.createdAt).toLocaleString()} · IP details require backend</small>
              </div>
              <button className="icon-action" aria-label={`Sign out ${session.device}`} onClick={() => signOutSession(session)} title="Sign out this device" type="button"><Trash2 size={16} /></button>
            </div>
          );
        })}
      </div>
      {sessions.length > 1 && <button className="secondary-button" onClick={signOutOthers} type="button"><LogOut size={16} /> Sign out other devices</button>}
      <div className="demo-note"><span className="demo-note-dot" /> Frontend demo · Session details are stored in this browser.</div>
    </div>
  );
}