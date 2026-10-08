import { useEffect, useMemo, useState } from 'react';
import { Bot, RotateCcw, Smartphone } from 'lucide-react';
import ButtonRenderer from './ButtonRenderer.jsx';
import { menuService } from '../../services/menuService.js';

export default function MenuPreview({ menu }) {
  const [path, setPath] = useState([]);
  const [response, setResponse] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [handover, setHandover] = useState(false);
  const [previewAsset, setPreviewAsset] = useState(null);
  useEffect(() => {
    setPath([]);
    setResponse('');
    setPreviewAsset(null);
    setHandover(false);
  }, [menu.platform]);
  const currentButtons = useMemo(() => {
    return path.reduce((buttons, id) => {
      const selected = buttons.find((item) => item.id === id);
      return selected?.children || [];
    }, menu.buttons);
  }, [menu.buttons, path]);
  const selectedButton = useMemo(() => {
    let buttons = menu.buttons;
    const chain = [];
    path.forEach((id) => {
      const selected = buttons.find((item) => item.id === id);
      if (selected) {
        chain.push(selected);
        buttons = selected.children || [];
      }
    });
    return chain;
  }, [menu.buttons, path]);
  const isNested = path.length > 0;

  const choose = (button) => {
    if (button.action === 'submenu') {
      setPath((current) => [...current, button.id]);
      setResponse('');
      setPreviewAsset(null);
      setHandover(false);
      return;
    }
    if (button.action === 'input') {
      setPreviewAsset(null);
      setResponse('A custom reply box is ready for the customer.');
      return;
    }
    if (button.action === 'handover') {
      setPreviewAsset(null);
      setHandover(true);
      setResponse(button.reply || 'A teammate will join this conversation shortly.');
      return;
    }
    if (button.action === 'media') {
      const asset = menu.mediaAssets.find((item) => item.id === button.media_id);
      setPreviewAsset(asset || null);
      setResponse(asset ? `Media attached: ${asset.name}` : 'No media is attached to this option yet.');
      return;
    }
    setPreviewAsset(null);
    setResponse(button.reply);
  };

  const sendCustomInput = (event) => {
    event.preventDefault();
    if (!customInput.trim()) return;
    setResponse(`Customer query: ${customInput.trim()}`);
    setCustomInput('');
  };

  return (
    <section className="menu-preview" aria-label="Interactive menu preview">
      <header className="menu-preview-head">
        <span><Smartphone size={15} /> CUSTOMER PREVIEW</span>
        <span>{menuService.platforms.find((item) => item.id === menu.platform)?.label || menu.platform}</span>
      </header>
      <div className="menu-preview-thread">
        <div className="menu-preview-message">
          <span className="menu-preview-bot"><Bot size={13} /></span>
          <div><small>{isNested ? selectedButton.at(-1)?.label : 'OmniHub assistant'}</small><p>{isNested ? selectedButton.at(-1)?.reply || `Choose an option for ${selectedButton.at(-1)?.label}.` : menu.welcomeMessage}</p></div>
        </div>
        {response && (
          <div className={`menu-preview-response${handover ? ' is-handover' : ''}`}>
            <span>{handover ? 'Handover preview' : 'Flow response'}</span>{response}
            {previewAsset?.dataUrl?.startsWith('data:image/') && <img alt={previewAsset.name} className="menu-preview-image" src={previewAsset.dataUrl} />}
            {previewAsset?.fallbackUrl && <a href={previewAsset.fallbackUrl} rel="noreferrer" target="_blank">{previewAsset.name} <span>Open secure link</span></a>}
          </div>
        )}
        <ButtonRenderer
          buttons={currentButtons}
          canGoBack={isNested}
          onBack={() => { setPath((current) => current.slice(0, -1)); setResponse(''); }}
          onMainMenu={isNested ? () => { setPath([]); setResponse(''); setHandover(false); } : null}
          onSelect={choose}
          platform={menu.platform}
        />
        {response === 'A custom reply box is ready for the customer.' && (
          <form className="menu-preview-input" onSubmit={sendCustomInput}>
            <input aria-label="Preview customer query" onChange={(event) => setCustomInput(event.target.value)} placeholder="Type a customer question…" value={customInput} />
            <button disabled={!customInput.trim()} type="submit">Send</button>
          </form>
        )}
      </div>
      <footer className="menu-preview-foot">
        <button onClick={() => { setPath([]); setResponse(''); setPreviewAsset(null); setHandover(false); }} type="button"><RotateCcw size={12} /> Reset preview</button>
        <span>Click options to walk through the flow</span>
      </footer>
    </section>
  );
}
