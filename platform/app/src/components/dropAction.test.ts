import dropAction from './dropAction';

describe('dropAction', () => {
  it('shows a 2D series on a volume view as a stack', () => {
    expect(dropAction('volume', { isReconstructable: false })).toBe('showAsStack');
    expect(dropAction('volume3d', { isReconstructable: false })).toBe('showAsStack');
    expect(dropAction('volume', { isReconstructable: true })).toBe('show');
    expect(dropAction('stack', { isReconstructable: false })).toBe('show');
    expect(dropAction(undefined, { isReconstructable: false })).toBe('show');
  });

  it('refuses a series no viewport can draw', () => {
    expect(dropAction('stack', { unsupported: true })).toBe('unsupported');
    expect(dropAction('volume', { unsupported: true })).toBe('unsupported');
  });
});
