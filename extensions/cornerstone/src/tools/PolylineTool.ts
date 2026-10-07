import {
  LengthTool,
  annotation as csAnnotation,
  drawing,
  utilities,
  cursors,
  state as csToolsState,
  Enums,
} from '@cornerstonejs/tools';
import { getEnabledElement } from '@cornerstonejs/core';

const { Events } = Enums;
const { getViewportIdsWithToolToRender } = utilities.viewportFilters;
const { triggerAnnotationRenderForViewportIds } = utilities;
const { hideElementCursor, resetElementCursor } = cursors.elementCursor;

/** Distance from a point to a segment, in canvas pixels. */
function distanceToSegment(p: number[], a: number[], b: number[]) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared
    ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lengthSquared))
    : 0;
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/**
 * Fork: Polyline. Click to add points, double-click (or Esc) to finish; reports the length along
 * the whole path (a vessel, ureter or catheter). Points can be dragged afterwards like Length.
 * The length sums each segment (Length's own calculation handles any number of points).
 */
class PolylineTool extends LengthTool {
  static toolName = 'Polyline';

  _drawing: { annotation; element: HTMLDivElement; viewportIdsToRender: string[] } | null = null;

  addNewAnnotation = evt => {
    const { currentPoints, element } = evt.detail;
    const world = currentPoints.world;
    const annotation = this.createAnnotation(evt, [[...world], [...world]]);
    csAnnotation.state.addAnnotation(annotation, element);
    const viewportIdsToRender = getViewportIdsWithToolToRender(element, this.getToolName());
    this.isDrawing = true;
    this._drawing = { annotation, element, viewportIdsToRender };
    this.editData = {
      annotation,
      viewportIdsToRender,
      handleIndex: 1,
      newAnnotation: true,
      hasMoved: false,
      movingTextBox: false,
    };
    csToolsState.isInteractingWithTool = true;
    hideElementCursor(element);
    element.addEventListener(Events.MOUSE_MOVE, this._polylineMove);
    // The browser's own events: Cornerstone holds a click back ~0.4 s to tell it from a
    // double-click, and drops a second click inside that time, so quick points went missing.
    element.addEventListener('mousedown', this._polylineAddPoint);
    element.addEventListener('dblclick', this._polylineFinish);
    element.addEventListener(Events.KEY_DOWN, this._polylineKey);
    evt.preventDefault();
    triggerAnnotationRenderForViewportIds(viewportIdsToRender);
    return annotation;
  };

  /** The last point follows the mouse until the next click fixes it. */
  _polylineMove = evt => {
    const { annotation, viewportIdsToRender } = this._drawing ?? {};
    if (!annotation) {
      return;
    }
    const points = annotation.data.handles.points;
    points[points.length - 1] = [...evt.detail.currentPoints.world];
    annotation.invalidated = true;
    triggerAnnotationRenderForViewportIds(viewportIdsToRender);
  };

  _polylineAddPoint = evt => {
    const { annotation, viewportIdsToRender } = this._drawing ?? {};
    if (!annotation) {
      return;
    }
    // Fix the following point where the click landed, then start a new one there.
    const points = annotation.data.handles.points;
    if (evt.button !== 0) {
      return;
    }
    const world = this._worldAt(evt);
    points[points.length - 1] = world;
    points.push([...world]);
    annotation.invalidated = true;
    triggerAnnotationRenderForViewportIds(viewportIdsToRender);
    evt.preventDefault();
  };

  _polylineFinish = evt => {
    const { annotation, element } = this._drawing ?? {};
    if (!annotation) {
      return;
    }
    const points = annotation.data.handles.points;
    // The double-click places the last point (Esc keeps the path as clicked).
    const world = evt?.clientX !== undefined ? this._worldAt(evt) : null;
    if (world) {
      points[points.length - 1] = [...world];
    } else {
      points.pop();
    }
    // Drop repeated points (a click and the double-click on the same spot).
    const { viewport } = getEnabledElement(element);
    const near = (a, b) => {
      const [ca, cb] = [viewport.worldToCanvas(a), viewport.worldToCanvas(b)];
      return Math.hypot(ca[0] - cb[0], ca[1] - cb[1]) < 4;
    };
    for (let index = points.length - 1; index > 0; index--) {
      if (near(points[index], points[index - 1])) {
        points.splice(index, 1);
      }
    }
    this._polylineEnd();
    evt?.preventDefault?.();
  };

