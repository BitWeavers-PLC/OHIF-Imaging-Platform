import { cache, Enums as csEnums, imageLoader } from '@cornerstonejs/core';
import {
  annotation,
  Enums as csToolsEnums,
  segmentation as cstSegmentation,
} from '@cornerstonejs/tools';
import * as polySeg from '@cornerstonejs/polymorphic-segmentation';
import i18n from '@ohif/i18n';

/**
 * Cornerstone 4.17 bug: getAnnotationMapFromSegmentation turns an empty childAnnotationUIDs
 * ([] — every interpolated contour has one) into holesPolyline = 0, and the polySeg worker
 * then fails on `0?.map`. An absent list means "no holes" everywhere else, so drop empty ones.
 */
export function clearEmptyHoles(
  annotations: Array<{ childAnnotationUIDs?: string[] } | undefined>
) {
  annotations.forEach(item => {
    if (Array.isArray(item?.childAnnotationUIDs) && !item.childAnnotationUIDs.length) {
      delete item.childAnnotationUIDs;
    }
  });
}

/**
 * Copies converted slices into a full-length labelmap, matched by the source image each slice
 * belongs to (polySeg only returns slices that have contours).
 */
export function copySlicesByReference(
  source: Array<{ referencedImageId: string; data: ArrayLike<number> }>,
  target: Map<string, { set: (data: ArrayLike<number>) => void }>
): number {
  let copied = 0;
  source.forEach(({ referencedImageId, data }) => {
    const slice = target.get(referencedImageId);
    if (slice) {
      slice.set(data);
      copied++;
    }
  });
  return copied;
}

const targetFor = (imageId: string) => {
  const image = cache.getImage(imageId);
  return {
    set: data => {
      image.voxelManager.getScalarData().set(data);
      image.imageFrame?.pixelData?.set(data);
    },
  };
};

/**
 * Fork: "Show in all planes" for a contour segmentation. Contours are drawn per acquisition
 * slice, so other planes cannot show them; this makes a labelmap copy (filled 3D volume) that
 * every view shows and that can be edited and downloaded like any labelmap. It is a snapshot:
 * run it again after editing the contours (the copy is replaced).
 */
export default async function showContourInAllPlanes({
  servicesManager,
  segmentationId,
}: withAppTypes<{ segmentationId: string }>) {
  const {
    segmentationService,
    viewportGridService,
    cornerstoneViewportService,
    displaySetService,
    uiNotificationService,
  } = servicesManager.services;
  const contour = segmentationService.getSegmentation(segmentationId);
  const annotationUIDs = [
    ...(contour?.representationData.Contour?.annotationUIDsMap?.values() ?? []),
  ].flatMap(uids => [...uids]);
  if (!annotationUIDs.length) {
    uiNotificationService.show({
      message: i18n.t('Messages:Draw contours first'),
      type: 'warning',
    });
    return;
  }
  clearEmptyHoles(annotationUIDs.map(uid => annotation.state.getAnnotation(uid) as any));

  // The conversion runs per slice, so it needs a 2D view of the contours' series.
  const viewportIds = [...viewportGridService.getState().viewports.keys()];
  const showing = viewportIds.filter(
    id => segmentationService.getSegmentationRepresentations(id, { segmentationId }).length
  );
  const stackId = showing.find(
    id => cornerstoneViewportService.getCornerstoneViewport(id)?.type === csEnums.ViewportType.STACK
  );
  if (!stackId) {
    uiNotificationService.show({
      message: i18n.t('Messages:Open the series in a 2D view to convert its contours'),
      type: 'warning',
    });
    return;
  }
  const stack = cornerstoneViewportService.getCornerstoneViewport(stackId) as any;
  const displaySet = displaySetService.getDisplaySetByUID(
    viewportGridService.getDisplaySetsUIDsForViewport(stackId)[0]
  );
  // polySeg requires every source image in the cache.
  await Promise.all(stack.getImageIds().map(imageId => imageLoader.loadAndCacheImage(imageId)));

  const { imageIds: convertedIds } = await polySeg.computeLabelmapData(segmentationId, {
    viewport: stack,
  });

  const labelmapId = `${segmentationId}-3d`;
  if (segmentationService.getSegmentation(labelmapId)) {
    segmentationService.remove(labelmapId);
  }
  await segmentationService.createLabelmapForDisplaySet(displaySet, {
    segmentationId: labelmapId,
    label: `${contour.label} (3D)`,
    segments: structuredClone(contour.segments),
  });
  const labelmap = segmentationService.getSegmentation(labelmapId);
  const target = new Map(
    (labelmap.representationData.Labelmap as any).imageIds.map(imageId => [
      cache.getImage(imageId).referencedImageId,
      targetFor(imageId),
    ])
  );
  copySlicesByReference(
    convertedIds.map(imageId => {
      const image = cache.getImage(imageId);
      return {
        referencedImageId: image.referencedImageId,
        data: image.voxelManager.getScalarData(),
      };
    }),
    target as any
  );

  for (const viewportId of showing) {
    await segmentationService.addSegmentationRepresentation(viewportId, {
      segmentationId: labelmapId,
      type: csToolsEnums.SegmentationRepresentations.Labelmap,
    });
  }
  cstSegmentation.triggerSegmentationEvents.triggerSegmentationDataModified(labelmapId);
  uiNotificationService.show({
    message: i18n.t('Messages:Contours shown in all planes as {{label}}', {
      label: labelmap.label,
    }),
    type: 'success',
  });
}
