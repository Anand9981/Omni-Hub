import { useState } from 'react';
import BackupCodeCard from '../../components/auth/BackupCodeCard.jsx';
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
    <BackupCodeCard
      codes={codes}
      copied={copied}
      saved={saved}
      notice={notice}
      onCopy={copyCodes}
      onDownload={downloadCodes}
      onRegenerate={generateNewCodes}
    />
  );
}