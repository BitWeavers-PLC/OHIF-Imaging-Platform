import { fixEllipseAreas } from './EllipticalROIAreaFixTool';

jest.mock('@cornerstonejs/tools', () => ({ EllipticalROITool: class {}, utilities: {} }));

describe('fixEllipseAreas', () => {
  it('removes the doubly applied pixel spacing once', () => {
    // A true 8272 mm² ellipse on 4.6875 mm PET pixels was reported as 181758 mm².
    const stats = { 'stack:pet': { area: 181758.1, mean: 0.9 } };
    fixEllipseAreas(stats, 4.6875);
    expect(stats['stack:pet'].area).toBeCloseTo(8272, 0);
    expect(stats['stack:pet'].mean).toBe(0.9); // pixel statistics untouched

    fixEllipseAreas(stats, 4.6875); // stale stats are not divided again
    expect(stats['stack:pet'].area).toBeCloseTo(8272, 0);
  });

  it('leaves stats without an area and missing spacing alone', () => {
    const stats = { a: { Modality: 'CT' }, b: { area: 100 } };
    fixEllipseAreas(stats, undefined);
    expect(stats.b.area).toBe(100);
  });
});
