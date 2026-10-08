import { Check, Copy, Download, KeyRound, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { authService } from '../../services/authDemoService.js';

export default function BackupCodes() {
  const [codes, setCodes] = useState(() => {
    try {
      const saved = authService.getBackupCodes();
      return saved.length === 10 ? saved : [];
    } catch {
      return [];
    }
  });
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState('');
  function generateNewCodes() {
    try {
      setCodes(authService.regenerateBackupCodes());
      setSaved(false);
      setNotice('');
    } catch (error) {
      setNotice(error.message);
    }
  }
  async function copyCodes() {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error('Could not copy backup codes', error);
      setNotice('Clipboard access is unavailable. Select and copy the codes manually.');
    }
  }
  function downloadCodes() {
    const file = new Blob([`OmniHub backup codes\nGenerated ${new Date().toLocaleString()}\n\n${codes.join('\n')}\n`], { type: 'text/plain' });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'omnihub-backup-codes.txt';
    anchor.click();
    URL.revokeObjectURL(url);
    setSaved(true);
  }
  return (
    <div className="page-card">
      <div className="backup-warning"><KeyRound size={16} /><span><strong>Keep these somewhere safe.</strong> Anyone with a code can access your account. They’re stored only in this browser demo.</span></div>
      {codes.length ? (
        <div className="backup-codes">{codes.map((code, index) => <span key={`${code}-${index}`}><i>{String(index + 1).padStart(2, '0')}</i>{code}</span>)}</div>
      ) : (
        <div className="empty-state">Your backup codes haven’t been generated yet. Create a fresh set to continue.</div>
      )}
      {notice && <div className="alert alert--error" role="alert">{notice}</div>}
      <div className="backup-actions">
        <button className="secondary-button" onClick={copyCodes} type="button">{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied' : 'Copy codes'}</button>
        <button className="primary-button" onClick={downloadCodes} type="button"><Download size={16} /> {saved ? 'Saved to your device' : 'Download codes'}</button>
      </div>
      <button className="text-button regenerate-button" onClick={generateNewCodes} type="button"><RefreshCw size={14} /> {codes.length ? 'Replace backup codes' : 'Generate backup codes'}</button>
      <div className="demo-note"><span className="demo-note-dot" /> Frontend demo · These codes are examples, not server-issued recovery credentials.</div>
    </div>
  );
}