import {
  cache,
  getRenderingEngines,
  imageLoadPoolManager,
  metaData,
  Enums,
  type Types,
} from '@cornerstonejs/core';

type Request = {
  callLoadImage: (imageId: string, imageIdIndex: number, options: unknown) => Promise<unknown>;
  imageId: string;
  imageIdIndex: number;
  options: unknown;
  additionalDetails: { volumeId: string };
};

const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Current imageId, or undefined; volume viewports throw until their first render. */
const currentImageId = (viewport: any): string | undefined => {
  try {
    return viewport?.getCurrentImageId?.();
  } catch {
    return undefined;
  }
};

/**
 * Requests ordered nearest-first to `focus` (a position along the scan axis); at equal distance
 * the slice further along the reading direction (lower position, i.e. towards the feet) wins.
 */
export function orderByDistance<T>(items: T[], positionOf: (item: T) => number, focus: number) {
  return [...items].sort((a, b) => {
    const da = Math.abs(positionOf(a) - focus);
    const db = Math.abs(positionOf(b) - focus);
    return da - db || positionOf(a) - positionOf(b);
  });
}

type Tracked = {
  requests: Request[];
  normal: number[];
  position: Map<string, number>;
  focus: number;
  /** The focus came from a shown slice or the reader, not the "top" placeholder. */
  anchored: boolean;
  /** imageIds whose request is running: never queued twice. */
  inFlight: Set<string>;
  lastQueued: number;
  cleanup: () => void;
};
const tracked = new Map<string, Tracked>();

const REQUEUE_MIN_MS = 250;

function queue(volumeId: string) {
  const entry = tracked.get(volumeId);
  const volume = cache.getVolume(volumeId) as any;
  if (!entry || !volume) {
    return;
  }
  if (volume.loadStatus?.loaded) {
    entry.cleanup();
    tracked.delete(volumeId);
    return;
  }
  const pending = entry.requests.filter(
    r => !volume.cachedFrames?.[r.imageIdIndex] && !entry.inFlight.has(r.imageId)
  );
  // Replace only this volume's queued requests; requests already in flight keep going.
  imageLoadPoolManager.filterRequests(r => r.additionalDetails?.volumeId !== volumeId);
  orderByDistance(pending, r => entry.position.get(r.imageId) ?? 0, entry.focus).forEach(r =>
    imageLoadPoolManager.addRequest(
      () => {
        entry.inFlight.add(r.imageId);
        return Promise.resolve(r.callLoadImage(r.imageId, r.imageIdIndex, r.options)).finally(() =>
          entry.inFlight.delete(r.imageId)
        );
      },
      Enums.RequestType.Prefetch,
      r.additionalDetails,
      0
    )
  );
  entry.lastQueued = Date.now();
}

/** Move the load focus of every tracked volume to a world point; re-queues when it moved enough. */
function focusAt(world: Types.Point3 | undefined) {
  if (!world) {
    return;
  }
  tracked.forEach((entry, volumeId) => {
    const focus = dot(world, entry.normal);
    const spacing = (cache.getVolume(volumeId) as any)?.spacing?.[2] ?? 1;
    const moved = Math.abs(focus - entry.focus) > 3 * spacing;
    entry.focus = focus;
    entry.anchored = true;
    if (moved && Date.now() - entry.lastQueued > REQUEUE_MIN_MS) {
      queue(volumeId);
    }
  });
}

const hasQueuedRequests = (volumeId: string) => {
  const pool = (imageLoadPoolManager as any).getRequestPool?.() ?? {};
  return Object.values(pool).some(byPriority =>
    Object.values(byPriority as Record<string, any[]>).some(requests =>
      requests.some(r => r.additionalDetails?.volumeId === volumeId)
    )
  );
};

/**
 * Stack prefetch clears the whole prefetch queue whenever a stack viewport changes image, which
 * also drops this volume's requests: put the remaining ones back (in reader order) when gone.
 */
/** Position of the slice a viewport of this volume shows (e.g. MPR opens at the middle). */
function shownPosition(volumeId: string): Types.Point3 | undefined {
  const viewport = (getRenderingEngines()[0]?.getViewports() ?? []).find(
    (v: any) => v.getVolumeId?.() === volumeId && currentImageId(v)
  ) as any;
  const imageId = currentImageId(viewport);
  return imageId && metaData.get('imagePlaneModule', imageId)?.imagePositionPatient;
}

