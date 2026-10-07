import { shouldInvert } from './invertPetStacks';

jest.mock('@cornerstonejs/core', () => ({ Enums: { ViewportType: { STACK: 'stack' } } }));

it('inverts PET in 2D views only', () => {
  expect(shouldInvert('stack', 'PT')).toBe(true);
  expect(shouldInvert('stack', 'CT')).toBe(false);
  expect(shouldInvert('orthographic', 'PT')).toBe(false); // workflow/fusion volumes keep theirs
});
