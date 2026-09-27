import { Enums } from '@cornerstonejs/core';
import setViewportSlab, { getFullVolumeSlabThickness } from './setViewportSlab';

const mockViewport = () => ({
  setBlendMode: jest.fn(),
  setSlabThickness: jest.fn(),
  resetSlabThickness: jest.fn(),
  render: jest.fn(),
  getVolumeId: () => 'vol',
});

describe('setViewportSlab', () => {
  it('applies MinIP with a fixed thickness', () => {
    const vp = mockViewport();
    setViewportSlab(vp, 'minip', 10);
    expect(vp.setBlendMode).toHaveBeenCalledWith(Enums.BlendModes.MINIMUM_INTENSITY_BLEND);
    expect(vp.setSlabThickness).toHaveBeenCalledWith(10);
    expect(vp.render).toHaveBeenCalled();
  });

  it('computes full-volume thickness from the volume diagonal', () => {
    const vp = mockViewport();
    const volume = { dimensions: [3, 4, 0], spacing: [1, 1, 1] };
    setViewportSlab(vp, 'mip', 'fullVolume', () => volume);
    expect(vp.setBlendMode).toHaveBeenCalledWith(Enums.BlendModes.MAXIMUM_INTENSITY_BLEND);
    expect(vp.setSlabThickness).toHaveBeenCalledWith(5);
    expect(getFullVolumeSlabThickness(volume)).toBe(5);
  });

  it('resets to a composite thin slice when blend mode is empty', () => {
    const vp = mockViewport();
    setViewportSlab(vp, undefined);
    expect(vp.setBlendMode).toHaveBeenCalledWith(Enums.BlendModes.COMPOSITE);
    expect(vp.resetSlabThickness).toHaveBeenCalled();
    expect(vp.setSlabThickness).not.toHaveBeenCalled();
  });
});
