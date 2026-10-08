function escapeCsv(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function downloadCsv(filename, rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('There is no analytics data to export.');
  }
  const columns = Object.keys(rows[0]);
  const contents = [
    columns.map(escapeCsv).join(','),
    ...rows.map((row) => columns.map((column) => escapeCsv(row[column])).join(',')),
  ].join('\r\n');
  const blob = new Blob([`\uFEFF${contents}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function printReport() {
  if (typeof window === 'undefined' || typeof window.print !== 'function') {
    throw new Error('Print to PDF is unavailable in this browser.');
  }
  window.print();
}
