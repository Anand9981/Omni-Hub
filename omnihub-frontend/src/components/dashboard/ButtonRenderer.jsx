import { CornerDownLeft, Home } from 'lucide-react';

export default function ButtonRenderer({ buttons = [], platform, onSelect, onBack, onMainMenu, canGoBack = false, compact = false }) {
  if (!buttons.length && !canGoBack) return null;
  const discordRows = platform === 'discord';
  return (
    <div className={`interactive-button-renderer${compact ? ' is-compact' : ''}${discordRows ? ' is-discord' : ''}`}>
      <div className="chat-buttons-wrap">
        {buttons.map((button) => (
          <button
            className="chat-button-chip interactive-menu-button"
            key={button.id || button.title || button.label}
            onClick={() => onSelect?.(button)}
            type="button"
          >
            {button.title || button.label || button}
          </button>
        ))}
      </div>
      {(canGoBack || onMainMenu) && (
        <div className="interactive-menu-navigation">
          {canGoBack && <button onClick={onBack} type="button"><CornerDownLeft size={12} /> Back</button>}
          {onMainMenu && <button onClick={onMainMenu} type="button"><Home size={12} /> Main menu</button>}
        </div>
      )}
    </div>
  );
}
