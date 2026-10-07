/**
 * Fork: the arithmetic behind the extra measuring tools (Height difference, CTR, Spine labels,
 * TT-TG), kept free of Cornerstone so it can be tested on its own. Points are world
 * coordinates in mm.
 */
type Vec3 = number[];

const sub = (a: Vec3, b: Vec3) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: Vec3) => Math.sqrt(dot(a, a));

/** Vertical offset between two points as the image is shown (along the view's up direction). */
export function verticalOffset(from: Vec3, to: Vec3, viewUp: Vec3): number {
  const up = norm(viewUp) ? viewUp.map(v => v / norm(viewUp)) : [0, -1, 0];
  return Math.abs(dot(sub(to, from), up));
}

/**
 * CTR for lines drawn in pairs on one image (heart width and chest width, in either order):
 * each second line of a pair gets shorter / longer; unpaired lines get nothing.
 */
export function ctrRatios(lengths: number[]): Array<number | undefined> {
  return lengths.map((length, index) => {
    if (index % 2 === 0) {
      return undefined;
    }
    const other = lengths[index - 1];
    const longer = Math.max(length, other);
    return longer > 0 ? Math.min(length, other) / longer : undefined;
  });
}

export const SPINE_LEVELS = [
  ...Array.from({ length: 7 }, (_, i) => `C${i + 1}`),
  ...Array.from({ length: 12 }, (_, i) => `T${i + 1}`),
  ...Array.from({ length: 5 }, (_, i) => `L${i + 1}`),
  ...Array.from({ length: 5 }, (_, i) => `S${i + 1}`),
];

/** The level below a vertebra label ("L4" -> "L5", "L5" -> "S1"); null past S5 or if unknown. */
export function nextSpineLevel(label: string): string | null {
  const index = SPINE_LEVELS.indexOf(label?.trim().toUpperCase());
  return index === -1 ? null : (SPINE_LEVELS[index + 1] ?? null);
}

/**
 * TT-TG distance: the tibial tuberosity (TT) to trochlear groove (TG) offset measured along the
 * posterior condylar line (medial to lateral condyle), within the axial plane. The four points
 * may lie on different slices.
 */
export function ttTgDistance(
  medialCondyle: Vec3,
  lateralCondyle: Vec3,
  groove: Vec3,
  tuberosity: Vec3,
  sliceNormal: Vec3
): number | null {
  const n = norm(sliceNormal) ? sliceNormal.map(v => v / norm(sliceNormal)) : [0, 0, 1];
  const line = sub(lateralCondyle, medialCondyle);
  const inPlane = sub(
    line,
    n.map(v => v * dot(line, n))
  );
  const length = norm(inPlane);
  if (!length) {
    return null;
  }
  const direction = inPlane.map(v => v / length);
  return Math.abs(dot(sub(tuberosity, groove), direction));
}
