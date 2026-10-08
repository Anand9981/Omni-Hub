import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { polishDraft } from '../../store/approvalSlice.js';
import LanguageSelector from './LanguageSelector.jsx';

/**
 * PRD 9.3 - [Polish with AI].
 *
 * Takes a rough agent note and hands back a professional rewrite. Busy state is
 * local so several instances (composer and approval card) never fight over one
 * shared flag.
 */
export default function AIPolishButton({ text, onPolished, disabled = false, label = 'Polish with AI' }) {
  const dispatch = useDispatch();
  const [busy, setBusy] = useState(false);
  const [language, setLanguage] = useState('auto');
  const [error, setError] = useState('');

  async function run() {
    if (busy || !text?.trim()) return;
    setBusy(true);
    setError('');
    try {
      const result = await dispatch(polishDraft({ text, language })).unwrap();
      onPolished(result.polished_text);
    } catch (polishError) {
      setError(polishError.message || 'The draft could not be polished. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ai-polish-control">
      <LanguageSelector disabled={disabled || busy} onChange={setLanguage} value={language} />
      <button
        className="ai-polish-button"
        disabled={disabled || busy || !text?.trim()}
        onClick={run}
        type="button"
      >
        <Sparkles size={15} />
        {busy ? 'Polishing…' : label}
      </button>
      {error && <span className="ai-polish-error" role="alert">{error}</span>}
    </div>
  );
}