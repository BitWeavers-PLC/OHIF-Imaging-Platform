import { DisplaySetService, ViewportGridService } from '@ohif/core';
import linkViewportsAtCurrentPosition from './linkViewportsAtCurrentPosition';

const IMAGE_SLICE_SYNC_NAME = 'IMAGE_SLICE_SYNC';

export default function toggleImageSliceSync({
  servicesManager,
  viewports: providedViewports,
  syncId,
}: withAppTypes) {
  const { syncGroupService, viewportGridService, displaySetService, cornerstoneViewportService } =
    servicesManager.services;

  syncId ||= IMAGE_SLICE_SYNC_NAME;

  const viewports =
    providedViewports || getReconstructableStackViewports(viewportGridService, displaySetService);

  // Todo: right now we don't have a proper way to define specific
  // viewports to add to synchronizers, and right now it is global or not
  // after we do that, we should do fine grained control of the synchronizers
  // Fork: any image-slice group counts (e.g. the compare layout's 'compareSlice'), so the
  // button, which already shows ON for those, turns them off instead of adding a second group.
  const someViewportHasSync = viewports.some(viewport =>
    syncGroupService
      .getSynchronizersForViewport(viewport.viewportOptions.viewportId)
      .some(synchronizer => syncGroupService.isImageSliceSyncronizer(synchronizer))
  );

  if (someViewportHasSync) {
    return disableSync(servicesManager);
  }

  // create synchronization group and add the viewports to it.
  viewports.forEach(gridViewport => {
    const { viewportId } = gridViewport.viewportOptions;
    const viewport = cornerstoneViewportService.getCornerstoneViewport(viewportId);
    if (!viewport) {
      return;
    }
    syncGroupService.addViewportToSyncGroup(viewportId, viewport.getRenderingEngine().id, {
      type: 'imageSlice',
      id: syncId,
      source: true,
      target: true,
    });
  });
  // Fork: series from other studies (priors) stay aligned at the anatomy shown now.
  linkViewportsAtCurrentPosition(viewports.map(viewport => viewport.viewportOptions.viewportId));
}

function disableSync(servicesManager: AppTypes.ServicesManager) {
  const { syncGroupService, viewportGridService, displaySetService, cornerstoneViewportService } =
    servicesManager.services;
  const viewports = getReconstructableStackViewports(viewportGridService, displaySetService);
  viewports.forEach(gridViewport => {
    const { viewportId } = gridViewport.viewportOptions;
    const viewport = cornerstoneViewportService.getCornerstoneViewport(viewportId);
    if (!viewport) {
      return;
    }
    syncGroupService
      .getSynchronizersForViewport(viewportId)
      .filter(synchronizer => syncGroupService.isImageSliceSyncronizer(synchronizer))
      .forEach(synchronizer =>
        syncGroupService.removeViewportFromSyncGroup(
          viewportId,
          viewport.getRenderingEngine().id,
          synchronizer.id
        )
      );
  });
}

/**
 * Gets the consistent spacing stack viewport types, which are the ones which
 * can be navigated using the stack image sync right now.
 */
function getReconstructableStackViewports(
  viewportGridService: ViewportGridService,
  displaySetService: DisplaySetService
) {
  let { viewports } = viewportGridService.getState();

  viewports = [...viewports.values()];
  // filter empty viewports
  viewports = viewports.filter(
    viewport => viewport.displaySetInstanceUIDs && viewport.displaySetInstanceUIDs.length
  );

  // filter reconstructable viewports
  viewports = viewports.filter(viewport => {
    const { displaySetInstanceUIDs } = viewport;

    for (const displaySetInstanceUID of displaySetInstanceUIDs) {
      const displaySet = displaySetService.getDisplaySetByUID(displaySetInstanceUID);

      // TODO - add a better test than isReconstructable
      if (displaySet && displaySet.isReconstructable) {
        return true;
      }

      return false;
    }
  });
  return viewports;
}
