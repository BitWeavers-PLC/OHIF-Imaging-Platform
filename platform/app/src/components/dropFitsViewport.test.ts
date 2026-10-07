import dropFitsViewport from './dropFitsViewport';

describe('dropFitsViewport', () => {
  it('rejects a 2D series on a volume view only', () => {
    expect(dropFitsViewport('volume', { isReconstructable: false })).toBe(false);
    expect(dropFitsViewport('volume3d', { isReconstructable: false })).toBe(false);
    expect(dropFitsViewport('volume', { isReconstructable: true })).toBe(true);
    expect(dropFitsViewport('stack', { isReconstructable: false })).toBe(true);
    expect(dropFitsViewport(undefined, { isReconstructable: false })).toBe(true);
  });
});
