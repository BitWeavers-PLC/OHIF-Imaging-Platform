/**
 * Fork: time–intensity curves for dynamic (multi-phase) MR series. Pure helpers; the panel
 * (panels/TimeIntensityPanel.tsx) feeds them Cornerstone volume data.
 */

/** DICOM TM ('HHMMSS.ffffff', or a number of seconds) to seconds since midnight. */
export function tmToSeconds(tm?: string | number): number | undefined {
  if (typeof tm === 'number') {
    return tm;
  }
  const match = /^(\d{2})(\d{2})?(\d{2}(?:\.\d+)?)?$/.exec(String(tm ?? '').trim());
  if (!match) {
    return undefined;
  }
  const [, h, m = '0', s = '0'] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

/** Seconds from the first phase when every phase has a time, else phase numbers 1..N. */
export function phaseAxis(times: (string | number | undefined)[]): { x: number[]; unit: 's' | '' } {
  const seconds = times.map(tmToSeconds);
  if (seconds.length && seconds.every(s => s !== undefined)) {
    return { x: seconds.map(s => Math.round((s - seconds[0]) * 10) / 10), unit: 's' };
  }
  return { x: times.map((_, i) => i + 1), unit: '' };
}

/**
 * Linear voxel indices of an ROI drawn on one slice, from its handle points in index space.
 * The slice axis is the one where all points agree; ellipses keep voxels inside the ellipse.
 */
export function roiVoxelIndices(
  ijkPoints: number[][],
  dimensions: number[],
  shape: 'ellipse' | 'rectangle'
): number[] {
  const min = [0, 1, 2].map(a => Math.min(...ijkPoints.map(p => p[a])));
  const max = [0, 1, 2].map(a => Math.max(...ijkPoints.map(p => p[a])));
  const extent = max.map((v, a) => v - min[a]);
  const sliceAxis = extent.indexOf(Math.min(...extent));
  const [u, v] = [0, 1, 2].filter(a => a !== sliceAxis);
  const slice = Math.round((min[sliceAxis] + max[sliceAxis]) / 2);
  const center = [(min[u] + max[u]) / 2, (min[v] + max[v]) / 2];
  const radius = [Math.max(extent[u] / 2, 0.5), Math.max(extent[v] / 2, 0.5)];

  const indices = [];
  for (let a = Math.ceil(min[u]); a <= Math.floor(max[u]); a++) {
    for (let b = Math.ceil(min[v]); b <= Math.floor(max[v]); b++) {
      const inside =
        shape === 'rectangle' ||
        ((a - center[0]) / radius[0]) ** 2 + ((b - center[1]) / radius[1]) ** 2 <= 1;
      const ijk = [];
      ijk[sliceAxis] = slice;
      ijk[u] = a;
      ijk[v] = b;
      if (inside && ijk.every((c, axis) => c >= 0 && c < dimensions[axis])) {
        indices.push(ijk[0] + ijk[1] * dimensions[0] + ijk[2] * dimensions[0] * dimensions[1]);
      }
    }
  }
  return indices;
}

/** Mean value per phase over the given voxels; getAt(index, phase) uses 1-based phases. */
export function meanCurve(
  indices: number[],
  phases: number,
  getAt: (index: number, phase: number) => number
): number[] {
  return Array.from({ length: phases }, (_, p) => {
    let sum = 0;
    indices.forEach(index => (sum += getAt(index, p + 1)));
    return indices.length ? sum / indices.length : 0;
  });
}

/** Relative enhancement in %: (S(t) − S0) / S0 × 100. */
export function percentEnhancement(curve: number[]): number[] {
  const s0 = curve[0];
  return curve.map(s => (s0 ? Math.round(((s - s0) / s0) * 1000) / 10 : 0));
}
