jest.mock('@ohif/ui-next', () => ({ InputDialog: () => null, LabellingFlow: () => null }));

jest.mock('@cornerstonejs/tools', () => ({ annotation: { state: {} }, utilities: {} }));
import { callInputDialog } from './callInputDialog';

const fakeDialogService = () => {
  const service = {
    options: null,
    hidden: [],
    show: o => (service.options = o),
    hide: id => service.hidden.push(id),
  };
  return service;
};

describe('callInputDialog', () => {
  it('resolves the entered value on Save', async () => {
    const service = fakeDialogService();
    const value = callInputDialog({ uiDialogService: service as any });
    service.options.contentProps.onSave('42');
    service.options.onClose(service.options.id); // Save also closes the dialog
    await expect(value).resolves.toBe('42');
  });

  it('resolves null on Cancel, the close button or Esc, and hides the dialog', async () => {
    const service = fakeDialogService();
    const value = callInputDialog({ uiDialogService: service as any });
    service.options.onClose(service.options.id);
    await expect(value).resolves.toBeNull();
    expect(service.hidden).toEqual([service.options.id]);
  });
});
