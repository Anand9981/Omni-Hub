import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Bot, Inbox, Search, UsersRound } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import AgentCard from '../../components/agents/AgentCard.jsx';
import AgentStatusBadge from '../../components/agents/AgentStatusBadge.jsx';
import { loadAgents } from '../../store/agentSlice.js';
import { loadConversations } from '../../store/conversationSlice.js';

const FILTERS = ['all', 'online', 'busy', 'away', 'offline'];

export default function AgentsList() {
  const dispatch = useDispatch();
  const { items: agents, status, error } = useSelector((state) => state.agents);
  const conversations = useSelector((state) => state.conversations.items);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(loadAgents());
    dispatch(loadConversations());
  }, [dispatch]);

  const visibleAgents = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return agents.filter((agent) => (
      (filter === 'all' || agent.status === filter)
      && (!needle || [agent.name, agent.email, agent.title, agent.team, ...agent.skills].some((value) => value.toLowerCase().includes(needle)))
    ));
  }, [agents, filter, query]);

  const onlineCount = agents.filter((agent) => agent.status === 'online').length;
  const activeChats = agents.reduce((sum, agent) => sum + agent.activeChats, 0);
  const capacity = agents.reduce((sum, agent) => sum + agent.maxConcurrentChats, 0);
  const averageCsat = agents.length
    ? (agents.reduce((sum, agent) => sum + agent.satisfaction, 0) / agents.length).toFixed(1)
    : '—';
  const unassigned = conversations.filter((conversation) => !conversation.assigned_agent_id);
  const priorityQueue = unassigned.filter((conversation) => (
    conversation.lead?.lead_tags?.includes('#VIP') || conversation.lead?.lead_tags?.includes('#HOT_LEAD')
  )).length;

  return (
    <div className="agents-page">
      <section className="agents-hero">
        <div className="agents-hero-copy">
          <span className="agents-eyebrow"><UsersRound size={14} /> TEAM OPERATIONS</span>
          <h2>Your team,<br /><span>at its best.</span></h2>
          <p>See availability, balance live workload and put the right expertise behind every customer conversation.</p>
          <Link className="agents-hero-link" to="/dashboard">Open unified inbox <ArrowUpRight size={14} /></Link>
        </div>
        <div aria-label={`${onlineCount} agents online`} className="agents-hero-presence">
          <div className="agents-presence-orbit agents-presence-orbit--outer" />
          <div className="agents-presence-orbit agents-presence-orbit--inner" />
          <span className="agents-presence-count">{String(onlineCount).padStart(2, '0')}</span>
          <span className="agents-presence-label">AVAILABLE NOW</span>
          <div className="agents-presence-faces">
            {agents.filter((agent) => agent.status === 'online').slice(0, 3).map((agent) => (
              <span className="agent-avatar agent-avatar--presence" key={agent.id} title={agent.name}>
                {agent.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="agents-overview">
        <article className="agents-overview-card"><span className="agents-overview-icon"><UsersRound size={17} /></span><div><small>Team members</small><strong>{agents.length}</strong></div><span className="agents-overview-note"><AgentStatusBadge status="online" /> {onlineCount} online</span></article>
        <article className="agents-overview-card"><span className="agents-overview-icon agents-overview-icon--amber"><Bot size={17} /></span><div><small>Active conversations</small><strong>{activeChats}<i> / {capacity}</i></strong></div><span className="agents-overview-note">Concurrent capacity</span></article>
        <article className="agents-overview-card"><span className="agents-overview-icon agents-overview-icon--mint">★</span><div><small>Average satisfaction</small><strong>{averageCsat}<i> / 5</i></strong></div><span className="agents-overview-note">Demo performance profile</span></article>
        <Link className="agents-overview-card agents-queue-card" to="/dashboard?queue=unassigned"><span className="agents-overview-icon agents-overview-icon--queue"><Inbox size={17} /></span><div><small>Unassigned queue</small><strong>{unassigned.length}</strong></div><span className="agents-overview-note">{priorityQueue} priority</span></Link>
      </div>

      <section className="agents-directory">
        <div className="agents-directory-head">
          <div><span className="agents-section-kicker">WORKSPACE DIRECTORY</span><h3>Meet your agents <span>{agents.length}</span></h3><p>Availability and workload update as conversations are assigned.</p></div>
          <label className="agents-search"><Search size={16} /><input aria-label="Search agents" onChange={(event) => setQuery(event.target.value)} placeholder="Search name, skill or team" value={query} /></label>
        </div>
        <div className="agents-filter-row" role="group" aria-label="Filter agents by status">
          {FILTERS.map((item) => (
            <button className={filter === item ? 'is-active' : ''} key={item} onClick={() => setFilter(item)} type="button">
              {item === 'all' ? 'All agents' : item[0].toUpperCase() + item.slice(1)}
              {item !== 'all' && <span>{agents.filter((agent) => agent.status === item).length}</span>}
            </button>
          ))}
        </div>
        {error && <div className="alert alert--error" role="alert">{error}</div>}
        {status === 'loading' && !agents.length && <div className="empty-state">Loading agent directory…</div>}
        {status !== 'loading' && !visibleAgents.length && <div className="empty-state">No agents match these filters.</div>}
        <div className="agents-grid">
          {visibleAgents.map((agent) => <AgentCard agent={agent} key={agent.id} />)}
        </div>
      </section>
    </div>
  );
}
