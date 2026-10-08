import { useEffect, useState } from 'react';
import { ArrowRight, Check, CircleHelp, UserRound, X, Zap } from 'lucide-react';
import AgentStatusBadge from '../agents/AgentStatusBadge.jsx';

const STRATEGIES = [
  { id: 'roundRobin', label: 'Round-robin', detail: 'Distribute new chats evenly in sequence', icon: ArrowRight },
  { id: 'load', label: 'Balance workload', detail: 'Route to the online agent with the most room', icon: Zap },
  { id: 'skill', label: 'Match expertise', detail: 'Prioritise agent skills relevant to this channel', icon: Check },
  { id: 'territory', label: 'Match territory', detail: 'Prioritise regional coverage, then availability', icon: CircleHelp },
];

export default function AssignAgentModal({
  agents,
  currentAgentId,
  loading = false,
  error,
  onClose,
  onAssign,
  onAutoAssign,
}) {
  const [selectedAgentId, setSelectedAgentId] = useState(currentAgentId || '');
  const [strategy, setStrategy] = useState('load');

  useEffect(() => setSelectedAgentId(currentAgentId || ''), [currentAgentId]);

  const availableAgents = agents.filter((agent) => (
    (agent.status === 'online' && agent.availableSlots > 0) || agent.id === currentAgentId
  ));

  return (
    <div className="assign-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()} role="presentation">
      <section aria-labelledby="assign-modal-title" aria-modal="true" className="assign-modal" role="dialog">
        <header className="assign-modal-head">
          <span className="assign-modal-mark"><UserRound size={18} /></span>
          <div><h2 id="assign-modal-title">Assign conversation</h2><p>Choose an available teammate or let OmniHub route it.</p></div>
          <button aria-label="Close assignment dialog" className="assign-modal-close" onClick={onClose} type="button"><X size={18} /></button>
        </header>

        <div className="assign-modal-section">
          <span className="assign-modal-label">AVAILABLE TEAMMATES <i>{availableAgents.length}</i></span>
          <div className="assign-agent-list">
            <button
              aria-pressed={!selectedAgentId}
              className={`assign-agent-option${!selectedAgentId ? ' is-selected' : ''}`}
              onClick={() => setSelectedAgentId('')}
              type="button"
            >
              <span className="assign-queue-icon"><UserRound size={15} /></span>
              <span className="assign-agent-copy"><strong>Unassigned queue</strong><small>Leave this conversation waiting for an available teammate</small></span>
              <span className="assign-agent-check">{!selectedAgentId && <Check size={14} />}</span>
            </button>
            {availableAgents.map((agent) => (
              <button
                aria-pressed={selectedAgentId === agent.id}
                className={`assign-agent-option${selectedAgentId === agent.id ? ' is-selected' : ''}`}
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                type="button"
              >
                <span className="agent-avatar agent-avatar--sm">{agent.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
                <span className="assign-agent-copy"><strong>{agent.name}</strong><small>{agent.activeChats}/{agent.maxConcurrentChats} chats · {agent.skills.slice(0, 2).join(' · ')}</small></span>
                <AgentStatusBadge status={agent.status} />
                <span className="assign-agent-check">{selectedAgentId === agent.id && <Check size={14} />}</span>
              </button>
            ))}
            {!availableAgents.length && <p className="assign-empty">No online agents have capacity. This conversation can stay in the unassigned queue.</p>}
          </div>
        </div>

        <div className="assign-modal-section">
          <span className="assign-modal-label">AUTO-ASSIGNMENT METHOD</span>
          <div className="assign-strategies">
            {STRATEGIES.map(({ id, label, detail, icon: Icon }) => (
              <button
                aria-pressed={strategy === id}
                className={`assign-strategy${strategy === id ? ' is-selected' : ''}`}
                key={id}
                onClick={() => setStrategy(id)}
                type="button"
              >
                <Icon size={15} /><span><strong>{label}</strong><small>{detail}</small></span>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="assign-modal-error" role="alert">{error}</p>}
        <footer className="assign-modal-actions">
          <button className="secondary-button" disabled={loading} onClick={onClose} type="button">Cancel</button>
          <button className="secondary-button assign-auto-button" disabled={loading || !availableAgents.length} onClick={() => onAutoAssign(strategy)} type="button">
            <Zap size={15} /> Auto-assign
          </button>
          <button className="primary-button" disabled={loading || selectedAgentId === (currentAgentId || '')} onClick={() => onAssign(selectedAgentId || null)} type="button">
            {selectedAgentId ? 'Assign conversation' : 'Move to queue'} <ArrowRight size={15} />
          </button>
        </footer>
      </section>
    </div>
  );
}