  /** World position of a browser mouse event on the view being drawn on. */
  _worldAt(evt: MouseEvent): number[] {
    const { element } = this._drawing;
    const rect = element.getBoundingClientRect();
    const { viewport } = getEnabledElement(element);
    return [...viewport.canvasToWorld([evt.clientX - rect.left, evt.clientY - rect.top])];
  }

  _polylineKey = evt => {
    if (evt.detail?.key === 'Escape') {
      this._polylineFinish(evt);
    }
  };

  _polylineEnd() {
    const { annotation, element, viewportIdsToRender } = this._drawing;
    element.removeEventListener(Events.MOUSE_MOVE, this._polylineMove);
    element.removeEventListener('mousedown', this._polylineAddPoint);
    element.removeEventListener('dblclick', this._polylineFinish);
    element.removeEventListener(Events.KEY_DOWN, this._polylineKey);
    csToolsState.isInteractingWithTool = false;
    resetElementCursor(element);
    this._drawing = null;
    this.editData = null;
    this.isDrawing = false;
    const points = annotation.data.handles.points;
    const { viewport } = getEnabledElement(element);
    const [first, last] = [points[0], points[points.length - 1]].map(p =>
      viewport.worldToCanvas(p)
    );
    if (points.length < 2 || Math.hypot(first[0] - last[0], first[1] - last[1]) < 2) {
      csAnnotation.state.removeAnnotation(annotation.annotationUID);
    } else {
      annotation.invalidated = true;
      csAnnotation.state.triggerAnnotationCompleted(annotation);
    }
    triggerAnnotationRenderForViewportIds(viewportIdsToRender);
  }

  cancel = element => {
    if (this._drawing) {
      this._polylineEnd();
    }
    return undefined;
  };

  isPointNearTool = (element, annotation, canvasCoords, proximity) => {
    const { viewport } = getEnabledElement(element);
    const points = annotation.data.handles.points.map(p => viewport.worldToCanvas(p));
    return points.some(
      (point, index) =>
        index > 0 && distanceToSegment(canvasCoords, points[index - 1], point) <= proximity
    );
  };

  renderAnnotation = (enabledElement, svgDrawingHelper) => {
    const { viewport } = enabledElement;
    const { element } = viewport;
    let annotations = csAnnotation.state.getAnnotations(this.getToolName(), element);
    annotations = annotations?.length
      ? this.filterInteractableAnnotationsForElement(element, annotations)
      : [];
    if (!annotations?.length) {
      return false;
    }
    const targetId = this.getTargetId(viewport);
    const renderingEngine = viewport.getRenderingEngine();
    const styleSpecifier: any = {
      toolGroupId: this.toolGroupId,
      toolName: this.getToolName(),
      viewportId: viewport.id,
    };
    let rendered = false;
    for (const annotation of annotations) {
      const { annotationUID, data } = annotation;
      if (!csAnnotation.visibility.isAnnotationVisible(annotationUID)) {
        continue;
      }
      styleSpecifier.annotationUID = annotationUID;
      const { color, lineWidth, lineDash, shadow } = this.getAnnotationStyle({
        annotation,
        styleSpecifier,
      });
      const canvasCoordinates = data.handles.points.map(p => viewport.worldToCanvas(p));
      if (!data.cachedStats[targetId] || data.cachedStats[targetId].unit == null) {
        data.cachedStats[targetId] = { length: null, unit: null };
        this._calculateCachedStats(annotation, renderingEngine, enabledElement);
      } else if (annotation.invalidated) {
        this._throttledCalculateCachedStats(annotation, renderingEngine, enabledElement);
      }
      drawing.drawPolyline(svgDrawingHelper, annotationUID, 'path', canvasCoordinates, {
        color,
        width: lineWidth,
        lineWidth,
        lineDash,
        shadow,
      });
      const showHandles =
        this._drawing?.annotation === annotation ||
        (!csAnnotation.locking.isAnnotationLocked(annotationUID) &&
          data.handles.activeHandleIndex !== null &&
          data.handles.activeHandleIndex !== undefined);
      if (showHandles) {
        drawing.drawHandles(svgDrawingHelper, annotationUID, 'handles', canvasCoordinates, {
          color,
          lineDash,
          lineWidth,
        });
      }
      rendered = true;
      if (this._drawing?.annotation === annotation) {
        continue; // the length appears once the path is finished
      }
      const textLines = this.configuration.getTextLines(data, targetId);
      this.renderLinkedTextBoxAnnotation({
        enabledElement,
        svgDrawingHelper,
        annotation,
        styleSpecifier,
        textLines: textLines ?? [],
        canvasCoordinates,
      });
    }
    return rendered;
  };
}

export default PolylineTool;
