import { useState } from 'react';
import { ArrowDown, ArrowUp, ChevronRight, Layers3, Plus, Save, X } from 'lucide-react';
import { menuService } from '../../services/menuService.js';
import MediaUpload from './MediaUpload.jsx';
import MenuPreview from './MenuPreview.jsx';

const ACTIONS = [
  { id: 'submenu', label: 'Open submenu' },
  { id: 'reply', label: 'Send a reply' },
  { id: 'input', label: 'Ask for a message' },
  { id: 'handover', label: 'Request a human' },
  { id: 'media', label: 'Send media' },
];

function newButton(label = 'New option') {
  return { id: `button-${crypto.randomUUID().slice(0, 8)}`, label, action: 'reply', reply: '', media_id: '', children: [] };
}

function ButtonEditor({ buttons, depth = 1, platform, mediaAssets, onChange }) {
  const setButtons = onChange;

  const updateButton = (index, changes) => {
    const next = buttons.map((button, itemIndex) => itemIndex === index ? { ...button, ...changes } : button);
    setButtons(next);
  };
  const removeButton = (index) => setButtons(buttons.filter((_, itemIndex) => itemIndex !== index));
  const reorderButton = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= buttons.length) return;
    const next = [...buttons];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setButtons(next);
  };
  const limit = menuService.platformLimits[platform];
  const canAdd = !Number.isFinite(limit) || buttons.length < limit;

  return (
    <div className={`menu-button-editor-list${depth > 1 ? ' is-nested' : ''}`}>
      {buttons.map((button, index) => (
        <article className="menu-button-editor-card" key={button.id}>
          <div className="menu-button-editor-top">
            <span className="menu-button-index">{String(index + 1).padStart(2, '0')}</span>
            <input aria-label={`Button ${index + 1} label`} maxLength={40} onChange={(event) => updateButton(index, { label: event.target.value })} value={button.label} />
            <button aria-label="Move option up" disabled={index === 0} onClick={() => reorderButton(index, -1)} type="button"><ArrowUp size={13} /></button>
            <button aria-label="Move option down" disabled={index === buttons.length - 1} onClick={() => reorderButton(index, 1)} type="button"><ArrowDown size={13} /></button>
            <button aria-label={`Remove ${button.label}`} className="menu-remove-button" onClick={() => removeButton(index)} type="button"><X size={14} /></button>
          </div>
          <div className="menu-button-editor-fields">
            <label>Button action
              <select onChange={(event) => updateButton(index, {
                action: event.target.value,
                children: event.target.value === 'submenu' ? (button.children.length ? button.children : [newButton('First option')]) : [],
              })} value={button.action}>
                {ACTIONS.map((action) => <option disabled={action.id === 'submenu' && depth >= 3} key={action.id} value={action.id}>{action.label}</option>)}
              </select>
            </label>
            {button.action === 'reply' && <label>Automated reply
              <textarea maxLength={500} onChange={(event) => updateButton(index, { reply: event.target.value })} placeholder="Write the response shown after the customer selects this option…" rows={2} value={button.reply} />
            </label>}
            {button.action === 'media' && <label>Media attachment
              <select onChange={(event) => updateButton(index, { media_id: event.target.value })} value={button.media_id}>
                <option value="">Choose an asset</option>
                {mediaAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
              </select>
              {!mediaAssets.length && <small>Add an asset in the Media library below.</small>}
            </label>}
          </div>
          {button.action === 'submenu' && depth < 3 && (
            <div className="menu-nested-editor">
              <div><Layers3 size={13} /> Level {depth + 1} options</div>
              <ButtonEditor
                buttons={button.children}
                depth={depth + 1}
                mediaAssets={mediaAssets}
                onChange={(next) => updateButton(index, { children: next })}
                platform={platform}
              />
              {(!Number.isFinite(limit) || button.children.length < limit) && (
                <button className="menu-nested-add" onClick={() => updateButton(index, { children: [...button.children, newButton()] })} type="button"><Plus size={12} /> Add nested option</button>
              )}
            </div>
          )}
        </article>
      ))}
      {canAdd && <button className="menu-add-button menu-add-root" onClick={() => setButtons([...buttons, newButton()])} type="button"><Plus size={13} /> Add {depth === 1 ? 'menu button' : 'option'}</button>}
      {Number.isFinite(limit) && <small className="menu-button-limit">{buttons.length} of {limit} buttons at this level</small>}
    </div>
  );
}

