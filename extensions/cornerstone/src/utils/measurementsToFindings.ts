const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

type Measurement = {
  label?: string;
  toolName?: string;
  displayText?: { primary?: string[]; secondary?: string[] };
};

/**
 * Fork: turns measurements into a small findings table the radiologist can paste into
 * the platform report (rich text) or any plain-text field.
 */
export default function measurementsToFindings(measurements: Measurement[]) {
  const rows = measurements.map(({ label, toolName, displayText }) => [
    label || toolName || 'Measurement',
    (displayText?.primary || []).join('; '),
    (displayText?.secondary || []).join('; '),
  ]);
  const header = ['Finding', 'Value', 'Location'];

  const text = rows
    .map(([finding, value, location]) => `- ${finding}: ${value} (${location})`)
    .join('\n');
  const html =
    '<table><thead><tr>' +
    header.map(h => `<th>${h}</th>`).join('') +
    '</tr></thead><tbody>' +
    rows
      .map(row => '<tr>' + row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('') + '</tr>')
      .join('') +
    '</tbody></table>';

  return { text, html };
}
