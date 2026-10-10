import { Check, Copy, Download, KeyRound, RefreshCw } from 'lucide-react';

/**
 * Presentational card for displaying, copying, downloading, and regenerating
 * 10 single-use emergency backup recovery codes (PRD 5.2).
 */
export default function BackupCodeCard({
  codes = [],
  copied = false,
  saved = false,
  notice = '',
  onCopy,
  onDownload,
  onRegenerate,
}) {
  return (
    <div className="page-card">
      <div className="backup-warning">
        <KeyRound size={16} />
        <span>
          <strong>Keep these somewhere safe.</strong> Anyone with a code can access your account. Each recovery code can only be used once.
        </span>
      </div>

      {codes.length > 0 ? (
        <div className="backup-codes">
          {codes.map((code, index) => (
            <span key={`${code}-${index}`}>
              <i>{String(index + 1).padStart(2, '0')}</i>
              {code}
            </span>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          Your backup codes haven’t been generated yet. Create a fresh set to continue.
        </div>
      )}

      {notice && (
        <div className="alert alert--error" role="alert">
          {notice}
        </div>
      )}

      <div className="backup-actions">
        <button className="secondary-button" disabled={!codes.length} onClick={onCopy} type="button">
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy codes'}
        </button>
        <button className="primary-button" disabled={!codes.length} onClick={onDownload} type="button">
          <Download size={16} /> {saved ? 'Saved to your device' : 'Download codes'}
        </button>
      </div>

      <button className="text-button regenerate-button" onClick={onRegenerate} type="button">
        <RefreshCw size={14} /> {codes.length ? 'Replace backup codes' : 'Generate backup codes'}
      </button>

      <div className="demo-note">
        <span className="demo-note-dot" /> Emergency recovery · Store these 10 single-use backup codes in a password manager.
      </div>
    </div>
  );
}

