import { bestShift, Profile, sliceFeatures } from './alignByAnatomy';

// Synthetic hip-to-jaw CT sampled every 5 mm: body, lung-range and bone fractions.
const body = (mm: number): number[] => [
  0.4 + 0.1 * Math.sin(mm / 90),
  mm > 300 && mm < 550 ? 0.3 : 0.02, // lungs
  mm < 120 ? 0.15 : mm > 600 ? 0.08 : 0.04, // pelvis, shoulders/jaw
];
const profile = (fromMm: number, toMm: number, start: number): Profile => {
  const values = [];
  for (let mm = fromMm; mm <= toMm; mm += 5) {
    values.push(body(mm));
  }
  return { start, values };
};

describe('bestShift', () => {
  it('finds where an abdomen-only prior sits inside a hip-to-jaw study', () => {
    const current = profile(0, 700, -900); // table position -900 at the hips
    const prior = profile(150, 450, 40); // other day, other table origin
    const { shiftMm, score } = bestShift(current, prior);
    // Anatomy at 150 mm is -750 in current and 40 in the prior.
    expect(shiftMm).toBe(40 - -750);
    expect(score).toBeGreaterThan(0.9);
  });

  it('scores unrelated anatomy below the match threshold', () => {
    const current = profile(0, 700, 0);
    const head: Profile = {
      start: 0,
      values: Array.from({ length: 40 }, (_, i) => [0.3, 0.01, ((i * 7919) % 13) / 13]),
    };
    expect(bestShift(current, head).score).toBeLessThan(0.6);
  });
});

describe('sliceFeatures', () => {
  it('counts lung-range air only inside the body, not around the patient', () => {
    // 8x8 image in HU: outside air (-1000), body wall (40) at columns 1 and 6, lung between.
    const row = [-1000, 40, -800, -800, -800, -800, 40, -1000];
    const image = {
      rows: 8,
      columns: 8,
      preScale: { scaled: true },
      getPixelData: () => Array.from({ length: 8 }, () => row).flat(),
    };
    // Sampled every 4th pixel: columns 0 (air) and 4 (lung). No body pixel sampled -> no lung.
    expect(sliceFeatures(image)[1]).toBe(0);
    const wide = {
      ...image,
      rows: 1,
      columns: 16,
      getPixelData: () => [
        -1000, -1000, -1000, -1000, 40, 40, 40, 40, -800, -800, -800, -800, 40, 40, 40, 40,
      ],
    };
    // Samples at 0 (outside air), 4 (body), 8 (lung), 12 (body): 1 lung out of 4.
    expect(sliceFeatures(wide)).toEqual([0.5, 0.25, 0]);
  });
});
