import { useEffect, useMemo, useState } from 'react';
import { BookOpenText, Check, ChevronDown, Command, Heart, Languages, MessageSquareText, Pencil, Plus, Search, Send, Star, Trash2, Zap } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import CannedResponseForm from '../../components/settings/CannedResponseForm.jsx';
import { authService } from '../../services/authDemoService.js';
import {
  clearCannedResponseError,
  deleteCannedResponse,
  loadCannedResponses,
  saveCannedResponse,
  toggleCannedResponseFavorite,
} from '../../store/cannedResponseSlice.js';
import { CANNED_RESPONSE_CATEGORIES, CANNED_RESPONSE_LANGUAGES } from '../../services/cannedResponseService.js';
import { isReadOnly } from '../../utils/permissions.js';

const CATEGORY_ICONS = {
  Pricing: Heart,
  Support: MessageSquareText,
  Sales: Send,
  FAQ: BookOpenText,
};

export default function CannedResponses() {
  const dispatch = useDispatch();
  const { items: responses, status, error } = useSelector((state) => state.cannedResponses);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [language, setLanguage] = useState('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [editingResponse, setEditingResponse] = useState(undefined);
  const [busy, setBusy] = useState(false);
  const readOnly = isReadOnly(authService.getCurrentUser()?.role);

  useEffect(() => { dispatch(loadCannedResponses()); }, [dispatch]);

  const filteredResponses = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return responses.filter((response) => (
      (category === 'All' || response.category === category)
      && (language === 'All' || response.language === language)
      && (!favoritesOnly || response.favorite)
      && (!needle || [
        response.title,
        response.shortcut,
        response.category,
        response.language,
        response.content,
      ].some((value) => value.toLowerCase().includes(needle)))
    )).sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.usageCount - a.usageCount);
  }, [category, favoritesOnly, language, query, responses]);

  const totalUses = responses.reduce((total, response) => total + response.usageCount, 0);
  const favoriteCount = responses.filter((response) => response.favorite).length;

  async function handleSave(response) {
    setBusy(true);
    dispatch(clearCannedResponseError());
    try {
      await dispatch(saveCannedResponse(response)).unwrap();
      setEditingResponse(undefined);
    } catch {
      // The rejected thunk keeps the validation message in Redux for the form.
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(response) {
    if (!window.confirm(`Delete “${response.title}”? This cannot be undone.`)) return;
    dispatch(clearCannedResponseError());
    await dispatch(deleteCannedResponse(response.id));
  }

  return (
    <div className="canned-page">
      <section className="canned-hero">
        <div className="canned-hero-copy">
          <span className="canned-eyebrow"><Zap size={14} /> TEAM VOICE, MADE EFFORTLESS</span>
          <h2>Thoughtful replies,<br /><span>at the speed of a shortcut.</span></h2>
          <p>Give every teammate a consistent, personal answer—ready when the right moment arrives.</p>
          <div className="canned-hero-note"><Command size={14} /><span>Type <kbd>/</kbd> in any conversation to find a reply</span></div>
        </div>
        <div aria-label={`${responses.length} saved replies`} className="canned-hero-visual">
          <span className="canned-hero-orbit canned-hero-orbit--outer" />
          <span className="canned-hero-orbit canned-hero-orbit--inner" />
          <span className="canned-hero-count">{String(responses.length).padStart(2, '0')}</span>
          <span className="canned-hero-label">READY TO SEND</span>
          <span className="canned-hero-shortcut">/pricing</span>
        </div>
      </section>

      <div className="canned-kpis">
        <article><span className="canned-kpi-icon"><MessageSquareText size={17} /></span><div><small>Saved responses</small><strong>{responses.length}</strong></div><span className="canned-kpi-caption">Across your workspace</span></article>
        <article><span className="canned-kpi-icon canned-kpi-icon--amber"><Star size={17} /></span><div><small>Team favorites</small><strong>{favoriteCount}</strong></div><span className="canned-kpi-caption">Pinned for fast access</span></article>
        <article><span className="canned-kpi-icon canned-kpi-icon--mint"><Send size={16} /></span><div><small>Replies sent</small><strong>{totalUses}</strong></div><span className="canned-kpi-caption">Demo usage count</span></article>
        <article><span className="canned-kpi-icon canned-kpi-icon--violet"><Languages size={17} /></span><div><small>Languages</small><strong>{new Set(responses.map((response) => response.language)).size}</strong></div><span className="canned-kpi-caption">English · Hindi · Hinglish</span></article>
      </div>

      <section className="canned-library">
        <header className="canned-library-head">
          <div><span className="canned-section-kicker">REPLY LIBRARY</span><h3>Consistent by design <span>{filteredResponses.length}</span></h3><p>Personalized snippets, team-approved and ready to make your own.</p></div>
          {!readOnly && <button className="canned-create-button" onClick={() => { dispatch(clearCannedResponseError()); setEditingResponse(null); }} type="button"><Plus size={16} /> New response</button>}
        </header>
        <div className="canned-library-toolbar">
          <label className="canned-search"><Search size={16} /><input aria-label="Search canned responses" onChange={(event) => setQuery(event.target.value)} placeholder="Search responses, shortcut or text…" value={query} /></label>
          <label className="canned-filter"><BookOpenText size={14} /><select aria-label="Filter by category" onChange={(event) => setCategory(event.target.value)} value={category}><option>All</option>{CANNED_RESPONSE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={13} /></label>
          <label className="canned-filter"><Languages size={14} /><select aria-label="Filter by language" onChange={(event) => setLanguage(event.target.value)} value={language}><option>All</option>{CANNED_RESPONSE_LANGUAGES.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={13} /></label>
          <button aria-pressed={favoritesOnly} className={`canned-favorite-filter${favoritesOnly ? ' is-active' : ''}`} onClick={() => setFavoritesOnly(!favoritesOnly)} type="button"><Star size={13} /> Favorites</button>
        </div>
        {error && !editingResponse && <div className="alert alert--error" role="alert">{error}<button className="alert-dismiss" onClick={() => dispatch(clearCannedResponseError())} type="button">Dismiss</button></div>}
        {status === 'loading' && !responses.length && <div className="empty-state">Loading your response library…</div>}
        {status !== 'loading' && !filteredResponses.length && <div className="canned-empty"><span><Search size={20} /></span><strong>No replies in this view</strong><small>Try another filter, or create a new response for the team.</small></div>}
        <div className="canned-response-grid">
          {filteredResponses.map((response) => {
            const Icon = CATEGORY_ICONS[response.category] || MessageSquareText;
            return (
              <article className="canned-response-card" key={response.id}>
                <div className="canned-response-top">
                  <span className={`canned-response-icon canned-response-icon--${response.category.toLowerCase()}`}><Icon size={16} /></span>
                  <div className="canned-response-title"><strong>{response.title}</strong><span>{response.category} <i /> {response.language}</span></div>
                  {!readOnly && <button aria-label={`${response.favorite ? 'Remove' : 'Add'} ${response.title} ${response.favorite ? 'from' : 'to'} favorites`} className={`canned-star-button${response.favorite ? ' is-active' : ''}`} onClick={() => dispatch(toggleCannedResponseFavorite(response.id))} type="button"><Star fill={response.favorite ? 'currentColor' : 'none'} size={16} /></button>}
                </div>
                <div className="canned-shortcut-line"><kbd>{response.shortcut}</kbd><span>Slash command</span><span className="canned-usage"><Send size={11} /> {response.usageCount} uses</span></div>
                <p className="canned-response-preview">{response.content}</p>
                <div className="canned-response-variables">{(response.content.match(/\{[^}]+\}/g) || []).map((variable) => <span key={variable}>{variable}</span>)}</div>
                <footer className="canned-response-actions">
                  {!readOnly ? (
                    <>
                      <button onClick={() => { dispatch(clearCannedResponseError()); setEditingResponse(response); }} type="button"><Pencil size={13} /> Edit</button>
                      <button className="canned-delete-button" onClick={() => handleDelete(response)} type="button"><Trash2 size={13} /> Delete</button>
                    </>
                  ) : <span className="canned-readonly-note"><Check size={13} /> Ready for your team</span>}
                </footer>
              </article>
            );
          })}
        </div>
        <footer className="canned-library-foot"><span>Showing {filteredResponses.length} of {responses.length} quick replies</span><span>Saved locally in this browser · usage counts are demo data</span></footer>
      </section>
      {editingResponse !== undefined && (
        <CannedResponseForm
          busy={busy}
          error={error}
          onClose={() => { setEditingResponse(undefined); dispatch(clearCannedResponseError()); }}
          onSave={handleSave}
          response={editingResponse}
        />
      )}
    </div>
  );
}
