jest.mock('@cornerstonejs/polymorphic-segmentation', () => ({}));
jest.mock('@ohif/i18n', () => ({ t: key => key }));
import { clearEmptyHoles, copySlicesByReference } from './contourToLabelmap';

describe('clearEmptyHoles', () => {
  it('drops empty hole lists (interpolated contours) and keeps real holes', () => {
    const interpolated = { childAnnotationUIDs: [] };
    const withHole = { childAnnotationUIDs: ['hole-1'] };
    const drawn = {};
    clearEmptyHoles([interpolated, withHole, drawn, undefined]);
    expect('childAnnotationUIDs' in interpolated).toBe(false);
    expect(withHole.childAnnotationUIDs).toEqual(['hole-1']);
    expect(drawn).toEqual({});
  });
});

describe('copySlicesByReference', () => {
  it('puts each converted slice on the labelmap slice of the same source image', () => {
    const written = {};
    const target = new Map(
      ['ct-1', 'ct-2', 'ct-3'].map(id => [id, { set: data => (written[id] = Array.from(data)) }])
    );
    // polySeg only returns slices with contours, in its own order.
    const copied = copySlicesByReference(
      [
        { referencedImageId: 'ct-3', data: [3, 3] },
        { referencedImageId: 'ct-1', data: [1, 1] },
        { referencedImageId: 'other-series', data: [9, 9] },
      ],
      target
    );
    expect(copied).toBe(2);
    expect(written).toEqual({ 'ct-1': [1, 1], 'ct-3': [3, 3] });
  });
});
