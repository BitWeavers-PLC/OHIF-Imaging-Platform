import { orderByDistance } from './readerFirstLoader';

describe('orderByDistance', () => {
  const slices = [0, -5, -10, -15, -20, -25].map(z => ({ z }));
  const zOf = s => s.z;

  it('loads from the top first when the reader is at the top', () => {
    expect(orderByDistance(slices, zOf, 0).map(zOf)).toEqual([0, -5, -10, -15, -20, -25]);
  });

  it('spreads out from where the reader is, preferring further down on ties', () => {
    expect(orderByDistance(slices, zOf, -10).map(zOf)).toEqual([-10, -15, -5, -20, 0, -25]);
  });
});
