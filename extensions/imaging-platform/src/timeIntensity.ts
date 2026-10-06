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

/** A series that may be one phase of a dynamic study stored as one series per phase. */
export type PhaseSeries = {
  uid: string;
  studyUID: string;
  modality: string;
  frameOfReferenceUID: string;
  /** rows x columns x images */
  size: string;
  orientation: string;
  description: string;
  seriesNumber: number;
  /** Seconds (number) or DICOM TM; see seriesTime. */
  time?: number | string;
};

const TT_TAG = /[_\s-]*TT\s*=\s*([\d.]+)\s*s?/i;

/** Description without the phase time tag, e.g. "twist_20s_dyn_TRA (h20 ex B17)_TT=99.3s". */
export const phaseKey = (description = '') => description.replace(TT_TAG, '').trim();

/**
 * Phase time: the "TT=…s" tag some vendors put in the description (Siemens TWIST: the true
 * effective time, where AcquisitionTime is skewed by view sharing), else TriggerTime, else
 * AcquisitionTime / ContentTime.
 */
export function seriesTime(
  description: string,
  instance: { TriggerTime?: number | string; AcquisitionTime?: string; ContentTime?: string }
): number | string | undefined {
  const tt = TT_TAG.exec(description ?? '');
  if (tt) {
    return Number(tt[1]);
  }
  return instance.TriggerTime != null
    ? Number(instance.TriggerTime) / 1000
    : (instance.AcquisitionTime ?? instance.ContentTime);
}

/**
 * Fork: dynamic studies stored as one series per phase. The phases of `target`: series of the
 * same study, modality, frame of reference, matrix, orientation and description (time tag
 * removed), ordered by time. Fewer than 3 means "not a dynamic study".
 */
export function phaseSeriesGroup(target: PhaseSeries, all: PhaseSeries[]): PhaseSeries[] {
  const key = phaseKey(target.description);
  const group = all.filter(
    s =>
      s.studyUID === target.studyUID &&
      s.modality === target.modality &&
      s.frameOfReferenceUID === target.frameOfReferenceUID &&
      s.size === target.size &&
      s.orientation === target.orientation &&
      phaseKey(s.description) === key
  );
  if (group.length < 3) {
    return [];
  }
  const seconds = (s: PhaseSeries) => tmToSeconds(s.time) ?? Infinity;
  return [...group].sort((a, b) => seconds(a) - seconds(b) || a.seriesNumber - b.seriesNumber);
}