export default function MenuBuilder({ initialPlatform = 'whatsapp', onClose, onSendMenu }) {
  const [platform, setPlatform] = useState(initialPlatform);
  const [menu, setMenu] = useState(() => menuService.getMenu(initialPlatform));
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [sending, setSending] = useState(false);

  const choosePlatform = (nextPlatform) => {
    setPlatform(nextPlatform);
    setMenu(menuService.getMenu(nextPlatform));
    setError('');
    setSaved(false);
  };

  const save = () => {
    setError('');
    setSaved(false);
    try {
      const savedMenu = menuService.saveMenu(menu);
      setMenu(savedMenu);
      setSaved(true);
      return savedMenu;
    } catch (saveError) {
      setError(saveError.message);
      return null;
    }
  };

  const sendTestMenu = async () => {
    const savedMenu = save();
    if (!savedMenu || !onSendMenu) return;
    setSending(true);
    try {
      await onSendMenu(savedMenu);
      onClose?.();
    } catch (sendError) {
      setError(sendError.message || 'The test menu could not be sent.');
    } finally {
      setSending(false);
    }
  };

  const changeRootButtons = (next) => setMenu((current) => ({ ...current, buttons: next }));

  return (
    <div className="menu-builder-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()} role="presentation">
      <section aria-labelledby="menu-builder-title" aria-modal="true" className="menu-builder-modal" role="dialog">
        <header className="menu-builder-header">
          <div><span className="menu-builder-eyebrow"><Layers3 size={13} /> INTERACTIVE MENU STUDIO</span><h2 id="menu-builder-title">Guide the next conversation.</h2><p>Design button-led paths, attach useful resources, and preview the customer experience.</p></div>
          <button aria-label="Close menu builder" className="menu-builder-close" onClick={onClose} type="button"><X size={17} /></button>
        </header>
        <div className="menu-builder-platform-bar">
          <label>Platform <span>{platform}</span></label>
          <select aria-label="Menu platform" onChange={(event) => choosePlatform(event.target.value)} value={platform}>
            {menuService.platforms.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <small>Button limits follow the platform’s native interaction rules.</small>
        </div>
        <div className="menu-builder-layout">
          <div className="menu-builder-form">
            <section className="menu-builder-section">
              <header className="menu-builder-section-head"><span className="menu-builder-section-icon"><ChevronRight size={15} /></span><div><strong>Welcome message</strong><small>The opener shown with the primary menu.</small></div></header>
              <textarea aria-label="Welcome message" className="menu-welcome-input" maxLength={500} onChange={(event) => setMenu((current) => ({ ...current, welcomeMessage: event.target.value }))} rows={3} value={menu.welcomeMessage} />
              <span className="menu-char-count">{menu.welcomeMessage.length}/500</span>
            </section>
            <section className="menu-builder-section">
              <header className="menu-builder-section-head"><span className="menu-builder-section-icon menu-builder-section-icon--violet"><Layers3 size={15} /></span><div><strong>Button flow</strong><small>Up to 3 levels deep · Back and Main menu are previewed automatically.</small></div></header>
              <ButtonEditor
                buttons={menu.buttons}
                depth={1}
                mediaAssets={menu.mediaAssets}
                onChange={changeRootButtons}
                platform={platform}
              />
            </section>
            <MediaUpload assets={menu.mediaAssets} onChange={(mediaAssets) => setMenu((current) => ({ ...current, mediaAssets }))} />
          </div>
          <aside className="menu-builder-preview"><MenuPreview menu={menu} /></aside>
        </div>
        {error && <div className="menu-builder-error" role="alert">{error}</div>}
        <footer className="menu-builder-footer">
          <span>{saved ? 'Menu saved to this browser' : menu.updatedAt ? `Last saved ${new Date(menu.updatedAt).toLocaleString()}` : 'Frontend-only menu configuration · no message is sent automatically'}</span>
          <button className="secondary-button" onClick={onClose} type="button">Close</button>
          {onSendMenu && <button className="secondary-button menu-send-test" disabled={sending} onClick={sendTestMenu} type="button">
            {sending ? 'Sending…' : 'Send test menu to thread'}
          </button>}
          <button className="primary-button" onClick={save} type="button"><Save size={15} /> {saved ? 'Saved' : 'Save menu'}</button>
        </footer>
      </section>
    </div>
  );
}
