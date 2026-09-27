import { vec3 } from 'gl-matrix';
import { registrationBetween } from './linkViewportsAtCurrentPosition';

describe('registrationBetween', () => {
  it('maps the source slice position onto the target slice shown now', () => {
    const source = [-150, -120, -210];
    const target = [-160, -100, 35];
    const moved = vec3.transformMat4(
      vec3.create(),
      [-150, -120, -250],
      registrationBetween(target, source)
    );
    // 40 mm further down in the source is 40 mm further down in the target.
    expect(Array.from(moved)).toEqual([-160, -100, -5]);
  });
});
