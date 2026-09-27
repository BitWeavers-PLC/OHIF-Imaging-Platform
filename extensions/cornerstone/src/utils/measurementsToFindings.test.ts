import measurementsToFindings from './measurementsToFindings';

describe('measurementsToFindings', () => {
  it('builds a pasteable table and plain-text list', () => {
    const { text, html } = measurementsToFindings([
      { label: 'Nodule <RUL>', displayText: { primary: ['12.3 mm'], secondary: ['S: 3 I: 45'] } },
      { toolName: 'EllipticalROI', displayText: { primary: ['Mean: 40 HU', 'Area: 2 cm²'] } },
    ]);

    expect(text).toBe(
      '- Nodule <RUL>: 12.3 mm (S: 3 I: 45)\n- EllipticalROI: Mean: 40 HU; Area: 2 cm² ()'
    );
    expect(html).toContain('<td>Nodule &lt;RUL&gt;</td><td>12.3 mm</td><td>S: 3 I: 45</td>');
    expect(html.startsWith('<table>')).toBe(true);
  });
});