function watchQueue(volumeId: string): () => void {
  const timer = setInterval(() => {
    // A throw here must never stop loading; the next tick retries.
    try {
      const entry = tracked.get(volumeId);
      const shown = entry && !entry.anchored && shownPosition(volumeId);
      if (shown) {
        entry.focus = dot(shown, entry.normal);
        entry.anchored = true;
        queue(volumeId);
      } else if (!hasQueuedRequests(volumeId)) {
        queue(volumeId);
      }
    } catch (error) {
      console.warn('readerFirstLoader', error);
    }
  }, 250);
  return () => clearInterval(timer);
}

/** Follow the reader: scrolling any viewport, or hovering a reformatted (volume) viewport. */
function listenToViewports(): () => void {
  const viewports = getRenderingEngines()[0]?.getViewports() ?? [];
  const removers = viewports.map((viewport: any) => {
    const { element } = viewport;
    const onScroll = () => {
      const imageId = currentImageId(viewport);
      const ipp = imageId && metaData.get('imagePlaneModule', imageId)?.imagePositionPatient;
      focusAt(ipp ?? viewport.getCamera?.().focalPoint);
    };
    const onHover = (evt: MouseEvent) =>
      viewport.type !== 'stack' && focusAt(viewport.canvasToWorld?.([evt.offsetX, evt.offsetY]));
    element.addEventListener(Enums.Events.STACK_NEW_IMAGE, onScroll);
    element.addEventListener(Enums.Events.VOLUME_NEW_IMAGE, onScroll);
    element.addEventListener('mousemove', onHover);
    return () => {
      element.removeEventListener(Enums.Events.STACK_NEW_IMAGE, onScroll);
      element.removeEventListener(Enums.Events.VOLUME_NEW_IMAGE, onScroll);
      element.removeEventListener('mousemove', onHover);
    };
  });
  return () => removers.forEach(remove => remove());
}

/**
 * Fork: hanging-protocol image load strategy ('readerFirst'). Volume slices load nearest-first
 * to where the reader is: the stack slice shown when the layout opens (normally the top), then
 * wherever they scroll or hover. Replaces Cornerstone's interleaved order, which fills top and
 * bottom at the same time.
 */
export default function readerFirstLoader({ data: { viewportId, volumeInputArray } }) {
  for (const { volumeId } of volumeInputArray) {
    const volume = cache.getVolume(volumeId) as any;
    if (!volume) {
      return;
    }
    if (tracked.has(volumeId) || volume.loadStatus?.loaded) {
      continue;
    }
    const requests: Request[] = (volume.getImageLoadRequests?.() ?? []).filter(r => r?.imageId);
    const direction = volume.direction ?? [1, 0, 0, 0, 1, 0, 0, 0, 1];
    const normal = [direction[6], direction[7], direction[8]];
    const position = new Map(
      requests.map(r => [
        r.imageId,
        dot(metaData.get('imagePlaneModule', r.imageId)?.imagePositionPatient ?? [0, 0, 0], normal),
      ])
    );
    const top = Math.max(...position.values());
    volume.loadStatus.loading = true;
    tracked.set(volumeId, {
      requests,
      normal,
      position,
      focus: top,
      anchored: false,
      inFlight: new Set(),
      lastQueued: 0,
      cleanup: () => {},
    });
  }

  // Start from what a stack viewport shows now (layouts open at the first image); else the top
  // until a viewport of the volume shows a slice (watchQueue anchors to it, e.g. MPR's middle).
  const stackViewport = (getRenderingEngines()[0]?.getViewports() ?? []).find(
    (v: any) => v.type === 'stack' && currentImageId(v)
  ) as any;
  const startImageId = currentImageId(stackViewport);
  const start =
    startImageId && metaData.get('imagePlaneModule', startImageId)?.imagePositionPatient;
  tracked.forEach((entry, volumeId) => {
    if (start) {
      entry.focus = dot(start, entry.normal);
      entry.anchored = true;
    }
    entry.cleanup();
    const stopListening = listenToViewports();
    const stopWatching = watchQueue(volumeId);
    entry.cleanup = () => {
      stopListening();
      stopWatching();
    };
    queue(volumeId);
  });

  return new Map([[viewportId, volumeInputArray]]);
}
