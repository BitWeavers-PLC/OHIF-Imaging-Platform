import { interpolationGroupFor } from './joinContourInterpolation';

const contour = (segmentIndex, interpolationUID?, normal = [0, 0, 1], segmentationId = 'seg') => ({
  interpolationUID,
  metadata: { toolName: 'PlanarFreehandContourSegmentationTool', viewPlaneNormal: normal },
  data: { segmentation: { segmentationId, segmentIndex } },
});

describe('interpolationGroupFor', () => {
  const tumour = contour(1, 'group-a');

  it('joins a new key contour to its segment group even after that group interpolated', () => {
    expect(interpolationGroupFor(contour(1), [tumour])).toBe('group-a');
  });

  it('keeps other segments, other segmentations and other planes apart', () => {
    expect(interpolationGroupFor(contour(2), [tumour])).toBeUndefined();
    expect(
      interpolationGroupFor(contour(1, undefined, [0, 0, 1], 'other'), [tumour])
    ).toBeUndefined();
    expect(interpolationGroupFor(contour(1, undefined, [0, 1, 0]), [tumour])).toBeUndefined();
  });

  it('moves a contour from its own new group into the existing one', () => {
    expect(interpolationGroupFor(contour(1, 'group-b'), [tumour])).toBe('group-a');
  });

  it('does nothing when the contour is already in that group', () => {
    expect(interpolationGroupFor(contour(1, 'group-a'), [tumour])).toBeUndefined();
  });
});
