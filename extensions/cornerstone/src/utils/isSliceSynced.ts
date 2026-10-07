// Links that move a view with others: F5's image-slice link, and the camera links layouts
// such as the PET/CT tumor volume use.
const SCROLL_LINKS = ['imageslice', 'cameraposition'];

/** Fork: whether this view scrolls with others (any enabled scroll link). */
export default function isSliceSynced(syncGroupService, viewportId: string) {
  return syncGroupService
    .getSynchronizersForViewport(viewportId)
    .some(
      synchronizer =>
        SCROLL_LINKS.includes(syncGroupService.getSynchronizerType(synchronizer)?.toLowerCase()) &&
        !synchronizer.getOptions?.(viewportId)?.disabled
    );
}
