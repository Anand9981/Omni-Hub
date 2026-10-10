import { Shield, ShieldCheck } from 'lucide-react';

/**
 * Security settings row showing Two-Factor Authentication (2FA) status.
 */
export default function TwoFASetupCard({
  enabled = true,
  method = 'Email OTP verification is enabled',
  onToggle,
}) {
  return (
    <div className="settings-row settings-row--static">
      <span className={`settings-row-icon ${enabled ? 'settings-row-icon--green' : ''}`}>
        {enabled ? <ShieldCheck size={17} /> : <Shield size={17} />}
      </span>
      <span className="settings-row-copy">
        <strong>Two-step verification</strong>
        <small>{method}</small>
      </span>
      {onToggle ? (
        <button className="status-pill" onClick={onToggle} type="button">
          {enabled ? 'Enabled' : 'Enable 2FA'}
        </button>
      ) : (
        <span className="status-pill">{enabled ? 'Enabled' : 'Disabled'}</span>
      )}
    </div>
  );
}
