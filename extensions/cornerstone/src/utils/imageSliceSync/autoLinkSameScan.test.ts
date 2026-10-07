import { inPlaneShift, lineUpSource, nextPosition, sameScanGroups } from './autoLinkSameScan';

jest.mock('@cornerstonejs/tools', () => ({ SynchronizerManager: {} }));
jest.mock('@cornerstonejs/core', () => ({
  getRenderingEngine: jest.fn(),
  Enums: { ViewportType: {} },
  metaData: {},
  eventTarget: {},
  utilities: {},
}));

const axial = [0, 0, 1];
const view = (id: string, frameOfReferenceUID: string, normal = axial, synced = false) => ({
  id,
  frameOfReferenceUID,
  normal,
  synced,
});

describe('sameScanGroups', () => {
  const ids = groups => groups.map(group => group.map(v => v.id));

  it('groups series of one scan shown side by side (CT and PET of a PET/CT)', () => {
    expect(ids(sameScanGroups([view('ct', 'scan1'), view('pet', 'scan1')]))).toEqual([
      ['ct', 'pet'],
    ]);
  });

  it('leaves priors and other planes out', () => {
    expect(
      sameScanGroups([
        view('current', 'scan1'),
        view('prior', 'scan0'), // other frame of reference: compare/F5 handle it
        view('sagittal', 'scan1', [1, 0, 0]), // same scan, different plane
      ])
    ).toEqual([]);
  });

  it('lines up to the view being read, not the series just dropped', () => {
    expect(lineUpSource(['ct', 'pet'], new Set(['pet']), 'pet')).toBe('ct');
    expect(lineUpSource(['ct', 'pet'], new Set(['ct', 'pet']), 'pet')).toBe('pet');
  });

  it('keeps where a view came from when the same move arrives twice', () => {
    const dragged = nextPosition({ index: 140, at: 1 }, 100, 2);
    expect(nextPosition(dragged, 100, 3)).toEqual({ index: 100, previous: 140, at: 3 });
  });

  it('centres a view on the other in its own plane, keeping its slice', () => {
    // PET centred 40 mm right of the CT and on another slice: move right only.
    expect(inPlaneShift([40, 0, -300], [0, 0, -350], [0, 0, 1])).toEqual([40, 0, 0]);
  });
});
