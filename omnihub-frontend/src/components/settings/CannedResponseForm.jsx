import { useEffect, useMemo, useState } from 'react';
import { Braces, Check, CornerDownLeft, X } from 'lucide-react';
import {
  CANNED_RESPONSE_CATEGORIES,
  CANNED_RESPONSE_LANGUAGES,
} from '../../services/cannedResponseService.js';

const EMPTY_RESPONSE = {
  title: '',
  shortcut: '/',
  category: 'Support',
  language: 'English',
  content: '',
};

const SAMPLE_VARIABLES = { customer_name: 'Alex Morgan', business_name: 'Northstar Studio' };

function previewTemplate(content) {
  return content
    .replace(/\{customer_name\}/gi, SAMPLE_VARIABLES.customer_name)
    .replace(/\{business_name\}/gi, SAMPLE_VARIABLES.business_name);
}

export default function CannedResponseForm({ response, busy = false, error, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_RESPONSE);

  useEffect(() => {
    setForm(response ? {
      title: response.title,
      shortcut: response.shortcut,
      category: response.category,
      language: response.language,
      content: response.content,
    } : EMPTY_RESPONSE);
  }, [response]);

  const preview = useMemo(() => previewTemplate(form.content), [form.content]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    onSave({ ...form, id: response?.id });
  };

  return (
    <div className="canned-form-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()} role="presentation">
      <section aria-labelledby="canned-form-title" aria-modal="true" className="canned-form-modal" role="dialog">
        <header className="canned-form-head">
          <div><span className="canned-section-kicker">{response ? 'EDIT QUICK REPLY' : 'NEW QUICK REPLY'}</span><h2 id="canned-form-title">{response ? 'Refine your response' : 'Create a canned response'}</h2><p>Write once. Help your team reply with consistency, in any language.</p></div>
          <button aria-label="Close form" className="canned-form-close" onClick={onClose} type="button"><X size={17} /></button>
        </header>
        <form className="canned-response-form" onSubmit={submit}>
          <div className="canned-form-grid">
            <label className="canned-field canned-field--wide"><span>Response name</span><input autoFocus maxLength={60} onChange={(event) => update('title', event.target.value)} placeholder="e.g. Welcome new customer" required value={form.title} /></label>
            <label className="canned-field"><span>Shortcut code</span><input maxLength={25} onChange={(event) => update('shortcut', event.target.value.startsWith('/') ? event.target.value.toLowerCase() : `/${event.target.value.toLowerCase()}`)} placeholder="/welcome" required value={form.shortcut} /><small>Type this after / in the reply box</small></label>
            <label className="canned-field"><span>Category</span><select onChange={(event) => update('category', event.target.value)} value={form.category}>{CANNED_RESPONSE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label className="canned-field"><span>Language</span><select onChange={(event) => update('language', event.target.value)} value={form.language}>{CANNED_RESPONSE_LANGUAGES.map((language) => <option key={language}>{language}</option>)}</select></label>
          </div>
          <label className="canned-field canned-field--content"><span>Reply text</span><textarea maxLength={1200} onChange={(event) => update('content', event.target.value)} placeholder="Write a helpful reply…" required rows={5} value={form.content} /><small>{form.content.length} / 1,200 characters</small></label>
          <div className="canned-variable-helper">
            <span className="canned-variable-icon"><Braces size={15} /></span>
            <div><strong>Personalize with variables</strong><small>Use a variable in your message; we fill it from the customer and workspace context.</small><div className="canned-variable-chips">{['{customer_name}', '{business_name}'].map((variable) => <button key={variable} onClick={() => update('content', `${form.content}${form.content && !form.content.endsWith(' ') ? ' ' : ''}${variable}`)} type="button">{variable}</button>)}</div></div>
          </div>
          <div className="canned-preview"><div><span className="canned-section-kicker">LIVE PREVIEW</span><span className="canned-preview-customer">Alex Morgan · WhatsApp</span></div><p>{preview || 'Your personalized reply preview will appear here.'}</p></div>
          {error && <p className="canned-form-error" role="alert">{error}</p>}
          <footer className="canned-form-actions">
            <span><CornerDownLeft size={13} /> Replies are saved in this browser demo</span>
            <button className="secondary-button" disabled={busy} onClick={onClose} type="button">Cancel</button>
            <button className="primary-button" disabled={busy || !form.title.trim() || !form.content.trim()} type="submit"><Check size={15} />{busy ? 'Saving…' : response ? 'Save changes' : 'Create response'}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
