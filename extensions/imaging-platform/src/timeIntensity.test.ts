import {
  meanCurve,
  percentEnhancement,
  phaseAxis,
  roiVoxelIndices,
  tmToSeconds,
} from './timeIntensity';

describe('time–intensity helpers', () => {
  it('reads DICOM times and builds the x axis', () => {
    expect(tmToSeconds('101530.5')).toBe(36930.5);
    expect(phaseAxis(['101500', '101530', '101600'])).toEqual({ x: [0, 30, 60], unit: 's' });
    expect(phaseAxis(['101500', undefined])).toEqual({ x: [1, 2], unit: '' });
  });

  it('collects the voxels of an ROI on one slice', () => {
    const dims = [10, 10, 5];
    // Square from (2,2) to (4,4) on slice k=3.
    const square = [
      [2, 2, 3],
      [4, 4, 3],
    ];
    expect(roiVoxelIndices(square, dims, 'rectangle')).toHaveLength(9);
    // The ellipse inscribed in that square drops the 4 corners.
    expect(roiVoxelIndices(square, dims, 'ellipse')).toHaveLength(5);
    expect(roiVoxelIndices(square, dims, 'rectangle')[0]).toBe(2 + 2 * 10 + 3 * 100);
  });

  it('averages the ROI per phase and expresses enhancement in %', () => {
    const values = { 1: [100, 102], 2: [150, 154], 3: [200, 202] };
    const curve = meanCurve([0, 1], 3, (i, p) => values[p][i]);
    expect(curve).toEqual([101, 152, 201]);
    expect(percentEnhancement(curve)).toEqual([0, 50.5, 99]);
  });
});
