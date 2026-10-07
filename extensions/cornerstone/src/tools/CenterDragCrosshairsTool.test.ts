import { centerDragViewportIds } from './CenterDragCrosshairsTool';

jest.mock('@cornerstonejs/core', () => ({ getEnabledElement: jest.fn() }));
jest.mock('@cornerstonejs/tools', () => ({ CrosshairsTool: class {} }));

const line = id => [[0, 0, 0], { id }, [0, 0], [1, 1]] as any;
const points = [line('sag'), line('sag'), line('cor'), line('cor')];

describe('centerDragViewportIds', () => {
  it('moves both lines when the pointer is in the centre gap', () => {
    expect(centerDragViewportIds(points, [105, 100], [100, 100], 20, () => true)).toEqual([
      'sag',
      'cor',
    ]);
  });

  it('ignores points outside the gap and lines that cannot be dragged', () => {
    expect(centerDragViewportIds(points, [130, 100], [100, 100], 20, () => true)).toBeNull();
    expect(centerDragViewportIds(points, [100, 100], [100, 100], 20, id => id === 'cor')).toEqual([
      'cor',
    ]);
    expect(centerDragViewportIds(points, [100, 100], [100, 100], 20, () => false)).toBeNull();
  });
});
