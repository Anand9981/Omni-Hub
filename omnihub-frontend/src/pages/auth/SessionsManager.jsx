import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SessionCard from '../../components/auth/SessionCard.jsx';
import { authService } from '../../services/authDemoService.js';

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
        {sessions.length === 0 ? (
          <div className="empty-state">No active sessions. Please sign in again.</div>
        ) : (
          sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isCurrent={session.id === current?.id}
              onRevoke={signOutSession}
            />
          ))
        )}
      </div>
      {sessions.length > 1 && <button className="secondary-button" onClick={signOutOthers} type="button"><LogOut size={16} /> Sign out other devices</button>}
      <div className="demo-note"><span className="demo-note-dot" /> Active sessions · Maximum 3 concurrent devices per workspace account.</div>
    </div>
  );
}