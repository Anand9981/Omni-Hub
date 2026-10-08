import {
  Activity,
  ArrowUpRight,
  Bot,
  Clock3,
  MessagesSquare,
  Radio,
  ShieldQuestion,
  Sparkles,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BarChart from '../../components/analytics/BarChart.jsx';
import DateRangePicker from '../../components/analytics/DateRangePicker.jsx';
import DonutChart from '../../components/analytics/DonutChart.jsx';
import ExportButton from '../../components/analytics/ExportButton.jsx';
import KpiCard from '../../components/analytics/KpiCard.jsx';
import LineChart from '../../components/analytics/LineChart.jsx';
import PlatformTable from '../../components/analytics/PlatformTable.jsx';
import StackedChart from '../../components/analytics/StackedChart.jsx';
import { loadAnalytics, setAnalyticsRange } from '../../store/analyticsSlice.js';
import { analyticsService } from '../../services/analyticsService.js';

const EMPTY_ROWS = [];

function dateLabel(data) {
  if (!data) return 'Loading reporting period…';
  const start = new Date(`${data.startDate}T00:00:00`);
  const end = new Date(`${data.endDate}T00:00:00`);
  const options = { month: 'short', day: 'numeric' };
  if (data.startDate === data.endDate) return start.toLocaleDateString(undefined, { ...options, year: 'numeric' });
  return `${start.toLocaleDateString(undefined, options)} – ${end.toLocaleDateString(undefined, { ...options, year: 'numeric' })}`;
}

function formatLatency(sec) {
  if (typeof sec !== 'number' || sec <= 0) return '—';
  if (sec < 60) return `${sec.toFixed(1)}s`;
  if (sec < 3600) return `${(sec / 60).toFixed(1)}m`;
  return `${(sec / 3600).toFixed(1)}h`;
}

export default function Analytics() {
  const dispatch = useDispatch();
  const [chartView, setChartView] = useState('traffic');
  const { data, range, startDate, endDate, status, error } = useSelector((state) => state.analytics);
  const request = useCallback(() => {
    dispatch(loadAnalytics({ range, startDate, endDate }));
  }, [dispatch, endDate, range, startDate]);

  useEffect(() => { request(); }, [request]);
  useEffect(() => {
    const timer = window.setInterval(request, 5000);
    return () => window.clearInterval(timer);
  }, [request]);

  function changeRange(nextRange, nextStart = '', nextEnd = '') {
    const dates = nextRange === 'custom'
      ? { startDate: nextStart || nextEnd, endDate: nextEnd || nextStart }
      : { startDate: '', endDate: '' };
    dispatch(setAnalyticsRange({ range: nextRange, ...dates }));
  }

  const kpis = data?.kpis;
  const rows = data?.platformRows || EMPTY_ROWS;
  const exportRows = data ? analyticsService.getReportRows(data) : [];

  return (
    <div className="analytics-page">
      <section className="analytics-hero">
        <div className="analytics-hero-copy">
          <div className="analytics-hero-eyebrow"><Sparkles size={13} /> WORKSPACE INTELLIGENCE <span className="analytics-hero-live"><i /> LIVE DATA</span></div>
          <h2>Conversations,<br /><span>in perspective.</span></h2>
          <p>Every channel. Every response. One clear picture of how your team connects with customers.</p>
          <div className="analytics-hero-proof">
            <span><Radio size={13} /> Connected channels live</span>
            <i />
            <span>Updates dynamically</span>
          </div>
        </div>
        <div className="analytics-hero-side">
          <div className="analytics-hero-actions">
            <div className="analytics-hero-refresh"><span className={`analytics-live-dot${status === 'refreshing' ? ' is-refreshing' : ''}`} />{status === 'refreshing' ? 'Refreshing live metrics' : 'Live real-time · auto refresh'}</div>
            <ExportButton reportName={`omnihub-${range}-analytics`} rows={exportRows} />
          </div>
          <div className="analytics-hero-visual" aria-hidden="true">
            <div className="analytics-hero-orbit analytics-hero-orbit--outer" />
            <div className="analytics-hero-orbit analytics-hero-orbit--inner" />
            <div className="analytics-hero-glow" />
            <div className="analytics-hero-float analytics-hero-float--one"><span><MessagesSquare size={14} /></span><div><small>MESSAGES</small><strong>{kpis?.totalMessages.toLocaleString() || '—'}</strong></div><ArrowUpRight size={14} /></div>
            <div className="analytics-hero-float analytics-hero-float--two"><span><Bot size={14} /></span><div><small>AUTOMATED</small><strong>{kpis ? `${kpis.automationRate}%` : '—'}</strong></div><i>AI</i></div>
            <div className="analytics-hero-bars">{[27, 42, 34, 58, 48, 73, 61, 84, 67, 96, 74, 88].map((height, index) => <i key={index} style={{ '--bar-height': `${height}%`, '--bar-index': index }} />)}</div>
            <span className="analytics-hero-visual-caption">CROSS-CHANNEL ACTIVITY</span>
          </div>
        </div>
      </section>

      <div className="analytics-filter-row">
        <DateRangePicker endDate={endDate} onChange={changeRange} startDate={startDate} value={range} />
        <span className="analytics-date-caption">{dateLabel(data)}</span>
      </div>

      {error && <div className="alert alert--error" role="alert">{error}</div>}

      {status === 'loading' && !data ? (
        <div className="analytics-loading"><span className="analytics-loading-mark" /> Preparing your workspace overview…</div>
      ) : data ? (
        <>
          <section className="analytics-kpi-grid" aria-label="Workspace key performance indicators">
            <KpiCard accent="Active right now" detail="in the workspace inbox" icon={Activity} label="Active conversations" tone="blue" value={kpis.activeConversations.toLocaleString()} />
            <KpiCard accent="Inbound + outbound" detail="messages processed" icon={MessagesSquare} label="Total messages" tone="blue" value={kpis.totalMessages.toLocaleString()} />
            <KpiCard accent="Across channels" detail="average response latency" icon={Clock3} label="Avg. response latency" tone="violet" value={formatLatency(kpis.averageLatency)} />
            <KpiCard accent="Automated resolution" detail="of inbound conversations" icon={Bot} label="AI resolution rate" tone="teal" value={`${kpis.automationRate}%`} />
            <KpiCard accent="Needs your attention" detail="drafts awaiting review" icon={ShieldQuestion} label="Pending approvals" tone="amber" value={kpis.pendingApprovals.toLocaleString()} />
            <KpiCard accent="Customer opportunities" detail="in selected period" icon={UserRoundCheck} label="Leads generated" tone="teal" value={kpis.leadsGenerated.toLocaleString()} />
          </section>

          <section className="analytics-chart-grid" aria-label="Messaging analytics charts">
            <article className="analytics-card analytics-card--wide">
              <div className="analytics-card-heading">
                <div><h3>Channel volume</h3><p>Inbound and outbound messages by platform</p></div>
                <div className="analytics-chart-legend">
                  <span><i className="legend-inbound" /> Inbound</span>
                  <span><i className="legend-outbound" /> Outbound</span>
                </div>
              </div>
              <BarChart rows={rows} />
              <div className="analytics-chart-foot"><span>Connected channels</span><strong>{data.inboundTotal.toLocaleString()} inbound <i /> {data.outboundTotal.toLocaleString()} outbound</strong></div>
            </article>

            <article className="analytics-card analytics-card--donut">
              <div className="analytics-card-heading">
                <div><h3>Channel mix</h3><p>Share of incoming conversations</p></div>
              </div>
              <DonutChart rows={rows} />
            </article>

            <article className="analytics-card analytics-card--wide">
              <div className="analytics-card-heading" style={{ flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3>{chartView === 'latency' ? 'Average Response Time' : 'Hourly Message Traffic'}</h3>
                  <p>{chartView === 'latency' ? 'Response speed across 24 hours (in seconds)' : 'Inbound & outbound message activity across the day'}</p>
                </div>
                <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setChartView('traffic')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      background: chartView === 'traffic' ? '#ffffff' : 'transparent',
                      color: chartView === 'traffic' ? '#1e293b' : '#64748b',
                      boxShadow: chartView === 'traffic' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Volume
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartView('latency')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      background: chartView === 'latency' ? '#ffffff' : 'transparent',
                      color: chartView === 'latency' ? '#1e293b' : '#64748b',
                      boxShadow: chartView === 'latency' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Response Time
                  </button>
                </div>
              </div>
              <LineChart
                points={data.hourly}
                metric={chartView === 'latency' ? 'latency' : 'total'}
                strokeColor={chartView === 'latency' ? '#8b5cf6' : undefined}
                unit={chartView === 'latency' ? 's' : ''}
              />
              <div className="analytics-chart-foot">
                <span>{chartView === 'latency' ? 'Live Latency Benchmark' : 'Local workspace time'}</span>
                <strong>{chartView === 'latency' ? `${formatLatency(kpis.averageLatency)} average response speed` : '24-hour message distribution'}</strong>
              </div>
            </article>

            <article className="analytics-card analytics-card--breakdown">
              <div className="analytics-card-heading">
                <div><h3>Response breakdown</h3><p>How conversations are handled</p></div>
              </div>
              <StackedChart rows={data.responseBreakdown} />
              <div className="analytics-insight"><span><UsersRound size={15} /></span><p>Human review keeps important replies thoughtful and on-brand.</p></div>
            </article>
          </section>

          <section className="analytics-card analytics-table-card">
            <div className="analytics-card-heading">
              <div><h3>Channel performance</h3><p>Daily traffic and response activity by platform</p></div>
              <span className="analytics-table-period"><span /> {dateLabel(data)}</span>
            </div>
            <PlatformTable rows={rows} />
          </section>

          <div className="analytics-demo-footnote">
            <span>LIVE WORKSPACE</span>
            <p>Metrics and charts are calculated directly in real-time from active omnichannel connections (Telegram, Discord, WhatsApp, Webchat). Updates dynamically as customer chats occur.</p>
          </div>
        </>
      ) : null}
    </div>
  );
}
