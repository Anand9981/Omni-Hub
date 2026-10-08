import { MessageCircle, X } from 'lucide-react';

export default function WidgetLauncher({ open, onClick, primaryColor, label = 'Open chat' }) {
  return (
    <button
      aria-expanded={open}
      aria-label={open ? 'Close chat' : label}
      className={`omni-widget-launcher${open ? ' is-open' : ''}`}
      onClick={onClick}
      style={{ '--widget-primary': primaryColor }}
      type="button"
    >
      {open ? <X size={22} /> : <MessageCircle size={23} />}
      {!open && <span className="omni-widget-launcher-ping" aria-hidden="true" />}
    </button>
  );
}
