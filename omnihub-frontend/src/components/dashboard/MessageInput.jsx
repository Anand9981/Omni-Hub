import { useEffect, useMemo, useRef, useState } from 'react';
import { CornerDownLeft, FileCheck2, MessageSquareText, Send } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { selectDraft, selectIsTyping, setDraft } from '../../store/messageSlice.js';
import { loadCannedResponses, useCannedResponse } from '../../store/cannedResponseSlice.js';
import AIPolishButton from './AIPolishButton.jsx';
import QuickReplyMenu from './QuickReplyMenu.jsx';
import { loadTemplates } from '../../store/templateSlice.js';
import AISuggestionsBar from './AISuggestionsBar.jsx';

/**
 * Agent composer.
 *
 * PRD 9.4 - when Auto-Pilot is OFF the thread is under human takeover, so the
 * composer is the primary way a reply is produced. Enter sends, Shift+Enter
 * adds a newline.
 */
export default function MessageInput({
  conversationId,
  conversation,
  messages = [],
  customerName,
  businessName,
  onSend,
  sending = false,
  disabled = false,
  readOnly = false,
  platform,
}) {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const draft = useSelector(selectDraft(conversationId));
  const peerTyping = useSelector(selectIsTyping(conversationId));
  const { items: responses, status: responseStatus, error: responseError } = useSelector((state) => state.cannedResponses);
  const { items: templates, status: templateStatus } = useSelector((state) => state.templates);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMode, setMenuMode] = useState('recent');
  const [slashRange, setSlashRange] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateVariables, setTemplateVariables] = useState({});

  useEffect(() => {
    if (responseStatus === 'idle') dispatch(loadCannedResponses());
  }, [dispatch, responseStatus]);

  useEffect(() => {
    if (platform === 'whatsapp' && templateStatus === 'idle') dispatch(loadTemplates());
  }, [dispatch, platform, templateStatus]);

  const menuQuery = slashRange ? draft.slice(slashRange.start, slashRange.end) : '';
  const matchingResponses = useMemo(() => {
    const needle = menuQuery.replace(/^\//, '').toLowerCase();
    return responses.filter((response) => {
      if (menuMode === 'favorites' && !response.favorite) return false;
      return !needle || [
        response.title,
        response.shortcut,
        response.category,
        response.language,
        response.content,
      ].some((value) => value.toLowerCase().includes(needle));
    }).sort((a, b) => menuMode === 'recent'
      ? new Date(b.lastUsedAt || 0) - new Date(a.lastUsedAt || 0) || b.usageCount - a.usageCount
      : Number(b.favorite) - Number(a.favorite) || b.usageCount - a.usageCount);
  }, [menuMode, menuQuery, responses]);
  const approvedTemplates = useMemo(
    () => templates.filter((template) => template.status === 'APPROVED'),
    [templates],
  );

  function update(value) {
    dispatch(setDraft({ conversationId, text: value }));
  }

  function inspectSlashCommand(value, caret) {
    const beforeCaret = value.slice(0, caret);
    const match = beforeCaret.match(/(^|\s)(\/[^\s/]*)$/);
    if (match) {
      setTemplatesOpen(false);
      setSelectedTemplate(null);
      const start = beforeCaret.length - match[2].length;
      setSlashRange({ start, end: caret });
      setMenuMode('recent');
      setSelectedIndex(0);
      setMenuOpen(true);
      return;
    }
    setSlashRange(null);
    if (slashRange) setMenuOpen(false);
  }

  function insertText(text, range = null) {
    const input = inputRef.current;
    const start = range?.start ?? input?.selectionStart ?? draft.length;
    const end = range?.end ?? input?.selectionEnd ?? draft.length;
    const before = draft.slice(0, start);
    const after = draft.slice(end);
    const needsPrefixSpace = before.length > 0 && !/\s$/.test(before);
    const needsSuffixSpace = after.length > 0 && !/^\s/.test(after);
    const insertion = `${needsPrefixSpace ? ' ' : ''}${text}${needsSuffixSpace ? ' ' : ''}`;
    const next = `${before}${insertion}${after}`;
    update(next);
    setMenuOpen(false);
    setSlashRange(null);
    requestAnimationFrame(() => {
      if (!input) return;
      const caret = before.length + insertion.length;
      input.focus();
      input.setSelectionRange(caret, caret);
    });
  }

  async function chooseResponse(response) {
    const inputRange = slashRange;
    const variables = {
      customer_name: customerName || 'there',
      business_name: businessName || 'our team',
    };
    const result = await dispatch(useCannedResponse({ responseId: response.id, variables })).unwrap();
    insertText(result.content, inputRange);
  }

  function chooseTemplate(template) {
    const variables = [...new Set([...template.body.matchAll(/\{\{([a-z_]+)\}\}/g)].map((match) => match[1]))];
    setSelectedTemplate(template);
    setTemplateVariables(Object.fromEntries(variables.map((name) => [
      name,
      name === 'customer_name' ? customerName || '' : name === 'business_name' ? businessName || 'OmniHub' : '',
    ])));
  }

  function insertApprovedTemplate() {
    if (!selectedTemplate) return;
    const variables = [...new Set([...selectedTemplate.body.matchAll(/\{\{([a-z_]+)\}\}/g)].map((match) => match[1]))];
    if (variables.some((name) => !templateVariables[name]?.trim())) return;
    const message = selectedTemplate.body.replace(/\{\{([a-z_]+)\}\}/g, (_, name) => templateVariables[name].trim());
    insertText(message);
    setSelectedTemplate(null);
    setTemplatesOpen(false);
  }

  function submit() {
    if (!draft.trim() || sending || disabled) return;
    onSend(draft.trim());
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape' && menuOpen) {
      event.preventDefault();
      setMenuOpen(false);
      setSlashRange(null);
      return;
    }

    if (menuOpen && ['ArrowDown', 'ArrowUp'].includes(event.key) && matchingResponses.length) {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setSelectedIndex((current) => (current + direction + matchingResponses.length) % matchingResponses.length);
      return;
    }

    if (menuOpen && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (matchingResponses[selectedIndex]) chooseResponse(matchingResponses[selectedIndex]);
      return;
    }

    if (event.ctrlKey && /^[1-9]$/.test(event.key)) {
      const response = responses.filter((item) => item.favorite).sort((a, b) => (
        new Date(b.lastUsedAt || 0) - new Date(a.lastUsedAt || 0) || b.usageCount - a.usageCount
      ))[Number(event.key) - 1];
      if (response) {
        event.preventDefault();
        chooseResponse(response);
      }
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className={`composer${disabled ? ' is-disabled' : ''}`}>
      {peerTyping && <div className="composer-typing"><span /><span /><span /> Customer is typing…</div>}
      {menuOpen && (
        <QuickReplyMenu
          mode={menuMode}
          onClose={() => { setMenuOpen(false); setSlashRange(null); }}
          onModeChange={(mode) => { setMenuMode(mode); setSelectedIndex(0); }}
          onSelect={chooseResponse}
          query={menuQuery}
          responses={responses}
          selectedIndex={selectedIndex}
          error={responseError}
        />
      )}
      {templatesOpen && (
        <div className="composer-template-menu" role="dialog" aria-label="Approved WhatsApp templates">
          <div className="composer-template-menu-head">
            <span><FileCheck2 size={14} /> Approved WhatsApp templates</span>
            <button aria-label="Close templates" onClick={() => { setTemplatesOpen(false); setSelectedTemplate(null); }} type="button">×</button>
          </div>
          <p className="composer-template-window-hint">For conversations outside the 24-hour customer-service window.</p>
          {templateStatus === 'loading' && <div className="composer-template-empty">Loading templates…</div>}
          {templateStatus !== 'loading' && !approvedTemplates.length && <div className="composer-template-empty">No approved templates available. Add and get a template approved in Settings.</div>}
          {selectedTemplate ? (
            <div className="composer-template-fill">
              <button className="composer-template-back" onClick={() => setSelectedTemplate(null)} type="button">‹ All approved templates</button>
              <strong>{selectedTemplate.name} · {selectedTemplate.language}</strong>
              {[...new Set([...selectedTemplate.body.matchAll(/\{\{([a-z_]+)\}\}/g)].map((match) => match[1]))].map((variable) => (
                <label key={variable}>{variable.replaceAll('_', ' ')}
                  <input autoFocus={variable === 'customer_name'} onChange={(event) => setTemplateVariables((current) => ({ ...current, [variable]: event.target.value }))} placeholder={`Enter ${variable.replaceAll('_', ' ')}`} value={templateVariables[variable] || ''} />
                </label>
              ))}
              <button className="composer-template-insert" disabled={[...new Set([...selectedTemplate.body.matchAll(/\{\{([a-z_]+)\}\}/g)].map((match) => match[1]))].some((variable) => !templateVariables[variable]?.trim())} onClick={insertApprovedTemplate} type="button">Insert into reply</button>
            </div>
          ) : approvedTemplates.map((template) => (
            <button className="composer-template-option" key={template.id} onClick={() => chooseTemplate(template)} type="button">
              <span><strong>{template.name}</strong><small>{template.category} · {template.language}</small></span>
              <span>{(template.body.match(/\{\{[^}]+\}\}/g) || []).length} variables</span>
            </button>
          ))}
        </div>
      )}

      {!readOnly && (
        <AISuggestionsBar
          conversation={conversation}
          messages={messages}
          onSelectSuggestion={(text) => {
            update(text);
            inputRef.current?.focus();
          }}
        />
      )}

      <div className="composer-box">
        <textarea
          aria-label="Write a reply"
          disabled={disabled || readOnly}
          onChange={(event) => {
            update(event.target.value);
            inspectSlashCommand(event.target.value, event.target.selectionStart);
          }}
          onKeyDown={handleKeyDown}
          placeholder={readOnly ? 'Switch Auto-Pilot OFF to reply as a human agent.' : 'Write a thoughtful reply…  (Enter to send, Shift+Enter for a new line)'}
          ref={inputRef}
          rows={3}
          value={draft}
        />
        <div className="composer-tools">
          <div className="composer-tools-left">
            <button
              aria-expanded={menuOpen}
              className="quick-reply-trigger"
              disabled={disabled || readOnly}
              onClick={() => {
                setMenuMode('recent');
                setSlashRange(null);
                setSelectedIndex(0);
                setMenuOpen((open) => !open);
                inputRef.current?.focus();
              }}
              type="button"
            >
              <MessageSquareText size={15} /> Quick reply <kbd>/</kbd>
            </button>
            {platform === 'whatsapp' && (
              <button
                aria-expanded={templatesOpen}
                className="whatsapp-template-trigger"
                disabled={disabled || readOnly || templateStatus === 'error'}
                onClick={() => { setMenuOpen(false); setTemplatesOpen((open) => !open); setSelectedTemplate(null); }}
                type="button"
              >
                <FileCheck2 size={14} /> WA template
              </button>
            )}
            <AIPolishButton
              disabled={disabled || readOnly}
              onPolished={(text) => update(text)}
              text={draft}
            />
            <span className="composer-hint"><CornerDownLeft size={13} /> Enter to send</span>
          </div>
          <div className="composer-tools-right">
            <span className="composer-count">{draft.length}</span>
            <button
              className="primary-button composer-send"
              disabled={!draft.trim() || sending || disabled || readOnly}
              onClick={submit}
              type="button"
            >
              <Send size={16} /> {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}