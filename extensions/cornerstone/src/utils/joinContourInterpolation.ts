import { eventTarget, getRenderingEngines, triggerEvent, utilities } from '@cornerstonejs/core';
import { annotation as csAnnotation, Enums, ToolGroupManager } from '@cornerstonejs/tools';

type ContourAnnotation = {
  interpolationUID?: string;
  metadata: { toolName: string; viewPlaneNormal: number[]; referencedImageId?: string };
  data: { segmentation?: { segmentationId: string; segmentIndex: number } };
};

/**
 * The interpolation group a just-finished key contour should move to: another group of the
 * same tool, segment and plane. Cornerstone (4.17) skips groups that already interpolated, so a
 * third key contour started a new group and the slices between the 2nd and 3rd were never filled.
 * ponytail: one group per segment and plane; two separate lesions in one segment get joined,
 * so use a segment per lesion.
 */
export function interpolationGroupFor(
  finished: ContourAnnotation,
  all: ContourAnnotation[]
): string | undefined {
  const seg = finished.data.segmentation;
  if (!seg) {
    return undefined;
  }
  return all.find(
    other =>
      other !== finished &&
      other.interpolationUID &&
      other.interpolationUID !== finished.interpolationUID &&
      other.metadata.toolName === finished.metadata.toolName &&
      other.data.segmentation?.segmentationId === seg.segmentationId &&
      other.data.segmentation?.segmentIndex === seg.segmentIndex &&
      utilities.isEqual(other.metadata.viewPlaneNormal, finished.metadata.viewPlaneNormal)
  )?.interpolationUID;
}

const interpolationOn = (toolName: string) =>
  ToolGroupManager.getAllToolGroups().some(
    group =>
      group.hasTool(toolName) && group.getToolConfiguration(toolName, 'interpolation')?.enabled
  );

/**
 * Fork: after Cornerstone has handled a finished contour (its listener is registered first),
 * move it into the segment's existing group and report it modified: Cornerstone then
 * re-interpolates that group with the new key, so every slice between the first and last
 * contour is filled. Done on completion, not while drawing, so no half-drawn outline is used.
 */
export default function registerJoinContourInterpolation() {
  eventTarget.addEventListener(Enums.Events.ANNOTATION_COMPLETED, (evt: any) => {
    const finished = evt.detail?.annotation;
    if (!finished?.data?.segmentation || !interpolationOn(finished.metadata.toolName)) {
      return;
    }
    const group = interpolationGroupFor(finished, csAnnotation.state.getAllAnnotations() as any);
    const viewport = getRenderingEngines()
      .flatMap(engine => engine.getViewports())
      .find((vp: any) => vp.getCurrentImageId?.() === finished.metadata.referencedImageId);
    if (!group || !viewport) {
      return;
    }
    finished.interpolationUID = group;
    triggerEvent(eventTarget, Enums.Events.ANNOTATION_MODIFIED, {
      annotation: finished,
      viewportId: viewport.id,
      renderingEngineId: viewport.getRenderingEngine().id,
      changeType: Enums.ChangeTypes.HandlesUpdated,
    });
  });
}
