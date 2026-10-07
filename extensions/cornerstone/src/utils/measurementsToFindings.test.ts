jest.mock('@ohif/i18n', () => ({ t: (key: string) => key.split(':')[1] }));
import measurementsToFindings from './measurementsToFindings';

describe('measurementsToFindings', () => {
  it('builds a pasteable table and plain-text list', () => {
    const { text, html } = measurementsToFindings([
      {
        label: 'Nodule <RUL>',
        displayText: { primary: ['12.3 mm'], secondary: ['Series 3, image 45'] },
      },
      { toolName: 'EllipticalROI', displayText: { primary: ['Mean: 40 HU', 'Area: 2 cm²'] } },
    ]);

    expect(text).toBe(
      '- Nodule <RUL>: 12.3 mm (Series 3, image 45)\n- Ellipse: Mean: 40 HU; Area: 2 cm² ()'
    );
    expect(html).toContain(
      '<td>Nodule &lt;RUL&gt;</td><td>12.3 mm</td><td>Series 3, image 45</td>'
    );
    expect(html.startsWith('<table>')).toBe(true);
  });
});
