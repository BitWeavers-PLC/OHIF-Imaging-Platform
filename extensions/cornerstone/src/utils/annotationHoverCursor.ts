import { eventTarget, Enums as csEnums } from '@cornerstonejs/core';
import {
  Enums,
  LabelmapBaseTool,
  RegionSegmentPlusTool,
  RegionSegmentTool,
  ToolGroupManager,
  utilities,
  WholeBodySegmentTool,
} from '@cornerstonejs/tools';

// Tools that take the click before annotations can be grabbed (brushes, scissors, grow cut).
const CLICK_TAKERS = [
  LabelmapBaseTool,
  RegionSegmentPlusTool,
  RegionSegmentTool,
  WholeBodySegmentTool,
];

const MOVE = 'move';

/**
 * Next cursor for the viewport. `saved` is the tool's own cursor, kept while showing "move".
 * A tool that takes the click first (brushes, one-click segment) means a click would not grab
 * the annotation, so no "move" cursor then.
 */
export function nextCursor({
  current,
  saved,
  overAnnotation,
  toolTakesClick,
}: {
  current: string;
  saved: string | null;
  overAnnotation: boolean;
  toolTakesClick: boolean;
}): { cursor: string; saved: string | null } {
  if (overAnnotation && !toolTakesClick) {
    return current === MOVE ? { cursor: MOVE, saved } : { cursor: MOVE, saved: current };
  }
  // Restore only our own "move": a tool switch while hovering sets its cursor itself.
  if (current === MOVE && saved !== null) {
    return { cursor: saved, saved: null };
  }
  return { cursor: current, saved: null };
}

// Same hit tests as Cornerstone's mouse-down grab: line, handles and the label box.
const isOverAnnotation = (element: HTMLDivElement, canvasPoint) => {
  try {
    return !!utilities.getAnnotationNearPoint(element, canvasPoint, 6);
  } catch {
    return false; // viewport being torn down
  }
};

function track(element: HTMLDivElement) {
  let saved: string | null = null;
  element.addEventListener(Enums.Events.MOUSE_MOVE, (evt: any) => {
    const { viewportId, renderingEngineId, currentPoints } = evt.detail;
    const group = ToolGroupManager.getToolGroupForViewport(viewportId, renderingEngineId);
    const active = group?.getActivePrimaryMouseButtonTool();
    const instance = active && (group.getToolInstance(active) as any);
    const next = nextCursor({
      current: element.style.cursor,
      saved,
      overAnnotation: isOverAnnotation(element, currentPoints.canvas),
      toolTakesClick: CLICK_TAKERS.some(Tool => instance instanceof Tool),
    });
    saved = next.saved;
    if (element.style.cursor !== next.cursor) {
      element.style.cursor = next.cursor;
    }
  });
}

/**
 * Fork: RadiAnt-style cue. Over a measurement's line, handle or label the cursor turns into
 * "move", so a left click grabs it instead of browsing slices (left = Browse).
 */
export default function registerAnnotationHoverCursor() {
  eventTarget.addEventListener(csEnums.Events.ELEMENT_ENABLED, (evt: any) =>
    track(evt.detail.element)
  );
}
