import { getEnabledElement } from '@cornerstonejs/core';
import { CrosshairsTool } from '@cornerstonejs/tools';

type RotationPoint = [number[], { id: string }, number[], number[]];

/**
 * Viewports to move when the pointer is in the gap where the lines cross (both lines, so the
 * centre follows the mouse), or null when it is outside the gap.
 */
export function centerDragViewportIds(
  rotationPoints: RotationPoint[],
  canvasPoint: number[],
  centerCanvas: number[],
  gapRadius: number,
  canDrag: (viewportId: string) => boolean
): string[] | null {
  if (Math.hypot(canvasPoint[0] - centerCanvas[0], canvasPoint[1] - centerCanvas[1]) > gapRadius) {
    return null;
  }
  // Two entries (one per line half) for each other viewport.
  const ids = rotationPoints.filter((_, i) => i % 2 === 0).map(([, other]) => other.id);
  const draggable = ids.filter(canDrag);
  return draggable.length ? draggable : null;
}

/**
 * Fork: RadiAnt grabs the crosshair centre. Cornerstone leaves a gap where the lines cross and
 * only hit-tests the drawn lines, so a click in the centre browsed slices instead. Keeps the
 * 'Crosshairs' tool name.
 */
export default class CenterDragCrosshairsTool extends CrosshairsTool {
  _pointNearTool(element, annotation, canvasCoords, proximity) {
    // Cornerstone only sets this on a hit, so a stale DRAG from the last grab made a miss
    // report a hit with no lines to move (its own hover handler clears it first).
    annotation.data.handles.activeOperation = null;
    if (super._pointNearTool(element, annotation, canvasCoords, proximity)) {
      return true;
    }
    const { viewport } = getEnabledElement(element);
    const self = this as any;
    const ids = centerDragViewportIds(
      annotation.data.handles.rotationPoints,
      canvasCoords,
      viewport.worldToCanvas(self.toolCenter),
      this.configuration.referenceLinesCenterGapRadius + proximity,
      id => self._getReferenceLineControllable(id) && self._getReferenceLineDraggableRotatable(id)
    );
    if (!ids) {
      return false;
    }
    annotation.data.handles.activeOperation = 1; // OPERATION.DRAG
    annotation.data.activeViewportIds = ids;
    self.editData = { annotation };
    return true;
  }
}
