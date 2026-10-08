import { CalendarDays, FileBarChart2, FileDown, Sparkles } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DateRangePicker from '../../components/analytics/DateRangePicker.jsx';
import ExportButton from '../../components/analytics/ExportButton.jsx';
import PlatformTable from '../../components/analytics/PlatformTable.jsx';
import { loadAnalytics, setAnalyticsRange } from '../../store/analyticsSlice.js';
import { analyticsService } from '../../services/analyticsService.js';

const REPORTS = [
  { range: 'today', title: 'Daily summary', description: 'A concise view of today’s channel activity.', icon: CalendarDays, period: 'Today' },
  { range: '7d', title: 'Weekly report', description: 'Compare the last seven days of inbound and outbound traffic.', icon: FileBarChart2, period: 'Last 7 days' },
  { range: '30d', title: 'Monthly report', description: 'Review a 30-day view of channel mix and response activity.', icon: Sparkles, period: 'Last 30 days' },
];

export default function Reports() {
  const dispatch = useDispatch();
  const { data, range, startDate, endDate, status, error } = useSelector((state) => state.analytics);
  const request = useCallback(() => {
    dispatch(loadAnalytics({ range, startDate, endDate }));
  }, [dispatch, endDate, range, startDate]);

  useEffect(() => { request(); }, [request]);

  function changeRange(nextRange, nextStart = '', nextEnd = '') {
    const start = nextStart || nextEnd;
    const end = nextEnd || nextStart;
    dispatch(setAnalyticsRange({
      range: nextRange,
      startDate: nextRange === 'custom' ? start : '',
      endDate: nextRange === 'custom' ? end : '',
    }));
  }

  const rows = data ? analyticsService.getReportRows(data) : [];
  const reportTitle = range === 'today' ? 'daily' : range === '7d' ? 'weekly' : range === '30d' ? 'monthly' : 'custom';

  return (
    <div className="analytics-page analytics-reports-page">
      <div className="analytics-page-toolbar">
        <div>
          <div className="analytics-eyebrow"><span /> REPORTING CENTRE</div>
          <h2>Reports, ready when you are.</h2>
          <p>Choose a reporting period, review the channel summary, and export a shareable snapshot.</p>
        </div>
        <div className="analytics-toolbar-actions">
          <span className="analytics-report-demo"><FileDown size={15} /> Browser-generated exports</span>
          <ExportButton reportName={`omnihub-${reportTitle}-report`} rows={rows} />
        </div>
      </div>

      <section className="analytics-report-presets" aria-label="Report presets">
        {REPORTS.map(({ range: presetRange, title, description, icon: Icon, period }) => {
          const selected = range === presetRange;
          return (
            <button
              aria-pressed={selected}
              className={`analytics-report-preset${selected ? ' is-selected' : ''}`}
              key={presetRange}
              onClick={() => changeRange(presetRange)}
              type="button"
            >
              <span className="analytics-report-preset-icon"><Icon size={19} /></span>
              <span className="analytics-report-preset-copy"><strong>{title}</strong><small>{description}</small></span>
              <span className="analytics-report-period">{period}</span>
            </button>
          );
        })}
      </section>

      <section className="analytics-card analytics-report-preview">
        <div className="analytics-report-preview-head">
          <div>
            <div className="analytics-eyebrow"><span /> REPORT PREVIEW</div>
            <h3>Channel activity summary</h3>
            <p>Selected period: {data ? `${data.startDate} – ${data.endDate}` : 'Loading…'}</p>
          </div>
          <DateRangePicker endDate={endDate} onChange={changeRange} startDate={startDate} value={range} />
        </div>
        {error && <div className="alert alert--error" role="alert">{error}</div>}
        {status === 'loading' && !data
          ? <div className="analytics-loading">Preparing report preview…</div>
          : <PlatformTable rows={data?.platformRows || []} />}
        <div className="analytics-report-actions">
          <div><strong>Need a PDF copy?</strong><span>Use Print / Save as PDF to create a portable report.</span></div>
          <ExportButton reportName={`omnihub-${reportTitle}-report`} rows={rows} />
        </div>
      </section>
      <p className="analytics-demo-footnote"><span>REPORT DELIVERY</span> Exports use the sample data in this browser. Scheduled email delivery is outside the frontend-only demo scope.</p>
    </div>
  );
}
