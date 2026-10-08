export default function KpiCard({ label, value, detail, icon: Icon, tone = 'blue', accent }) {
  return (
    <article className={`analytics-kpi analytics-kpi--${tone}`}>
      <div className="analytics-kpi-top">
        <span>{label}</span>
        <span className="analytics-kpi-icon"><Icon size={17} strokeWidth={1.8} /></span>
      </div>
      <strong className="analytics-kpi-value">{value}</strong>
      <div className="analytics-kpi-foot">
        <span className="analytics-kpi-accent">{accent}</span>
        <span>{detail}</span>
      </div>
    </article>
  );
}
