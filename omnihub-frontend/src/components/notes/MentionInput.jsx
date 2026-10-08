import { AtSign } from 'lucide-react';
import { useMemo } from 'react';

export default function MentionInput({ value, onChange, agents, onMention }) {
  const query = value.match(/(?:^|\s)@([a-zA-Z0-9._-]*)$/)?.[1];
  const suggestions = useMemo(() => {
    if (query === undefined) return [];
    return agents
      .filter((agent) => agent.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }, [agents, query]);

  const selectAgent = (agent) => {
    const input = document.activeElement;
    const cursor = input?.selectionStart ?? value.length;
    const before = value.slice(0, cursor).replace(/(?:^|\s)@[a-zA-Z0-9._-]*$/, (match) => `${match.startsWith(' ') ? ' ' : ''}@${agent.name}`);
    const next = `${before} ${value.slice(cursor)}`.replace(/\s{2,}/g, ' ');
    onChange(next);
    onMention(agent);
  };

  return (
    <div className="note-mention-wrap">
      <label className="note-field-label" htmlFor="internal-note-content">Note</label>
      <textarea
        id="internal-note-content"
        aria-label="Write an internal note"
        className="lead-note-textarea note-composer-textarea"
        maxLength={2000}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Share context with your team… Type @ to mention someone"
        rows={4}
        value={value}
      />
      {query !== undefined && suggestions.length > 0 && (
        <div className="note-mention-suggestions" role="listbox" aria-label="Team members">
          {suggestions.map((agent) => (
            <button key={agent.id} onClick={() => selectAgent(agent)} type="button">
              <span className="note-mention-avatar">{agent.name.charAt(0)}</span>
              <span>{agent.name}<small>{agent.title}</small></span>
              <AtSign size={13} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
