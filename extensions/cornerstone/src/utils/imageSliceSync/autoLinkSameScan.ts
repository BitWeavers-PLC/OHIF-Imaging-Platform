import { Enums, eventTarget, metaData, utilities } from '@cornerstonejs/core';
import { vec3 } from 'gl-matrix';

const IMAGE_SLICE_SYNC = 'IMAGE_SLICE_SYNC';

type View = { id: string; frameOfReferenceUID: string; normal: number[]; synced: boolean };

/**
 * Viewports to scroll together: series of one scan (same frame of reference, parallel
 * slices) shown side by side, e.g. CT and PET of a PET/CT or axial T1 and FLAIR.
 */
export function sameScanGroups(views: View[]): View[][] {
  const groups: View[][] = [];
  views.forEach(view => {
    const group = groups.find(
      ([first]) =>
        first.frameOfReferenceUID === view.frameOfReferenceUID &&
        Math.abs(vec3.dot(first.normal as vec3, view.normal as vec3)) > 0.99
    );
    group ? group.push(view) : groups.push([view]);
  });
  return groups.filter(group => group.length > 1);
}

/**
 * The view the others line up to: one whose series did not just change (the one being read),
 * preferring the active one; when all changed (a layout opened), the active or first.
 */
export function lineUpSource(ids: string[], changed: Set<string>, activeId: string) {
  const steady = ids.filter(id => !changed.has(id));
  const pool = steady.length ? steady : ids;
  return pool.includes(activeId) ? activeId : pool[0];
}

function sliceNormal(imageId: string): number[] | null {
  const { rowCosines, columnCosines } = metaData.get('imagePlaneModule', imageId) ?? {};
  return rowCosines && columnCosines
    ? [...vec3.cross(vec3.create(), rowCosines, columnCosines)]
    : null;
}

type Position = { index: number; previous?: number; at: number };

/**
 * Track the last move. A view in two linked groups gets the same move twice; the repeat must
 * not overwrite where it came from.
 */
export function nextPosition(last: Position | undefined, index: number, at: number): Position {
  return last && last.index === index ? { ...last, at } : { index, previous: last?.index, at };
}

/** A move of another view this close to a series change was the link reacting to it. */
const SIDE_EFFECT_MS = 150;

/**
 * Fork: link series of one scan as soon as they are shown side by side (RadiAnt keeps them in
 * step without F5), and line a newly shown series up to the view being read. A new series
 * opens at its first (or remembered) image and an existing link drags the read view along,
 * so that move is undone first. Runs on series changes only, so turning sync off with F5
 * holds until the series change again.
 */
export default function registerAutoLinkSameScan({ servicesManager }: withAppTypes) {
  const { cornerstoneViewportService, viewportGridService, syncGroupService } =
    servicesManager.services;
  let timer: ReturnType<typeof setTimeout>;
  let changed = new Set<string>();
  let changedAt = 0;
  // Last two slice positions per viewport, to undo a move caused by a series change.
  const positions = new Map<string, Position>();

  const remember = (viewportId: string, index: number) =>
    positions.set(viewportId, nextPosition(positions.get(viewportId), index, performance.now()));
  eventTarget.addEventListener(Enums.Events.ELEMENT_ENABLED, (evt: any) => {
    const { element, viewportId } = evt.detail;
    element.addEventListener(Enums.Events.STACK_NEW_IMAGE, (e: any) =>
      remember(viewportId, e.detail.imageIdIndex)
    );
    element.addEventListener(Enums.Events.VOLUME_NEW_IMAGE, (e: any) =>
      remember(viewportId, e.detail.imageIndex)
    );
  });

  const imageSliceSynchronizers = (viewportId: string) =>
    syncGroupService
      .getSynchronizersForViewport(viewportId)
      .filter(synchronizer => syncGroupService.isImageSliceSyncronizer(synchronizer));

  const link = () => {
    const views: View[] = [];
    viewportGridService.getState().viewports.forEach((_, id) => {
      const viewport = cornerstoneViewportService.getCornerstoneViewport(id) as any;
      const types = [Enums.ViewportType.STACK, Enums.ViewportType.ORTHOGRAPHIC];
      // Volume viewports have a current image only in the acquisition plane.
      const imageId = types.includes(viewport?.type) && viewport.getCurrentImageId?.();
      const normal = imageId && sliceNormal(imageId);
      if (!normal) {
        return;
      }
      views.push({
        id,
        frameOfReferenceUID: viewport.getFrameOfReferenceUID(),
        normal,
        synced: imageSliceSynchronizers(id).length > 0,
      });
    });

    const activeId = viewportGridService.getActiveViewportId();
    const renderingEngineId = cornerstoneViewportService.getRenderingEngine().id;
    sameScanGroups(views).forEach(group => {
      const ids = group.map(view => view.id);
      // Members in different groups (or none) all join one, so each can reach the others.
      if (group.some(view => !view.synced)) {
        ids.forEach(id =>
          syncGroupService.addViewportToSyncGroup(id, renderingEngineId, {
            type: 'imageSlice',
            id: IMAGE_SLICE_SYNC,
            source: true,
            target: true,
          })
        );
      }
      const source = lineUpSource(ids, changed, activeId);
      const moved = positions.get(source);
      const dragged =
        !changed.has(source) &&
        moved?.previous != null &&
        Math.abs(moved.at - changedAt) < SIDE_EFFECT_MS;
      if (dragged) {
        // Back to where the reader was; its own link then lines the new series up.
        const viewport = cornerstoneViewportService.getCornerstoneViewport(source) as any;
        utilities.jumpToSlice(viewport.element, { imageIndex: moved.previous });
        return;
      }
      imageSliceSynchronizers(source).forEach(synchronizer =>
        synchronizer.fireEvent({ viewportId: source, renderingEngineId }, {} as Event)
      );
    });
    changed = new Set();
  };

  cornerstoneViewportService.subscribe(
    cornerstoneViewportService.EVENTS.VIEWPORT_DATA_CHANGED,
    ({ viewportId }) => {
      changed.add(viewportId);
      changedAt = performance.now();
      // Several viewports change together when a layout opens: link once they have settled.
      clearTimeout(timer);
      timer = setTimeout(link, 300);
    }
  );
}
