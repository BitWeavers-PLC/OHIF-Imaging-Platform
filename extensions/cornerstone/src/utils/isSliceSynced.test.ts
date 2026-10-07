import isSliceSynced from './isSliceSynced';

const service = (types: string[], disabled = false) => {
  const synchronizers = types.map(type => ({ type, getOptions: () => ({ disabled }) }));
  return {
    getSynchronizersForViewport: () => synchronizers,
    getSynchronizerType: synchronizer => synchronizer.type,
  };
};

describe('isSliceSynced', () => {
  it('counts image-slice and camera links, not window or segmentation links', () => {
    expect(isSliceSynced(service(['imageSlice']), 'v')).toBe(true);
    expect(isSliceSynced(service(['cameraPosition', 'voi']), 'v')).toBe(true);
    expect(isSliceSynced(service(['voi', 'hydrateseg']), 'v')).toBe(false);
  });

  it('ignores a link that is switched off', () => {
    expect(isSliceSynced(service(['imageSlice'], true), 'v')).toBe(false);
  });
});
