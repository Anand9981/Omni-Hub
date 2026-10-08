import { Bot, UserRound } from 'lucide-react';

/**
 * PRD 9.4 - per-conversation Auto-Pilot switch.
 *
 * ON  : AI and interactive-menu responses are enabled for the thread.
 * OFF : takeover mode, every automated trigger is disabled and only the
 *       assigned human agent replies.
 */
export default function AutoPilotToggle({ enabled, onChange, disabled = false, compact = false }) {
  return (
    <div className={`autopilot${enabled ? ' is-on' : ''}${compact ? ' autopilot--compact' : ''}`}>
      <span className="autopilot-icon">
        {enabled ? <Bot size={16} /> : <UserRound size={16} />}
      </span>
      <span className="autopilot-copy">
        <strong>Auto-Pilot {enabled ? 'ON' : 'OFF'}</strong>
        <small>{enabled ? 'AI and menu replies enabled' : 'Human agent has taken over'}</small>
      </span>
      <button
        aria-checked={enabled}
        aria-label="Toggle Auto-Pilot for this conversation"
        className="switch"
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        role="switch"
        type="button"
      >
        <span className="switch-knob" />
      </button>
    </div>
  );
}