/** Fork: sections of the Settings → Keyboard list, by the command a shortcut runs. */
export const HOTKEY_GROUPS = [
  'Navigation',
  'Window & level',
  'View',
  'Tools',
  'Annotations',
  'Segmentation',
  'Other',
] as const;

type Group = (typeof HOTKEY_GROUPS)[number];

const GROUP_OF_COMMAND: Record<string, Group> = {
  previousImage: 'Navigation',
  nextImage: 'Navigation',
  firstImage: 'Navigation',
  lastImage: 'Navigation',
  updateViewportDisplaySet: 'Navigation',
  showEdgeSeries: 'Navigation',
  incrementActiveViewport: 'Navigation',
  decrementActiveViewport: 'Navigation',
  toggleCinePlay: 'Navigation',
  toggleCine: 'Navigation',
  toggleSynchronizer: 'Navigation',
  nextStage: 'Navigation',
  previousStage: 'Navigation',
  setWindowLevelPreset: 'Window & level',
  resetWindowLevel: 'Window & level',
  fullDynamicRange: 'Window & level',
  invertViewport: 'Window & level',
  scaleUpViewport: 'View',
  scaleDownViewport: 'View',
  fitViewportToWindow: 'View',
  panActiveViewport: 'View',
  rotateViewportCW: 'View',
  rotateViewportCCW: 'View',
  flipViewportHorizontal: 'View',
  flipViewportVertical: 'View',
  resetViewport: 'View',
  toggleOneUp: 'View',
  toggleFullscreen: 'View',
  toggleHangingProtocol: 'View',
  setToolActiveToolbar: 'Tools',
  deleteActiveAnnotation: 'Annotations',
  cancelMeasurement: 'Annotations',
  undo: 'Annotations',
  redo: 'Annotations',
  acceptPreview: 'Segmentation',
  rejectPreview: 'Segmentation',
  interpolateScrollForMarkerLabelmap: 'Segmentation',
  increaseBrushSize: 'Segmentation',
  decreaseBrushSize: 'Segmentation',
  addNewSegment: 'Segmentation',
};

type Definition = {
  commandName?: string;
  commandOptions?: { toolName?: string };
  label?: string;
  keys?: string | string[];
};

const groupOf = (definition: Definition): Group =>
  // setToolActive is also used for segmentation brushes (Shift+B/E).
  definition.commandName === 'setToolActive'
    ? 'Segmentation'
    : (GROUP_OF_COMMAND[definition.commandName ?? ''] ?? 'Other');

/**
 * Hotkey definitions ({id: definition}) grouped into ordered sections, filtered by `query`
 * (matches label or keys, case-insensitive). Empty sections are dropped.
 */
export function groupHotkeys(
  definitions: Record<string, Definition>,
  query = ''
): { group: Group; entries: [string, Definition][] }[] {
  const q = query.trim().toLowerCase();
  const matches = ([, d]: [string, Definition]) =>
    !q ||
    (d.label ?? '').toLowerCase().includes(q) ||
    [d.keys].flat().join('+').toLowerCase().includes(q);
  const entries = Object.entries(definitions).filter(matches);
  return HOTKEY_GROUPS.map(group => ({
    group,
    entries: entries.filter(([, d]) => groupOf(d) === group),
  })).filter(section => section.entries.length);
}
