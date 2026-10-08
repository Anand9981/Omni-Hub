import { Check, Clock3, Inbox, UserRound } from 'lucide-react';

const TABS = [
  { id: 'all', label: 'All inbox', icon: Inbox },
  { id: 'unread', label: 'Unread', filter: 'onlyUnread', icon: Check },
  { id: 'pending', label: 'Pending', filter: 'onlyPending', icon: Clock3 },
  { id: 'human', label: 'Human', filter: 'onlyHuman', icon: UserRound },
];

export default function FilterTabs({ filters, onChange, onReset }) {
  const activeTab = TABS.find((tab) => tab.filter && filters[tab.filter])?.id || 'all';
  return (
    <div aria-label="Inbox views" className="inbox-filter-tabs" role="tablist">
      {TABS.map(({ id, label, filter, icon: Icon }) => (
        <button
          aria-selected={activeTab === id}
          className={`inbox-filter-tab${activeTab === id ? ' is-active' : ''}`}
          key={id}
          onClick={() => {
            if (id === 'all') onReset();
            else onChange({ onlyUnread: false, onlyPending: false, onlyHuman: false, [filter]: true });
          }}
          role="tab"
          type="button"
        >
          <Icon size={13} /> {label}
        </button>
      ))}
    </div>
  );
}
