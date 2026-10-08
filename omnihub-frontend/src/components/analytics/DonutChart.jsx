import { CHANNEL_COLORS } from '../../utils/chartColors.js';

const SIZE = 204;
const RADIUS = 72;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function DonutChart({ rows = [] }) {
  const total = rows.reduce((sum, row) => sum + row.inbound, 0);
  let offset = 0;
  return (
    <div className="analytics-donut-layout">
      <div className="analytics-donut-wrap">
        <svg aria-label="Incoming message share by channel" className="analytics-donut-svg" role="img" viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle className="analytics-donut-track" cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} />
          {total > 0 && rows.filter((row) => row.inbound > 0).map((row) => {
            const length = (row.inbound / total) * CIRCUMFERENCE;
            const segment = (
              <circle
                className="analytics-donut-segment"
                cx={SIZE / 2}
                cy={SIZE / 2}
                key={row.platform}
                r={RADIUS}
                stroke={CHANNEL_COLORS[row.platform] || '#8b98ab'}
                strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                strokeDashoffset={-offset}
              >
                <title>{row.channel}: {Math.round((row.inbound / total) * 100)}%</title>
              </circle>
            );
            offset += length;
            return segment;
          })}
        </svg>
        <div className="analytics-donut-total">
          <strong>{total.toLocaleString()}</strong>
          <span>Inbound</span>
        </div>
      </div>
      <div className="analytics-donut-legend">
        {rows.map((row) => {
          const share = total ? Math.round((row.inbound / total) * 100) : 0;
          return (
            <div className="analytics-legend-row" key={row.platform}>
              <span className="analytics-legend-name">
                <i style={{ '--legend-color': CHANNEL_COLORS[row.platform] || '#8b98ab' }} />
                {row.channel}
              </span>
              <strong>{share}%</strong>
            </div>
          );
        })}
        {!total && <span className="analytics-empty-hint">No inbound messages in this period.</span>}
      </div>
    </div>
  );
}
