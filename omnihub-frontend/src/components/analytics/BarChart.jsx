import { CHANNEL_COLORS, TRAFFIC_COLORS } from '../../utils/chartColors.js';

const WIDTH = 720;
const HEIGHT = 254;
const PADDING = { top: 18, right: 16, bottom: 42, left: 38 };

export default function BarChart({ rows = [] }) {
  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const maxValue = Math.max(4, ...rows.flatMap((row) => [row.inbound, row.outbound]));
  const step = plotWidth / Math.max(rows.length, 1);
  const barWidth = Math.min(20, step * 0.24);
  const ticks = [0, 0.33, 0.66, 1].map((fraction) => Math.round(maxValue * fraction));

  return (
    <div className="analytics-chart-scroll">
      <svg aria-label="Inbound and outbound messages by channel" className="analytics-svg analytics-bar-svg" role="img" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {ticks.map((tick) => {
          const y = PADDING.top + plotHeight - (tick / maxValue) * plotHeight;
          return (
            <g key={tick}>
              <line className="chart-gridline" x1={PADDING.left} x2={WIDTH - PADDING.right} y1={y} y2={y} />
              <text className="chart-axis-label" textAnchor="end" x={PADDING.left - 10} y={y + 4}>{tick}</text>
            </g>
          );
        })}
        {rows.map((row, index) => {
          const center = PADDING.left + step * (index + 0.5);
          const inboundHeight = (row.inbound / maxValue) * plotHeight;
          const outboundHeight = (row.outbound / maxValue) * plotHeight;
          return (
            <g key={row.platform}>
              <rect
                fill={CHANNEL_COLORS[row.platform] || TRAFFIC_COLORS.inbound}
                height={inboundHeight}
                rx="4"
                width={barWidth}
                x={center - barWidth - 2}
                y={PADDING.top + plotHeight - inboundHeight}
              >
                <title>{row.channel}: {row.inbound} inbound</title>
              </rect>
              <rect
                fill={CHANNEL_COLORS[row.platform] || TRAFFIC_COLORS.outbound}
                fillOpacity=".36"
                height={outboundHeight}
                rx="4"
                width={barWidth}
                x={center + 2}
                y={PADDING.top + plotHeight - outboundHeight}
              >
                <title>{row.channel}: {row.outbound} outbound</title>
              </rect>
              <text className="chart-axis-label chart-channel-label" textAnchor="middle" x={center} y={HEIGHT - 15}>
                {row.channel === 'Web chat' ? 'Web' : row.channel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
