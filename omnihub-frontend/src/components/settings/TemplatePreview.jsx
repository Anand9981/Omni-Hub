import { CheckCheck, Clock3, ShieldCheck } from 'lucide-react';

const SAMPLE_VALUES = {
  customer_name: 'Alex Morgan',
  order_id: 'OH-48291',
  amount: '$84.00',
  date: 'October 5',
  business_name: 'Northstar Studio',
};

function renderBody(body) {
  return body.replace(/\{\{([a-z_]+)\}\}/g, (token, key) => SAMPLE_VALUES[key] || token);
}

export default function TemplatePreview({ body, language, category, name }) {
  const rendered = renderBody(body || '');

  // Extract unique variable names used in the body.
  const usedVariables = [...new Set(
    [...(body || '').matchAll(/\{\{([a-z_]+)\}\}/g)].map((m) => m[1]),
  )].filter((key) => SAMPLE_VALUES[key]);

  return (
    <section className="template-preview-panel" aria-label="WhatsApp template preview">
      <header className="template-preview-head">
        <span><span className="template-preview-live-dot" /> LIVE PREVIEW</span>
        <span>WhatsApp</span>
      </header>
      <div className="template-preview-phone">
        <div className="template-preview-phone-head">
          <span className="template-preview-contact-avatar">N</span>
          <span>
            <strong>Northstar Studio</strong>
            <small>Business account</small>
          </span>
          <ShieldCheck size={15} />
        </div>
        <div className="template-preview-day">TODAY</div>
        <div className="template-chat-bubble">
          <small>{name || 'template_name'} · {category || 'Category'} · {language || 'Language'}</small>
          <p>{rendered || 'Your message preview will appear here as you write.'}</p>
          <span>10:42 <CheckCheck size={12} /></span>
        </div>
        <div className="template-preview-window"><Clock3 size={12} /> Template message · Sent outside the 24-hour customer-service window</div>
      </div>
      <footer className="template-preview-variables">
        <strong>Example variables</strong>
        {usedVariables.length > 0
          ? usedVariables.map((key) => (
            <span key={key}>
              {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} <b>{SAMPLE_VALUES[key]}</b>
            </span>
          ))
          : <span style={{ fontStyle: 'italic', opacity: 0.7 }}>No variables used</span>}
      </footer>
    </section>
  );
}
