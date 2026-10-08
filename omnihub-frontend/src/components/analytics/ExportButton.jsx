import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { useState } from 'react';
import { downloadCsv, printReport } from '../../utils/exportUtils.js';

export default function ExportButton({ rows, reportName = 'omnihub-analytics' }) {
  const [error, setError] = useState('');
  function exportCsv() {
    try {
      setError('');
      downloadCsv(`${reportName}.csv`, rows);
    } catch (issue) {
      setError(issue.message);
    }
  }
  function exportPdf() {
    try {
      setError('');
      printReport();
    } catch (issue) {
      setError(issue.message);
    }
  }
  return (
    <div className="analytics-export">
      <button className="analytics-export-button" onClick={exportCsv} type="button">
        <FileSpreadsheet size={16} /> Export CSV <Download size={14} />
      </button>
      <button className="analytics-export-secondary" onClick={exportPdf} type="button" title="Print or save as PDF">
        <Printer size={16} /> PDF
      </button>
      {error && <span className="analytics-export-error" role="alert">{error}</span>}
    </div>
  );
}
