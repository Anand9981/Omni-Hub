import { CircleHelp } from 'lucide-react';

export default function HelpTooltip({ title = 'Why this matters', children }) {
  return (
    <details className="onboarding-help-tooltip">
      <summary aria-label={title}><CircleHelp size={15} /><span>{title}</span></summary>
      <div role="note">{children}</div>
    </details>
  );
}
