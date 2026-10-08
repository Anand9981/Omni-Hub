const RANGES = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
];

export default function DateRangePicker({ value, startDate, endDate, onChange }) {
  return (
    <div className="analytics-date-control" aria-label="Analytics date range">
      <div className="analytics-range-tabs">
        {RANGES.map((range) => (
          <button
            aria-pressed={value === range.id}
            className={value === range.id ? 'is-active' : ''}
            key={range.id}
            onClick={() => onChange(range.id)}
            type="button"
          >
            {range.label}
          </button>
        ))}
      </div>
      <div className="analytics-custom-range">
        <label>
          <span>From</span>
          <input
            aria-label="Custom start date"
            onChange={(event) => onChange('custom', event.target.value, endDate)}
            type="date"
            value={startDate}
          />
        </label>
        <span className="analytics-date-separator">—</span>
        <label>
          <span>To</span>
          <input
            aria-label="Custom end date"
            onChange={(event) => onChange('custom', startDate, event.target.value)}
            type="date"
            value={endDate}
          />
        </label>
      </div>
    </div>
  );
}
