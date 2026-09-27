import { pairSlicesByPosition, subtractInto } from './subtraction';

describe('subtraction', () => {
  it('pairs slices by position regardless of order', () => {
    const post = [
      [0, 0, 0],
      [0, 0, 5],
      [0, 0, 10],
    ];
    const pre = [
      [0, 0, 10],
      [0, 0, 0.2],
      [0, 0, 5],
    ];
    expect(pairSlicesByPosition(post, pre)).toEqual([1, 2, 0]);
  });

  it('refuses series that do not line up', () => {
    expect(pairSlicesByPosition([[0, 0, 0]], [[0, 0, 3]])).toBeNull();
    expect(pairSlicesByPosition([[0, 0, 0]], [])).toBeNull();
  });

  it('computes post − pre and its range', () => {
    const target = new Float32Array(3);
    expect(subtractInto(target, [10, 50, 5], [10, 20, 8])).toEqual([-3, 30]);
    expect(Array.from(target)).toEqual([0, 30, -3]);
  });
});
