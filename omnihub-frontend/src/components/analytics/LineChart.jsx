import { TRAFFIC_COLORS } from '../../utils/chartColors.js';

const WIDTH = 700;
const HEIGHT = 232;
const PAD = { top: 18, right: 14, bottom: 32, left: 44 };

export default function LineChart({ points = [], metric = 'total', strokeColor, unit = '' }) {
  const plotWidth = WIDTH - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const color = strokeColor || TRAFFIC_COLORS.inbound;
  const values = points.map((point) => point[metric] ?? point.total ?? 0);
  const maxValue = Math.max(1, ...values);
  const coordinates = points.map((point, index) => {
    const val = point[metric] ?? point.total ?? 0;
    return {
      ...point,
      val,
      x: PAD.left + (index / Math.max(points.length - 1, 1)) * plotWidth,
      y: PAD.top + plotHeight - (val / maxValue) * plotHeight,
    };
  });
  const path = coordinates.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  const area = `${path} L ${PAD.left + plotWidth} ${PAD.top + plotHeight} L ${PAD.left} ${PAD.top + plotHeight} Z`;

  return (
    <div className="analytics-chart-scroll">
      <svg aria-label="Hourly analytics line chart" className="analytics-svg analytics-line-svg" role="img" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {[0, 0.5, 1].map((fraction) => {
          const y = PAD.top + plotHeight * fraction;
          const displayVal = (maxValue * (1 - fraction)).toFixed(unit === 's' ? 1 : 0) + unit;
          return (
            <g key={fraction}>
              <line className="chart-gridline" x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} />
              <text className="chart-axis-label" textAnchor="end" x={PAD.left - 6} y={y + 3}>{displayVal}</text>
            </g>
          );
        })}
        <path d={area} fill={color} fillOpacity=".09" />
        <path d={path} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        {coordinates.filter((_, index) => index % 3 === 0).map((point) => (
          <g key={point.hour}>
            <circle cx={point.x} cy={point.y} fill="#ffffff" r="4.5" stroke={color} strokeWidth="2.5">
              <title>{`${String(point.hour).padStart(2, '0')}:00 — ${point.val}${unit}`}</title>
            </circle>
            <text className="chart-axis-label" textAnchor="middle" x={point.x} y={HEIGHT - 10}>{String(point.hour).padStart(2, '0')}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
