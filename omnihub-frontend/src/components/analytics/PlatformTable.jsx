import { CHANNEL_COLORS } from '../../utils/chartColors.js';

const number = (value) => value.toLocaleString();

export default function PlatformTable({ rows = [] }) {
  return (
    <div className="analytics-table-wrap">
      <table className="analytics-table">
        <thead>
          <tr>
            <th>Channel</th>
            <th>Inbound</th>
            <th>AI replies</th>
            <th>Menu</th>
            <th>Human</th>
            <th>Outbound</th>
            <th>Pending</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.platform}>
              <th scope="row">
                <span className="analytics-platform-name">
                  <i style={{ '--platform-color': CHANNEL_COLORS[row.platform] || '#8b98ab' }} />
                  {row.channel}
                </span>
              </th>
              <td>{number(row.inbound)}</td>
              <td>{number(row.aiReplies)}</td>
              <td>{number(row.menuReplies)}</td>
              <td>{number(row.humanReplies)}</td>
              <td className="analytics-table-strong">{number(row.outbound)}</td>
              <td>{row.pending > 0 ? <span className="analytics-pending-pill">{row.pending}</span> : '—'}</td>
            </tr>
          ))}
          <tr className="analytics-table-total">
            <th scope="row">Total</th>
            <td>{number(rows.reduce((sum, row) => sum + row.inbound, 0))}</td>
            <td>{number(rows.reduce((sum, row) => sum + row.aiReplies, 0))}</td>
            <td>{number(rows.reduce((sum, row) => sum + row.menuReplies, 0))}</td>
            <td>{number(rows.reduce((sum, row) => sum + row.humanReplies, 0))}</td>
            <td>{number(rows.reduce((sum, row) => sum + row.outbound, 0))}</td>
            <td>{number(rows.reduce((sum, row) => sum + row.pending, 0))}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
