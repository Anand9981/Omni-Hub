import { useRef, useState } from 'react';
import { FileText, Link2, Plus, Trash2, UploadCloud } from 'lucide-react';
import HelpTooltip from '../../components/onboarding/HelpTooltip.jsx';

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}. Please choose the file again.`));
    reader.readAsDataURL(file);
  });
}

export default function KnowledgeBase({ value, onChange, disabled = false }) {
  const fileInput = useRef(null);
  const [error, setError] = useState('');
  const [faqDraft, setFaqDraft] = useState({ question: '', answer: '' });

  const update = (field, next) => {
    onChange({ ...value, [field]: next });
    setError('');
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setError('');
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.docx')) {
      setError('Upload a PDF or DOCX document.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('Files are limited to 2 MB in this local demo.');
      return;
    }
    try {
      const dataUrl = await readFile(file);
      update('files', [...value.files, {
        id: `kb-${crypto.randomUUID()}`,
        name: file.name,
        type: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: file.size,
        dataUrl,
      }]);
    } catch (uploadError) {
      setError(uploadError.message || 'The file could not be added.');
    }
  };

  const addFaq = (event) => {
    event.preventDefault();
    const question = faqDraft.question.trim();
    const answer = faqDraft.answer.trim();
    if (!question || !answer) {
      setError('Add both a question and an answer.');
      return;
    }
    update('faqs', [...value.faqs, { id: `faq-${crypto.randomUUID()}`, question, answer }]);
    setFaqDraft({ question: '', answer: '' });
  };

  const updateWebsiteUrl = (websiteUrl) => {
    update('websiteUrl', websiteUrl);
  };

  return (
    <div className="onboarding-form-grid">
      <section className="onboarding-input-card">
        <header><span className="onboarding-card-icon"><FileText size={17} /></span><div><strong>Business knowledge</strong><small>Share accurate facts for better customer replies.</small></div><HelpTooltip>Use approved business information, not sensitive customer or payment data. In this demo, text is stored in this browser and not sent to an AI provider.</HelpTooltip></header>
        <label>About your business
          <textarea disabled={disabled} maxLength={4000} onChange={(event) => update('text', event.target.value)} placeholder="Describe your products, services, policies, and the most useful facts customers should know." rows={6} value={value.text} />
          <small className="onboarding-field-hint">{value.text.length}/4,000 characters</small>
        </label>
        <label>Primary knowledge language
          <select disabled={disabled} onChange={(event) => update('language', event.target.value)} value={value.language}>
            {['English', 'Hindi', 'Hinglish'].map((language) => <option key={language}>{language}</option>)}
          </select>
        </label>
      </section>

      <section className="onboarding-input-card">
        <header><span className="onboarding-card-icon onboarding-card-icon--mint"><UploadCloud size={17} /></span><div><strong>Reference files</strong><small>Attach product guides and policies.</small></div><HelpTooltip title="File upload details">PDF and DOCX files up to 2 MB are stored locally for this prototype. Reading, indexing and searching their contents requires the future knowledge service.</HelpTooltip></header>
        <input accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="onboarding-file-input" disabled={disabled} onChange={upload} ref={fileInput} type="file" />
        <button className="onboarding-upload-area" disabled={disabled} onClick={() => fileInput.current?.click()} type="button"><UploadCloud size={21} /><strong>Choose a PDF or DOCX file</strong><small>Up to 2 MB · Stored in this browser only</small></button>
        {value.files.length > 0 && (
          <div className="onboarding-file-list">
            {value.files.map((file) => <div key={file.id}><FileText size={15} /><span><strong>{file.name}</strong><small>{(file.size / 1024).toFixed(0)} KB · Local demo file</small></span><button aria-label={`Remove ${file.name}`} disabled={disabled} onClick={() => update('files', value.files.filter((item) => item.id !== file.id))} type="button"><Trash2 size={14} /></button></div>)}
          </div>
        )}
        <label className="onboarding-url-label">Website knowledge source <small>Enter a secure URL to include with your setup notes.</small>
          <span><Link2 size={15} /><input disabled={disabled} onChange={(event) => updateWebsiteUrl(event.target.value)} placeholder="https://yourcompany.com/help" value={value.websiteUrl} /></span>
        </label>
        <p className="onboarding-inline-note">Automatic website crawling is a future backend feature. This demo saves the URL; it does not fetch or scrape the site.</p>
      </section>

      <section className="onboarding-input-card onboarding-faq-card">
        <header><span className="onboarding-card-icon onboarding-card-icon--gold"><Plus size={17} /></span><div><strong>Frequently asked questions</strong><small>Seed clear, approved answers to common queries.</small></div></header>
        <form className="onboarding-faq-form" onSubmit={addFaq}>
          <label>Question<input disabled={disabled} maxLength={300} onChange={(event) => setFaqDraft((current) => ({ ...current, question: event.target.value }))} placeholder="What are your opening hours?" value={faqDraft.question} /></label>
          <label>Answer<textarea disabled={disabled} maxLength={1200} onChange={(event) => setFaqDraft((current) => ({ ...current, answer: event.target.value }))} placeholder="We are open Monday to Saturday, 10 AM to 7 PM." rows={2} value={faqDraft.answer} /></label>
          <button className="onboarding-secondary-button" disabled={disabled || !faqDraft.question.trim() || !faqDraft.answer.trim()} type="submit"><Plus size={14} /> Add FAQ</button>
        </form>
        {value.faqs.length > 0 && <div className="onboarding-faq-list">{value.faqs.map((faq) => <article key={faq.id}><div><strong>{faq.question}</strong><p>{faq.answer}</p></div><button aria-label="Remove FAQ" disabled={disabled} onClick={() => update('faqs', value.faqs.filter((item) => item.id !== faq.id))} type="button"><Trash2 size={14} /></button></article>)}</div>}
      </section>

      {error && <p className="onboarding-inline-error" role="alert">{error}</p>}
    </div>
  );
}
