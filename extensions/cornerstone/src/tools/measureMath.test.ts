import { ctrRatios, nextSpineLevel, ttTgDistance, verticalOffset } from './measureMath';

describe('verticalOffset', () => {
  it('measures only the up-down component of the line', () => {
    expect(verticalOffset([0, 0, 0], [30, 12, 0], [0, -1, 0])).toBe(12);
  });
});

describe('ctrRatios', () => {
  it('gives shorter / longer on the second line of each pair, whatever the order', () => {
    expect(ctrRatios([120, 250, 260, 130, 90])).toEqual([
      undefined,
      0.48,
      undefined,
      0.5,
      undefined,
    ]);
  });
});

describe('nextSpineLevel', () => {
  it('steps down the spine across regions', () => {
    expect(nextSpineLevel('C7')).toBe('T1');
    expect(nextSpineLevel('l5')).toBe('S1');
    expect(nextSpineLevel('S5')).toBeNull();
    expect(nextSpineLevel('disc')).toBeNull();
  });
});

describe('ttTgDistance', () => {
  it('measures the TT-TG offset along the condylar line, ignoring slice distance', () => {
    // Condylar line along x; TG at x=10 on one slice, TT at x=25 three slices lower.
    const d = ttTgDistance([0, 50, 0], [60, 50, 0], [10, 20, 0], [25, 35, -12], [0, 0, 1]);
    expect(d).toBeCloseTo(15);
  });

  it('follows a rotated condylar line', () => {
    const d = ttTgDistance([0, 0, 0], [30, 40, 0], [0, 0, 0], [3, 4, 0], [0, 0, 1]);
    expect(d).toBeCloseTo(5);
  });
});
