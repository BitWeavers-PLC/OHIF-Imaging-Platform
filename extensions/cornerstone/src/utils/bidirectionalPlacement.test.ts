jest.mock('@cornerstonejs/core', () => ({ metaData: { get: () => undefined } }));
import { formatBidirectional, imageAtPoint, planeNormal } from './bidirectionalPlacement';

describe('bidirectional placement', () => {
  // Axes in the axial plane at z = -289.5.
  const axes = [
    [
      [0, 0, -289.5],
      [50, 0, -289.5],
    ],
    [
      [25, -20, -289.5],
      [25, 20, -289.5],
    ],
  ];

  it('finds the axial plane the axes lie in', () => {
    expect(Math.abs(planeNormal(axes)[2])).toBeCloseTo(1);
  });

  it('picks the CT slice the measurement lies on, not the one being viewed', () => {
    const z = { 'ct-95': -289.5, 'ct-96': -292, 'ct-122': -357 };
    const slice = imageAtPoint(Object.keys(z), axes[0][0], planeNormal(axes), id => [0, 0, z[id]]);
    expect(slice).toBe('ct-95');
  });

  it('formats the length/width pair instead of NaN', () => {
    expect(formatBidirectional({ maxMajor: 58.54, maxMinor: 59.02 })).toBe('59.0 × 58.5');
    expect(formatBidirectional(42)).toBeUndefined();
  });
});
