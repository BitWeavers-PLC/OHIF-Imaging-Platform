import {
  meanCurve,
  percentEnhancement,
  phaseAxis,
  roiVoxelIndices,
  tmToSeconds,
  phaseKey,
  phaseSeriesGroup,
  seriesTime,
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

describe('one series per phase', () => {
  const phase = (n: number, tt: number, extra = {}) => ({
    uid: `s${n}`,
    studyUID: 'study',
    modality: 'MR',
    frameOfReferenceUID: 'for',
    size: '320x320x120',
    orientation: '1,0,0,0,1,0',
    description: `twist_20s_dyn_TRA (h20 ex B17)_TT=${tt}s`,
    seriesNumber: n,
    time: tt,
    ...extra,
  });

  it('strips the TT tag and prefers it as the phase time', () => {
    expect(phaseKey('twist_20s_dyn_TRA (h20 ex B17)_TT=99.3s')).toBe(
      'twist_20s_dyn_TRA (h20 ex B17)'
    );
    expect(seriesTime('dyn_TT=63.0s', { AcquisitionTime: '143226.9' })).toBe(63);
    expect(seriesTime('dyn', { TriggerTime: 18000 })).toBe(18);
    expect(seriesTime('dyn', { AcquisitionTime: '143226.9' })).toBe('143226.9');
  });

  it('groups same-geometry phases in time order and leaves other series out', () => {
    const all = [
      phase(19, 153.8),
      phase(7, 44.8),
      phase(11, 81.2),
      phase(30, 300, { size: '256x256x40' }), // other sequence
      phase(40, 400, { description: 't1_fl3d_TRA' }), // other description
    ];
    expect(phaseSeriesGroup(all[0], all).map(s => s.seriesNumber)).toEqual([7, 11, 19]);
  });

  it('needs at least three phases', () => {
    const all = [phase(7, 44.8), phase(11, 81.2)];
    expect(phaseSeriesGroup(all[0], all)).toEqual([]);
  });
});
