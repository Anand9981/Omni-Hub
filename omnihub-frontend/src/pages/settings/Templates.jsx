import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BadgeCheck, CheckCircle2, Clock3, FilePlus2, Globe2, History, MessageSquareText, Pencil, Plus, Search, Send, Trash2 } from 'lucide-react';
import TemplateForm from '../../components/settings/TemplateForm.jsx';
import TemplatePreview from '../../components/settings/TemplatePreview.jsx';
import TemplateStatusBadge from '../../components/settings/TemplateStatusBadge.jsx';
import { authService } from '../../services/authDemoService.js';
import { TEMPLATE_CATEGORIES } from '../../services/templateService.js';
import {
  clearTemplateError,
  deleteTemplate,
  loadTemplates,
  saveTemplate,
  submitTemplate,
} from '../../store/templateSlice.js';
import { isReadOnly } from '../../utils/permissions.js';

const STATUS_FILTERS = ['All statuses', 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED'];
const CATEGORY_ICONS = { Marketing: 'M', Utility: 'U', Authentication: 'A', Service: 'S' };

export default function Templates() {
  const dispatch = useDispatch();
  const { items, status, saving, submittingId, deletingId, error } = useSelector((state) => state.templates);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [editing, setEditing] = useState(undefined);
  const [expandedHistory, setExpandedHistory] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const readOnly = isReadOnly(authService.getCurrentUser()?.role);

  useEffect(() => { dispatch(loadTemplates()); }, [dispatch]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((template) => (
      (category === 'All categories' || template.category === category)
      && (statusFilter === 'All statuses' || template.status === statusFilter)
      && (!needle || [template.name, template.category, template.language, template.body].some((value) => value.toLowerCase().includes(needle)))
    ));
  }, [category, items, query, statusFilter]);

  const counts = useMemo(() => ({
    approved: items.filter((item) => item.status === 'APPROVED').length,
    pending: items.filter((item) => item.status === 'PENDING').length,
    drafts: items.filter((item) => item.status === 'DRAFT').length,
    rejected: items.filter((item) => item.status === 'REJECTED').length,
  }), [items]);

  async function handleSave(template) {
    dispatch(clearTemplateError());
    try {
      await dispatch(saveTemplate(template)).unwrap();
      setEditing(undefined);
    } catch {
      // The rejected thunk stores the actionable validation message in Redux.
    }
  }

  async function handleSubmit(template) {
    dispatch(clearTemplateError());
    try {
      await dispatch(submitTemplate(template.id)).unwrap();
    } catch {
      // Keep the template and show the service's specific error on the page.
    }
  }

  async function handleDelete(template) {
    if (!window.confirm(`Delete “${template.name}” (${template.language})? This cannot be undone.`)) return;
    dispatch(clearTemplateError());
    await dispatch(deleteTemplate(template.id));
  }

  return (
    <div className="templates-page">
      <header className="templates-hero">
        <div className="templates-hero-copy">
          <span className="templates-eyebrow"><span /> WHATSAPP BUSINESS · MESSAGE TEMPLATES</span>
          <h1>Every message,<br /><em>ready for the moment.</em></h1>
          <p>Manage approved, localized templates for conversations beyond WhatsApp’s 24-hour service window.</p>
          <div className="templates-window-note"><Clock3 size={14} /> Outside the 24-hour window, only approved templates can be sent.</div>
        </div>
        <div className="templates-hero-visual" aria-hidden="true">
          <span className="templates-hero-ring templates-hero-ring--outer" />
          <span className="templates-hero-ring templates-hero-ring--inner" />
          <span className="templates-hero-icon"><MessageSquareText size={27} /></span>
          <span className="templates-hero-label">APPROVED<br />MESSAGING</span>
        </div>
        <div className="templates-stats">
          <div><BadgeCheck size={17} /><strong>{counts.approved}</strong><span>Approved</span></div>
          <div><Clock3 size={17} /><strong>{counts.pending}</strong><span>In review</span></div>
          <div><FilePlus2 size={17} /><strong>{counts.drafts}</strong><span>Drafts</span></div>
          <div><Globe2 size={17} /><strong>{counts.rejected}</strong><span>Needs changes</span></div>
        </div>
      </header>

      {error && !editing && <div className="alert alert--error templates-alert" role="alert">{error}<button className="alert-dismiss" onClick={() => dispatch(clearTemplateError())} type="button">Dismiss</button></div>}
      {status === 'error' && !error && <div className="alert alert--error templates-alert" role="alert">Templates could not be loaded. Refresh to try again.</div>}

      <section className="templates-library">
        <header className="templates-library-head">
          <div><span className="templates-section-kicker">TEMPLATE LIBRARY</span><h2>Built for meaningful conversations <span>{filtered.length}</span></h2><p>Each language version is managed as a separate Meta template.</p></div>
          {!readOnly && <button className="templates-create-button" onClick={() => { dispatch(clearTemplateError()); setEditing(null); }} type="button"><Plus size={16} /> New template</button>}
        </header>
        <div className="templates-toolbar">
          <label className="templates-search"><Search size={15} /><input aria-label="Search templates" onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, text, or language…" value={query} /></label>
          <select aria-label="Filter templates by category" onChange={(event) => setCategory(event.target.value)} value={category}><option>All categories</option>{TEMPLATE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select>
          <select aria-label="Filter templates by status" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>{STATUS_FILTERS.map((item) => <option key={item} value={item}>{item === 'All statuses' ? item : item.charAt(0) + item.slice(1).toLowerCase()}</option>)}</select>
        </div>

        {status === 'loading' && !items.length && <div className="templates-empty">Loading your template library…</div>}
        {status !== 'loading' && !filtered.length && <div className="templates-empty"><span><Search size={20} /></span><strong>No templates in this view</strong><p>Adjust the filters or create a new WhatsApp template draft.</p></div>}

        <div className="template-grid">
          {filtered.map((template) => (
            <article className="template-card" key={template.id}>
              <header className="template-card-head">
                <span className={`template-category-icon template-category-icon--${template.category.toLowerCase()}`}>{CATEGORY_ICONS[template.category] || 'T'}</span>
                <div className="template-card-title"><strong>{template.name}</strong><span>{template.category} <i /> {template.language}</span></div>
                <TemplateStatusBadge status={template.status} />
              </header>
              <div className="template-card-body"><p>{template.body}</p></div>
              <div className="template-card-vars">
                {(template.body.match(/\{\{[^}]+\}\}/g) || []).length
                  ? (template.body.match(/\{\{[^}]+\}\}/g) || []).map((variable, index) => <span key={`${variable}-${index}`}>{variable}</span>)
                  : <small>No variables</small>}
              </div>
              {template.status === 'REJECTED' && template.rejectionReason && <div className="template-rejection"><strong>Meta feedback</strong><p>{template.rejectionReason}</p></div>}
              <div className="template-card-meta">
                <span>Version {template.version}</span>
                <span>Updated {new Date(template.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                {template.submittedAt && <span>Submitted {new Date(template.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>}
              </div>
              {template.versions?.length > 0 && (
                <div className="template-history">
                  <button aria-expanded={expandedHistory === template.id} onClick={() => setExpandedHistory(expandedHistory === template.id ? '' : template.id)} type="button"><History size={13} /> Version history ({template.versions.length})</button>
                  {expandedHistory === template.id && <div className="template-history-list">{template.versions.map((version) => <div key={version.version}><strong>v{version.version}</strong><span>{new Date(version.updatedAt).toLocaleDateString()}</span><p>{version.body}</p></div>)}</div>}
                </div>
              )}
              <footer className="template-card-actions">
                <button className="template-preview-button" onClick={() => setPreviewTemplate(template)} type="button">Preview</button>
                {!readOnly && (
                  <>
                    <button onClick={() => { dispatch(clearTemplateError()); setEditing(template); }} type="button"><Pencil size={13} /> Edit</button>
                    {template.status !== 'APPROVED' && <button className="template-submit-button" disabled={template.status === 'PENDING' || submittingId === template.id} onClick={() => handleSubmit(template)} type="button"><Send size={13} />{submittingId === template.id ? 'Updating…' : template.status === 'PENDING' ? 'In review' : 'Simulate submission'}</button>}
                    <button aria-label={`Delete ${template.name}`} className="template-delete-button" disabled={deletingId === template.id} onClick={() => handleDelete(template)} type="button"><Trash2 size={13} /></button>
                  </>
                )}
                {readOnly && <span className="template-readonly-approved"><CheckCircle2 size={13} /> Team template</span>}
              </footer>
            </article>
          ))}
        </div>
        <footer className="templates-library-foot"><span>Showing {filtered.length} of {items.length} templates</span><span>Demo only: “Simulate submission” records a pending state locally; it does not contact Meta.</span></footer>
      </section>

      {editing !== undefined && <TemplateForm
        busy={saving}
        error={error}
        onClose={() => { setEditing(undefined); dispatch(clearTemplateError()); }}
        onSave={handleSave}
        template={editing}
      />}
      {previewTemplate && <div className="template-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setPreviewTemplate(null)} role="presentation">
        <section aria-label="Template preview" aria-modal="true" className="template-preview-modal" role="dialog">
          <button aria-label="Close preview" className="template-modal-close" onClick={() => setPreviewTemplate(null)} type="button">×</button>
          <TemplatePreview body={previewTemplate.body} category={previewTemplate.category} language={previewTemplate.language} name={previewTemplate.name} />
        </section>
      </div>}
    </div>
  );
}
