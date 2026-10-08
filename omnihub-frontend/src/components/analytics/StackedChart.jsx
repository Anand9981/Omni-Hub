import { TRAFFIC_COLORS } from '../../utils/chartColors.js';

export default function StackedChart({ rows = [] }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return (
    <div className="analytics-stacked">
      <div className="analytics-stacked-bar" aria-label="Message response breakdown">
        {total > 0 ? rows.map((row) => (
          <span
            key={row.id}
            style={{
              '--segment-color': TRAFFIC_COLORS[row.id],
              width: `${(row.value / total) * 100}%`,
            }}
            title={`${row.label}: ${row.value}`}
          />
        )) : <span className="analytics-stacked-empty" />}
      </div>
      <div className="analytics-stacked-legend">
        {rows.map((row) => (
          <div className="analytics-stacked-item" key={row.id}>
            <span className="analytics-stacked-label"><i style={{ '--legend-color': TRAFFIC_COLORS[row.id] }} />{row.label}</span>
            <strong>{row.value.toLocaleString()}</strong>
          </div>
        ))}
      </div>
      <div className="analytics-stacked-total"><span>Handled + pending</span><strong>{total.toLocaleString()}</strong></div>
    </div>
  );
}
