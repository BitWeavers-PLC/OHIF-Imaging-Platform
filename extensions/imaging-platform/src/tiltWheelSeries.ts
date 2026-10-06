/**
 * RadiAnt horizontal wheel: tilt the wheel (or swipe sideways on a trackpad) over a viewport
 * to show the previous/next series in it.
 */

const STEP_PX = 50; // sideways scroll needed for one series
const QUIET_MS = 300; // a new gesture starts after this much wheel silence
const LINE_PX = 40; // deltaMode 1 (lines) to pixels

export type TiltState = { acc: number; lastEvent: number; stepped: boolean };
export const initialTiltState: TiltState = { acc: 0, lastEvent: -Infinity, stepped: false };

/**
 * One series per gesture: a trackpad swipe sends dozens of events (plus momentum), so after a
 * step the rest of the gesture is ignored until the wheel goes quiet.
 */
export function tiltStep(
  state: TiltState,
  { deltaX, deltaMode, now }: { deltaX: number; deltaMode: number; now: number }
): { state: TiltState; direction: -1 | 0 | 1 } {
  const next =
    now - state.lastEvent > QUIET_MS
      ? { acc: 0, lastEvent: now, stepped: false }
      : { ...state, lastEvent: now };
  if (next.stepped) {
    return { state: next, direction: 0 };
  }
  next.acc += deltaX * (deltaMode === 1 ? LINE_PX : 1);
  if (Math.abs(next.acc) < STEP_PX) {
    return { state: next, direction: 0 };
  }
  return { state: { ...next, stepped: true }, direction: next.acc > 0 ? 1 : -1 };
}

/** Listens before Cornerstone (capture), so sideways scrolling does not also browse slices. */
export default function registerTiltWheelSeries({ servicesManager, commandsManager }) {
  let state = initialTiltState;
  document.addEventListener(
    'wheel',
    event => {
      const viewportElement = (event.target as Element)?.closest?.('[data-viewportid]');
      if (!viewportElement || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const result = tiltStep(state, {
        deltaX: event.deltaX,
        deltaMode: event.deltaMode,
        now: performance.now(),
      });
      state = result.state;
      if (result.direction) {
        const viewportId = viewportElement.getAttribute('data-viewportid');
        servicesManager.services.viewportGridService.setActiveViewportId(viewportId);
        commandsManager.runCommand('updateViewportDisplaySet', { direction: result.direction });
      }
    },
    { capture: true, passive: false }
  );
}
