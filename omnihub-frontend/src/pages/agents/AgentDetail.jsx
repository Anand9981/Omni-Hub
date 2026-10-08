import { useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, Clock3, Gauge, MapPin, Settings2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import AgentPerformance from '../../components/agents/AgentPerformance.jsx';
import AgentStatusBadge from '../../components/agents/AgentStatusBadge.jsx';
import { loadAgents, updateAgent } from '../../store/agentSlice.js';
import { loadConversations } from '../../store/conversationSlice.js';

export default function AgentDetail() {
  const { agentId } = useParams();
  const dispatch = useDispatch();
  const agent = useSelector((state) => state.agents.items.find((item) => item.id === agentId));
  const agentsStatus = useSelector((state) => state.agents.status);
  const conversations = useSelector((state) => state.conversations.items);
  const error = useSelector((state) => state.agents.error);

  useEffect(() => {
    if (agentsStatus === 'idle') dispatch(loadAgents());
    if (!conversations.length) dispatch(loadConversations());
  }, [agentsStatus, conversations.length, dispatch]);

  const assigned = conversations.filter((conversation) => conversation.assigned_agent_id === agentId);
  const loadPercentage = agent ? Math.min(100, Math.round((agent.activeChats / agent.maxConcurrentChats) * 100)) : 0;

  if (!agent && agentsStatus !== 'loading') {
    return <div className="empty-state empty-state--tall">This agent profile is unavailable. <Link to="/agents">Return to the directory</Link></div>;
  }
  if (!agent) return <div className="empty-state">Loading agent profile…</div>;

  const handleUpdate = (updates) => dispatch(updateAgent({ agentId, updates }));

  return (
    <div className="agent-detail-page">
      <Link className="agent-back-link" to="/agents"><ArrowLeft size={15} /> All agents</Link>

      <section className="agent-detail-hero">
        <div className="agent-detail-identity">
          <span className="agent-avatar agent-avatar--hero">{agent.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
          <div>
            <span className="agents-eyebrow">AGENT PROFILE</span>
            <h2>{agent.name}</h2>
            <p>{agent.title} <span>·</span> {agent.team}</p>
            <div className="agent-detail-badges"><AgentStatusBadge status={agent.status} /><span><MapPin size={13} />{agent.territory}</span></div>
          </div>
        </div>
        <div className="agent-detail-controls">
          <label htmlFor="agent-status">Availability</label>
          <select id="agent-status" onChange={(event) => handleUpdate({ status: event.target.value })} value={agent.status === 'busy' ? 'busy' : agent.status}>
            <option value="online">Online</option><option value="busy">Busy</option><option value="away">Away</option><option value="offline">Offline</option>
          </select>
        </div>
      </section>

      {error && <div className="alert alert--error" role="alert">{error}</div>}

      <section className="agent-detail-layout">
        <div className="agent-detail-main">
          <div className="agent-section-heading"><div><span className="agents-section-kicker">PERFORMANCE SNAPSHOT</span><h3>Service at a glance</h3></div><span className="agent-demo-label"><Clock3 size={13} /> Demo data</span></div>
          <AgentPerformance agent={agent} />

          <section className="agent-assigned-section">
            <div className="agent-section-heading"><div><span className="agents-section-kicker">LIVE WORKLOAD</span><h3>Assigned conversations <span>{assigned.length}</span></h3></div><Link to="/dashboard">Open inbox <ArrowUpRight size={14} /></Link></div>
            {assigned.length ? (
              <div className="agent-conversation-list">
                {assigned.map((conversation) => (
                  <Link className="agent-conversation-row" key={conversation.id} to={`/dashboard/${conversation.id}`}>
                    <span className="agent-conversation-avatar">{(conversation.sender_name || '?').charAt(0)}</span>
                    <span className="agent-conversation-copy"><strong>{conversation.sender_name}</strong><small>{conversation.lastMessage?.text_content || 'No messages yet'}</small></span>
                    <span className={`agent-priority${conversation.lead?.lead_tags?.includes('#VIP') || conversation.lead?.lead_tags?.includes('#HOT_LEAD') ? ' is-priority' : ''}`}>
                      {conversation.lead?.lead_tags?.includes('#VIP') || conversation.lead?.lead_tags?.includes('#HOT_LEAD') ? 'Priority' : conversation.platform}
                    </span>
                    <ArrowUpRight size={15} />
                  </Link>
                ))}
              </div>
            ) : <div className="agent-no-conversations">No conversations assigned yet. Eligible new chats can be routed from the inbox.</div>}
          </section>
        </div>

        <aside className="agent-detail-sidebar">
          <section className="agent-workload-card">
            <div className="agent-workload-card-title"><span><Gauge size={15} /> Capacity</span><strong>{agent.activeChats}<i> / {agent.maxConcurrentChats}</i></strong></div>
            <div className="agent-workload-track agent-workload-track--large"><span style={{ width: `${loadPercentage}%` }} /></div>
            <small>{agent.availableSlots} available {agent.availableSlots === 1 ? 'slot' : 'slots'}</small>
            <label htmlFor="agent-capacity">Maximum concurrent chats</label>
            <div className="agent-capacity-controls">
              <input id="agent-capacity" max="10" min="1" onChange={(event) => handleUpdate({ maxConcurrentChats: Number(event.target.value) })} type="range" value={agent.maxConcurrentChats} />
              <strong>{agent.maxConcurrentChats}</strong>
            </div>
            <span className="agent-capacity-hint"><Settings2 size={12} /> Set a limit between 1 and 10</span>
          </section>

          <section className="agent-profile-card">
            <span className="agents-section-kicker">PROFILE DETAILS</span>
            <div><small>Work email</small><strong>{agent.email}</strong></div>
            <div><small>Role</small><strong>{agent.role}</strong></div>
            <div><small>Team</small><strong>{agent.team}</strong></div>
            <div><small>Coverage</small><strong>{agent.territory}</strong></div>
          </section>

          <section className="agent-profile-card">
            <span className="agents-section-kicker">SKILLS & EXPERTISE</span>
            <div className="agent-detail-skills">{agent.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
          </section>
        </aside>
      </section>
    </div>
  );
}
