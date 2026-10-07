jest.mock('@ohif/ui-next', () => ({ ToolButton: () => null }));
jest.mock('@ohif/i18n', () => ({ t: (key: string) => key.split(':').pop() }));
import { panelCaption } from './PanelButtons';

describe('panelCaption', () => {
  it('uses a short tab label as is', () => {
    expect(panelCaption({ label: 'Paint', iconLabel: 'Segmentation' })).toBe('Paint');
  });

  it('falls back to the icon label, shortened when still long', () => {
    expect(panelCaption({ label: 'Time–intensity', iconLabel: 'Curves' })).toBe('Curves');
    expect(panelCaption({ label: '', iconLabel: 'Segmentation' })).toBe('Segments');
    expect(panelCaption({ label: '', iconLabel: 'Patient Info' })).toBe('Patient');
  });
});
