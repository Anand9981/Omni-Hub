import { ArrowUpRight, MapPin, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import AgentPerformance from './AgentPerformance.jsx';
import AgentStatusBadge from './AgentStatusBadge.jsx';

export default function AgentCard({ agent }) {
  const load = Math.min(100, Math.round((agent.activeChats / agent.maxConcurrentChats) * 100));

  return (
    <article className="agent-card">
      <div className="agent-card-head">
        <span className="agent-avatar">{agent.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
        <div className="agent-card-identity">
          <Link to={`/agents/${agent.id}`}><strong>{agent.name}</strong><ArrowUpRight size={14} /></Link>
          <span>{agent.title}</span>
        </div>
        <AgentStatusBadge status={agent.status} />
      </div>

      <div className="agent-card-team">
        <span><UsersRound size={13} />{agent.team}</span>
        <span><MapPin size={13} />{agent.territory}</span>
      </div>

      <div className="agent-workload">
        <div className="agent-workload-label"><span>Conversation load</span><strong>{agent.activeChats} <i>/ {agent.maxConcurrentChats}</i></strong></div>
        <div className="agent-workload-track"><span style={{ width: `${load}%` }} /></div>
        <small>{agent.availableSlots} {agent.availableSlots === 1 ? 'slot' : 'slots'} available</small>
      </div>

      <div className="agent-skills">
        {agent.skills.slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}
        {agent.skills.length > 4 && <span>+{agent.skills.length - 4}</span>}
      </div>
      <AgentPerformance agent={agent} compact />
      <Link className="agent-card-link" to={`/agents/${agent.id}`}>View profile <ArrowUpRight size={14} /></Link>
    </article>
  );
}
