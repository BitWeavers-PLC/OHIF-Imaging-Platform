import { mat4 } from 'gl-matrix';

const mockAdd = jest.fn();
const mockLoadImage = jest.fn();
jest.mock('@cornerstonejs/core', () => ({
  Enums: { ViewportType: { STACK: 'stack', ORTHOGRAPHIC: 'orthographic' } },
  imageLoader: { loadAndCacheImage: (...args) => mockLoadImage(...args) },
  metaData: {
    get: (_type, imageId) => ({
      imagePositionPatient: [0, 0, Number(imageId.split(':')[1])],
      rowCosines: [1, 0, 0],
      columnCosines: [0, 1, 0],
    }),
  },
  utilities: { spatialRegistrationMetadataProvider: { add: (...args) => mockAdd(...args) } },
}));
jest.mock('@ohif/i18n', () => ({ t: key => key }));

import alignByAnatomy from './alignByAnatomy';

// Pre-contrast and CTA of one exam: same frame of reference, shown at different levels.
const viewport = (type, current) => ({
  type,
  getCurrentImageId: () => `z:${current}`,
  getImageIds: () => [0, 3, 6, 9].map(z => `z:${z}`),
  getFrameOfReferenceUID: () => 'exam-1',
  getRenderingEngine: () => ({ id: 'engine' }),
});

it('links series of one scan by position, without an anatomy match', async () => {
  const viewports = { pre: viewport('stack', 0), cta: viewport('orthographic', 9) };
  const fireEvent = jest.fn();
  const show = jest.fn();
  const services = {
    viewportGridService: {
      getState: () => ({
        activeViewportId: 'pre',
        viewports: new Map([
          ['pre', {}],
          ['cta', {}],
        ]),
      }),
      getDisplaySetsUIDsForViewport: () => ['ds'],
    },
    displaySetService: { getDisplaySetByUID: () => ({ Modality: 'CT' }) },
    cornerstoneViewportService: { getCornerstoneViewport: id => viewports[id] },
    syncGroupService: { addViewportToSyncGroup: jest.fn(), getSynchronizer: () => ({ fireEvent }) },
    uiNotificationService: { show, hide: jest.fn() },
  };

  await alignByAnatomy({ servicesManager: { services } } as any);

  expect(mockLoadImage).not.toHaveBeenCalled();
  // Identity both ways, so an older F5 offset between them is replaced.
  expect(mockAdd).toHaveBeenCalledWith(['cta', 'pre'], mat4.create());
  expect(mockAdd).toHaveBeenCalledWith(['pre', 'cta'], mat4.create());
  expect(fireEvent).toHaveBeenCalled();
  expect(show).toHaveBeenLastCalledWith(
    expect.objectContaining({ message: 'Messages:Aligned by position (same scan)' })
  );
});
