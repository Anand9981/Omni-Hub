import { useEffect } from 'react';
import { Inbox } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteConversationSearch,
  loadSavedConversationSearches,
  openConversation,
  replaceFilters,
  resetFilters,
  saveConversationSearch,
  selectVisibleConversations,
  setFilter,
} from '../../store/conversationSlice.js';
import ChannelBadge from './ChannelBadge.jsx';
import AdvancedFilters from './AdvancedFilters.jsx';
import FilterTabs from './FilterTabs.jsx';
import SavedSearches from './SavedSearches.jsx';
import SearchBar from './SearchBar.jsx';

function preview(message) {
  if (!message) return 'No messages yet';
  const prefix = message.direction === 'OUTBOUND' ? 'You: ' : '';
  return `${prefix}${message.text_content}`;
}

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

/**
 * PRD 9.1 - left panel: the conversation list.
 * PRD 9.1 / 15 - search, platform filter and quick filter tabs:
 * (All, Pending Approval, Unread, Human Assigned).
 */
export default function LeftPanel() {
  const dispatch = useDispatch();
  const conversations = useSelector(selectVisibleConversations);
  const activeId = useSelector((state) => state.conversations.activeId);
  const filters = useSelector((state) => state.conversations.filters);
  const savedSearches = useSelector((state) => state.conversations.savedSearches);
  const conversationItems = useSelector((state) => state.conversations.items);
  const error = useSelector((state) => state.conversations.error);
  const isAgentScoped = useSelector((state) => state.agents.isAgentScoped);

  useEffect(() => {
    dispatch(loadSavedConversationSearches());
  }, [dispatch]);

  async function saveSearch(name, currentFilters) {
    try {
      await dispatch(saveConversationSearch({ name, filters: currentFilters })).unwrap();
      return true;
    } catch {
      return false;
    }
  }

  return (
    <section className="panel panel--left" aria-label="Conversations">
      <div className="panel-head">
        <h2 className="panel-title">Inbox</h2>
        <span className="panel-count">{conversations.length}</span>
      </div>

      <SearchBar onChange={(query) => dispatch(setFilter({ query }))} value={filters.query} />
      <FilterTabs
        filters={filters}
        onChange={(next) => dispatch(setFilter(next))}
        onReset={() => dispatch(setFilter({ onlyUnread: false, onlyPending: false, onlyHuman: false }))}
      />
      <div className="inbox-tool-row">
        <AdvancedFilters
          conversations={conversationItems}
          filters={filters}
          onChange={(next) => dispatch(setFilter(next))}
          onReset={() => dispatch(resetFilters())}
        />
        <span className="inbox-result-label">{conversations.length} results</span>
      </div>
      <SavedSearches
        filters={filters}
        onApply={(saved) => dispatch(replaceFilters(saved))}
        onDelete={(id) => dispatch(deleteConversationSearch(id))}
        onSave={saveSearch}
        searches={savedSearches}
      />
      {error && <p className="inbox-filter-error" role="alert">{error}</p>}

      <div className="inbox-list">
        {conversations.length === 0 && (
          <div className="empty-state">
            <Inbox size={22} />
            {isAgentScoped ? 'No conversations are assigned to you yet.' : 'No conversations match these filters.'}
          </div>
        )}

        {conversations.map((conversation) => (
          <button
            className={`inbox-row${conversation.id === activeId ? ' is-active' : ''}`}
            key={conversation.id}
            onClick={() => dispatch(openConversation(conversation.id))}
            type="button"
          >
            <span className="inbox-avatar">{(conversation.sender_name || '?').charAt(0).toUpperCase()}</span>

            <span className="inbox-body">
              <span className="inbox-top">
                <strong>{conversation.sender_name}</strong>
                <span className="inbox-time">{relativeTime(conversation.last_activity_at)}</span>
              </span>
              <span className="inbox-preview">{preview(conversation.lastMessage)}</span>
              <span className="inbox-meta">
                <ChannelBadge platform={conversation.platform} size="sm" withLabel={false} />
                <span className="inbox-channel-name">{conversation.platform}</span>
                {(conversation.lead?.lead_tags?.includes('#VIP') || conversation.lead?.lead_tags?.includes('#HOT_LEAD'))
                  && <span className="tag tag--priority">{conversation.lead?.lead_tags?.includes('#VIP') ? 'VIP' : 'Priority'}</span>}
                {conversation.auto_pilot === 'OFF' && <span className="tag tag--human">Human</span>}
                {conversation.heldDraft && <span className="tag tag--hold">Held draft</span>}
              </span>
            </span>

            {conversation.unread > 0 && <span className="inbox-unread">{conversation.unread}</span>}
          </button>
        ))}
      </div>
    </section>
  );
}