import toggleImageSliceSync from './toggleImageSliceSync';

jest.mock('./linkViewportsAtCurrentPosition', () => jest.fn());

it('turns off the compare layout slice sync instead of adding a second group', () => {
  const compareSlice = { id: 'compareSlice' };
  const syncGroupService = {
    getSynchronizersForViewport: jest.fn(() => [compareSlice]),
    isImageSliceSyncronizer: s => s === compareSlice,
    addViewportToSyncGroup: jest.fn(),
    removeViewportFromSyncGroup: jest.fn(),
  };
  const gridViewport = { viewportOptions: { viewportId: 'vp1' }, displaySetInstanceUIDs: ['ds1'] };
  const servicesManager = {
    services: {
      syncGroupService,
      viewportGridService: { getState: () => ({ viewports: new Map([['vp1', gridViewport]]) }) },
      displaySetService: { getDisplaySetByUID: () => ({ isReconstructable: true }) },
      cornerstoneViewportService: {
        getCornerstoneViewport: () => ({ getRenderingEngine: () => ({ id: 're' }) }),
      },
    },
  };

  toggleImageSliceSync({ servicesManager } as any);

  expect(syncGroupService.removeViewportFromSyncGroup).toHaveBeenCalledWith(
    'vp1',
    're',
    'compareSlice'
  );
  expect(syncGroupService.addViewportToSyncGroup).not.toHaveBeenCalled();
});
