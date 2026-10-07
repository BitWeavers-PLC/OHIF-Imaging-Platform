/**
 * RadiAnt DICOM Viewer keymap (radiantviewer.com manual, "Keyboard shortcuts"), mapped onto
 * viewer commands. Replaces the default `ohif.hotkeyBindings`; users can still rebind in Preferences.
 *
 * One definition = one key combo (HotkeysManager joins a `keys` array with '+'), and definitions
 * are keyed by commandName + commandOptions, so an alias key needs distinct options (`alias`).
 * Not bindable in a browser tab: Ctrl+1-4 (tab switch), F12 (dev tools).
 */

// Same groups as the toolbar (modes/basic/src/toolbarButtons.ts); the MIP group keeps jump-to-click.
const toolGroupIds = ['default', 'mpr', 'SRToolGroup', 'volume3d'];

const tool = (key: string, toolName: string, label: string) => ({
  commandName: 'setToolActiveToolbar',
  commandOptions: { toolName, toolGroupIds },
  label,
  keys: [key],
  isEditable: true,
});

const preset = (key: string, presetName: string, label: string) => ({
  commandName: 'setWindowLevelPreset',
  commandOptions: { presetName },
  label,
  keys: [key],
  isEditable: true,
});

const cmd = (key: string, commandName: string, label: string, commandOptions = {}) => ({
  commandName,
  commandOptions,
  label,
  keys: [key],
  isEditable: true,
});

const radiantHotkeys = [
  // Navigation
  cmd('up', 'previousImage', 'Previous Image'),
  cmd('down', 'nextImage', 'Next Image'),
  cmd('pageup', 'previousImage', '10 Images Back', { direction: -10 }),
  cmd('pagedown', 'nextImage', '10 Images Forward', { direction: 10 }),
  cmd('left', 'updateViewportDisplaySet', 'Previous Series', { direction: -1 }),
  cmd('right', 'updateViewportDisplaySet', 'Next Series', { direction: 1 }),
  cmd('home', 'showEdgeSeries', 'First Series', { last: false }),
  cmd('end', 'showEdgeSeries', 'Last Series', { last: true }),
  cmd('ctrl+home', 'firstImage', 'First Image'),
  cmd('ctrl+end', 'lastImage', 'Last Image'),
  cmd('tab', 'incrementActiveViewport', 'Next Viewport'),
  cmd('shift+tab', 'decrementActiveViewport', 'Previous Viewport'),
  cmd('ctrl+m', 'toggleOneUp', 'Maximize / Restore Viewport'),
  cmd('f', 'toggleFullscreen', 'Full Screen'),
  cmd('space', 'toggleCinePlay', 'Start / Stop Cine'),
  // Links at the positions shown now: align the anatomy first (or use Auto-align for CT), then F5.
  cmd('f5', 'toggleSynchronizer', 'Toggle Series Synchronization', { type: 'imageSlice' }),
  // Not in RadiAnt: CT-only anatomy match (alignByAnatomy), next to F5.
  cmd('shift+f5', 'alignByAnatomy', 'Auto-align (CT)'),
  // Not in RadiAnt: the opening layout's other arrangements (strip above the views).
  cmd(',', 'previousStage', 'Previous Layout'),
  cmd('.', 'nextStage', 'Next Layout'),

  // Window presets (RadiAnt order; 8-9 are this viewer's extra CT windows)
  cmd('0', 'resetWindowLevel', 'Default Window'),
  cmd('1', 'fullDynamicRange', 'Full Dynamic Range'),
  preset('2', 'ct-abdomen', 'Abdomen Window'),
  preset('3', 'ct-angio', 'Angio Window'),
  preset('4', 'ct-bone', 'Bone Window'),
  preset('5', 'ct-brain', 'Brain Window'),
  preset('6', 'ct-mediastinum', 'Chest Window'),
  preset('7', 'ct-lung', 'Lung Window'),
  preset('8', 'ct-stroke', 'Stroke Window'),
  preset('9', 'ct-subdural', 'Subdural Window'),
  cmd('i', 'invertViewport', 'Invert'),
  cmd('f11', 'invertViewport', 'Invert (F11)', { alias: 'f11' }),

  // Zoom, pan, orientation
  cmd('ctrl+=', 'scaleUpViewport', 'Zoom In'),
  cmd('ctrl+plus', 'scaleUpViewport', 'Zoom In (keypad)', { alias: 'plus' }),
  cmd('ctrl+-', 'scaleDownViewport', 'Zoom Out'),
  cmd('ctrl+0', 'fitViewportToWindow', 'Fit Image'),
  cmd('ctrl+left', 'panActiveViewport', 'Pan Left', { dx: -20 }),
  cmd('ctrl+right', 'panActiveViewport', 'Pan Right', { dx: 20 }),
  cmd('ctrl+up', 'panActiveViewport', 'Pan Up', { dy: -20 }),
  cmd('ctrl+down', 'panActiveViewport', 'Pan Down', { dy: 20 }),
  cmd('ctrl+[', 'rotateViewportCCW', 'Rotate Left'),
  cmd('ctrl+]', 'rotateViewportCW', 'Rotate Right'),
  cmd('ctrl+shift+[', 'flipViewportHorizontal', 'Flip Horizontally'),
  cmd('ctrl+shift+]', 'flipViewportVertical', 'Flip Vertically'),
  cmd('ctrl+shift+\\', 'resetViewport', 'Clear Transformations'),

  // Tools (left mouse button)
  tool('b', 'StackScroll', 'Browse Tool'),
  tool('w', 'WindowLevel', 'Window Tool'),
  tool('m', 'Pan', 'Pan Tool'),
  tool('z', 'Zoom', 'Zoom Tool'),
  tool('l', 'Length', 'Length Tool'),
  tool('e', 'EllipticalROI', 'Ellipse Tool'),
  tool('a', 'Angle', 'Angle Tool'),
  tool('c', 'CobbAngle', 'Cobb Angle Tool'),
  tool('y', 'ArrowAnnotate', 'Arrow Tool'),

  // Views
  cmd('ctrl+alt+1', 'toggleHangingProtocol', 'MPR', { protocolId: 'mpr' }),
  cmd('f3', 'toggleHangingProtocol', '3D Volume Rendering', { protocolId: 'only3D' }),

  // Annotations and editing
  cmd('del', 'deleteActiveAnnotation', 'Delete Annotation'),
  cmd('backspace', 'deleteActiveAnnotation', 'Delete Annotation (Backspace)', {
    alias: 'backspace',
  }),
  { commandName: 'rejectPreview', label: 'Reject Preview', keys: ['esc'] },
  { commandName: 'acceptPreview', label: 'Accept Preview', keys: ['enter'] },
  cmd('ctrl+z', 'undo', 'Undo'),
  cmd('ctrl+y', 'redo', 'Redo'),

  // Segmentation (moved off E/B/A, which RadiAnt uses for tools)
  cmd('n', 'interpolateScrollForMarkerLabelmap', 'Interpolate Scroll'),
  cmd(']', 'increaseBrushSize', 'Increase Brush Size'),
  cmd('[', 'decreaseBrushSize', 'Decrease Brush Size'),
  cmd('shift+e', 'setToolActive', 'Eraser', { toolName: 'CircularEraser' }),
  cmd('shift+b', 'setToolActive', 'Brush', { toolName: 'CircularBrush' }),
  cmd('shift+a', 'addNewSegment', 'Add New Segment'),
];

export default radiantHotkeys;
