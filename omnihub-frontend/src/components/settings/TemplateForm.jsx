import { useEffect, useMemo, useState } from 'react';
import { Braces, Check, X } from 'lucide-react';
import TemplatePreview from './TemplatePreview.jsx';
import { TEMPLATE_CATEGORIES, TEMPLATE_LANGUAGES, TEMPLATE_VARIABLES } from '../../services/templateService.js';

const EMPTY_TEMPLATE = { name: '', category: 'Utility', language: 'English', body: '' };

export default function TemplateForm({ template, busy, error, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_TEMPLATE);
  useEffect(() => {
    setForm(template ? {
      name: template.name,
      category: template.category,
      language: template.language,
      body: template.body,
    } : EMPTY_TEMPLATE);
  }, [template]);

  const variables = useMemo(() => [...form.body.matchAll(/\{\{([^{}]+)\}\}/g)].map((match) => match[1].trim()), [form.body]);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const insertVariable = (variable) => update('body', `${form.body}${form.body && !form.body.endsWith(' ') ? ' ' : ''}{{${variable}}}`);
  const submit = (event) => {
    event.preventDefault();
    onSave({ ...form, id: template?.id });
  };

  return (
    <div className="template-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()} role="presentation">
      <section aria-labelledby="template-form-title" aria-modal="true" className="template-modal" role="dialog">
        <header className="template-modal-head">
          <div><span className="template-eyebrow">WHATSAPP BUSINESS · TEMPLATE LIBRARY</span><h2 id="template-form-title">{template ? 'Edit template' : 'Create a template'}</h2><p>Templates need Meta approval before they can be used outside the 24-hour service window.</p></div>
          <button aria-label="Close template form" className="template-modal-close" onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <form className="template-form" onSubmit={submit}>
          <div className="template-form-fields">
            <label className="template-field template-field--wide"><span>Template name</span><input autoFocus maxLength={512} onChange={(event) => update('name', event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))} placeholder="order_confirmation" required value={form.name} /><small>Lowercase letters, numbers and underscores only. Unique per language.</small></label>
            <label className="template-field"><span>Category</span><select onChange={(event) => update('category', event.target.value)} value={form.category}>{TEMPLATE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="template-field"><span>Language</span><select onChange={(event) => update('language', event.target.value)} value={form.language}>{TEMPLATE_LANGUAGES.map((item) => <option key={item}>{item}</option>)}</select><small>Create a separate template for each language.</small></label>
            <label className="template-field template-field--wide"><span>Message body</span><textarea maxLength={1024} onChange={(event) => update('body', event.target.value)} placeholder="Hi {{customer_name}}, your order {{order_id}} is confirmed." required rows={7} value={form.body} /><small>{form.body.length}/1,024 characters · WhatsApp template body</small></label>
            <div className="template-variable-helper">
              <span><Braces size={15} /></span><div><strong>Personalize with variables</strong><small>Insert approved placeholders in double curly braces.</small>
                <div>{TEMPLATE_VARIABLES.map((variable) => <button key={variable} onClick={() => insertVariable(variable)} type="button">{`{{${variable}}}`}</button>)}</div>
              </div>
            </div>
            {variables.some((variable) => !TEMPLATE_VARIABLES.includes(variable)) && <p className="template-form-warning" role="alert">Unsupported variable: {`{{${variables.find((variable) => !TEMPLATE_VARIABLES.includes(variable))}}}`}</p>}
          </div>
          <TemplatePreview body={form.body} category={form.category} language={form.language} name={form.name} />
          {error && <p className="template-form-error" role="alert">{error}</p>}
          <footer className="template-form-footer">
            <span>Saved locally · Meta submission is not connected</span>
            <button className="secondary-button" disabled={busy} onClick={onClose} type="button">Cancel</button>
            <button className="primary-button" disabled={busy || !form.name.trim() || !form.body.trim() || variables.some((variable) => !TEMPLATE_VARIABLES.includes(variable))} type="submit"><Check size={15} />{busy ? 'Saving…' : template ? 'Save changes' : 'Save draft'}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
