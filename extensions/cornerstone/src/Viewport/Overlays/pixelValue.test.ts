import { formatPixelValue, pixelValueAt } from './pixelValue';

// 4x4 single-slice image whose world coordinates equal its indices.
const viewport = (preScale?) => ({
  canvasToWorld: ([x, y]) => [x, y, 0],
  getImageData: () => ({
    imageData: { worldToIndex: world => world },
    dimensions: [4, 4, 1],
    voxelManager: { getAtIJKPoint: ([i, j]) => 100 * j + i },
    metadata: { Modality: 'CT' },
    preScale,
  }),
});

describe('pixelValueAt', () => {
  it('reads the pixel under the point', () => {
    expect(pixelValueAt(viewport({ scaled: true }), [2, 1])).toEqual({
      value: 102,
      modality: 'CT',
    });
  });

  it('rescales stored values when the viewport is not pre-scaled', () => {
    const scaling = { rescaleSlope: 1, rescaleIntercept: -1024 };
    const result = pixelValueAt(viewport({ scaled: false, scalingParameters: scaling }), [2, 1]);
    expect(result.value).toBe(102 - 1024);
  });

  it('is null off the image', () => {
    expect(pixelValueAt(viewport(), [9, 1])).toBeNull();
  });
});

describe('formatPixelValue', () => {
  it('shows HU for CT, plain values otherwise, and RGB triplets', () => {
    expect(formatPixelValue({ value: -47.4, modality: 'CT' })).toBe('-47 HU');
    expect(formatPixelValue({ value: 289.256, modality: 'MR' })).toBe('289.26');
    expect(formatPixelValue({ value: [10, 20, 30], modality: 'US' })).toBe('10, 20, 30');
  });
});
