import { Laptop2, Monitor, Smartphone, Trash2 } from 'lucide-react';
import { isMobileDevice } from '../../utils/deviceInfo.js';

function getDeviceIcon(device = '') {
  if (isMobileDevice(device)) return Smartphone;
  if (/mac|windows|linux/i.test(device)) return Monitor;
  return Laptop2;
}

/**
 * Renders a single active device session row with device badges and revoke button.
 */
export default function SessionCard({ session, isCurrent = false, onRevoke }) {
  if (!session) return null;
  const DeviceIcon = getDeviceIcon(session.device);

  return (
    <div className="session-card">
      <div className={`session-device-icon${isCurrent ? ' session-device-icon--active' : ''}`}>
        <DeviceIcon size={19} />
      </div>
      <div className="session-details">
        <strong>
          {session.device || 'Unknown device'}{' '}
          {isCurrent && <span className="current-badge">THIS DEVICE</span>}{' '}
          {session.trustedDevice && <span className="trusted-badge">TRUSTED</span>}
        </strong>
        <span>{session.email}</span>
        <small>Signed in {new Date(session.createdAt).toLocaleString()}</small>
        <small>
          Last active {new Date(session.lastActiveAt || session.createdAt).toLocaleString()} · Verified session
        </small>
      </div>
      <button
        className="icon-action"
        aria-label={`Sign out ${session.device || 'device'}`}
        onClick={() => onRevoke?.(session)}
        title="Sign out this device"
        type="button"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
