import { FileImage, FileText, Link2, Plus, Trash2, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';

const MAX_UPLOAD_BYTES = 1024 * 1024;

export default function MediaUpload({ assets = [], onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [largeFileName, setLargeFileName] = useState('');
  const [fallbackUrl, setFallbackUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const addAsset = (asset) => onChange([...assets, asset]);
  const readFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}. Please choose the file again.`));
    reader.readAsDataURL(file);
  });

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Choose a PDF or image file.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setLargeFileName(file.name);
      setFallbackUrl('');
      return;
    }
    try {
      const dataUrl = await readFile(file);
      addAsset({
        id: `asset-${crypto.randomUUID().slice(0, 8)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        keywords: [],
        fallbackUrl: '',
        dataUrl,
      });
    } catch (readError) {
      setError(readError.message);
    }
  };

  const addFallbackLink = (event) => {
    event.preventDefault();
    if (!/^https:\/\//i.test(fallbackUrl)) {
      setError('Enter a secure HTTPS URL.');
      return;
    }
    addAsset({
      id: `asset-${crypto.randomUUID().slice(0, 8)}`,
      name: largeFileName,
      type: 'application/octet-stream',
      size: 0,
      keywords: [],
      fallbackUrl,
      dataUrl: '',
    });
    setLargeFileName('');
    setFallbackUrl('');
  };

  const addLink = (event) => {
    event.preventDefault();
    if (!linkName.trim() || !/^https:\/\//i.test(linkUrl.trim())) {
      setError('Add a name and a secure HTTPS URL.');
      return;
    }
    addAsset({
      id: `asset-${crypto.randomUUID().slice(0, 8)}`,
      name: linkName.trim(),
      type: 'application/octet-stream',
      size: 0,
      keywords: [],
      fallbackUrl: linkUrl.trim(),
      dataUrl: '',
    });
    setLinkName('');
    setLinkUrl('');
    setError('');
  };

  const updateAsset = (id, updates) => onChange(assets.map((asset) => asset.id === id ? { ...asset, ...updates } : asset));

  return (
    <section className="menu-media-section">
      <header className="menu-builder-section-head">
        <span className="menu-builder-section-icon"><FileImage size={15} /></span>
        <div><strong>Media library</strong><small>PDFs and images matched to customer keywords.</small></div>
        <input accept="image/*,application/pdf" className="menu-media-input" onChange={handleFile} ref={inputRef} type="file" />
        <button className="menu-add-button" onClick={() => inputRef.current?.click()} type="button"><UploadCloud size={13} /> Upload file</button>
      </header>
      {error && <p className="menu-form-error" role="alert">{error}</p>}
      {largeFileName && (
        <form className="menu-fallback-form" onSubmit={addFallbackLink}>
          <span>{largeFileName} exceeds the 1 MB local-demo upload limit. Add a secure HTTPS fallback URL.</span>
          <label><Link2 size={13} /><input aria-label="HTTPS media fallback URL" onChange={(event) => setFallbackUrl(event.target.value)} placeholder="https://…" value={fallbackUrl} /></label>
          <button disabled={!fallbackUrl.trim()} type="submit">Save link</button>
          <button className="menu-fallback-cancel" onClick={() => setLargeFileName('')} type="button">Cancel</button>
        </form>
      )}
      {!assets.length && <p className="menu-media-empty">No media assets yet. Add a PDF, image or HTTPS fallback link.</p>}
      <div className="menu-media-list">
        {assets.map((asset) => (
          <article className="menu-media-card" key={asset.id}>
            <span className="menu-media-type">{asset.type === 'application/pdf' ? <FileText size={16} /> : <FileImage size={16} />}</span>
            <div className="menu-media-copy"><strong>{asset.name}</strong><small>{asset.dataUrl ? `${(asset.size / 1024).toFixed(0)} KB · Local attachment` : `HTTPS fallback${asset.fallbackUrl ? ` · ${asset.fallbackUrl}` : ''}`}</small></div>
            <label className="menu-keywords-field"><span>Match keywords</span><input onChange={(event) => updateAsset(asset.id, { keywords: event.target.value.split(',').map((word) => word.trim()).filter(Boolean) })} placeholder="brochure, catalog, pricing" value={asset.keywords.join(', ')} /></label>
            <button aria-label={`Remove ${asset.name}`} className="menu-remove-button" onClick={() => onChange(assets.filter((item) => item.id !== asset.id))} type="button"><Trash2 size={14} /></button>
          </article>
        ))}
      </div>
      <form className="menu-fallback-form menu-add-link-form" onSubmit={addLink}>
        <label><span>Link name</span><input onChange={(event) => setLinkName(event.target.value)} placeholder="Product brochure" value={linkName} /></label>
        <label><Link2 size={13} /><input aria-label="Secure media URL" onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://…" value={linkUrl} /></label>
        <button disabled={!linkName.trim() || !linkUrl.trim()} type="submit"><Plus size={13} /> Add a fallback link</button>
      </form>
    </section>
  );
}
