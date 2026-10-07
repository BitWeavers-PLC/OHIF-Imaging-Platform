import React from 'react';
import { Icons } from '@ohif/ui-next';
import {
  ArrowDownWideNarrow,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  ArrowUpNarrowWide,
  Axis3d,
  Blend,
  Box,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleX,
  Columns2,
  Compass,
  Copy,
  Crosshair,
  Download,
  Droplet,
  Ellipsis,
  ExternalLink,
  Eye,
  EyeOff,
  FileOutput,
  Film,
  FlipHorizontal2,
  FlipVertical2,
  Focus,
  Grid2x2,
  Images,
  Info,
  Layers,
  Layers2,
  LayoutGrid,
  LayoutPanelLeft,
  Link2,
  List,
  LocateFixed,
  Lock,
  Move,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  Pencil,
  Plus,
  Power,
  Redo2,
  RefreshCcw,
  Rotate3d,
  RotateCcw,
  RotateCw,
  Ruler,
  Search,
  Settings,
  Shapes,
  SlidersHorizontal,
  SlidersVertical,
  Split,
  Square,
  SquareStack,
  Tags,
  Trash2,
  TriangleAlert,
  Undo2,
  User,
  Users,
  X,
  ZoomIn,
  EllipsisVertical,
  Minus,
  Play,
  Pause,
  SquareMinus,
  Activity,
} from 'lucide-react';

/**
 * Fork: conventional line icons (MedDream / Syngo style) replacing OHIF's rounded set.
 * Icons are looked up by name at render time, so Icons.addIcon swaps them everywhere.
 * Generic tools use lucide; radiology-specific glyphs are drawn below in the same style.
 */

// Shared frame for custom glyphs: 24 viewBox, 1.5 stroke, currentColor (follows active/hover color).
const Glyph = (children: React.ReactNode) => (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
);

// Our signature: small square edit handles at the points you drag, as drawn on the image.
// OHIF draws tools as objects (ruler, crossed rulers, shape + "plus"); these draw the measurement.
const handle = (x: number, y: number) => (
  <rect
    key={`h${x}-${y}`}
    x={x - 1.25}
    y={y - 1.25}
    width="2.5"
    height="2.5"
    fill="currentColor"
    stroke="none"
  />
);
const Length = Glyph(
  <>
    <path d="M5.5 18.5 L18.5 5.5" />
    {handle(5.5, 18.5)}
    {handle(18.5, 5.5)}
  </>
);
const Angle = Glyph(
  <>
    <path d="M5 19 L19 19 M5 19 L15 6" />
    <path d="M10.5 19 A5.5 5.5 0 0 0 8.4 14.6" />
    {handle(5, 19)}
    {handle(19, 19)}
    {handle(15, 6)}
  </>
);
const CobbAngle = Glyph(
  <>
    <path d="M3 6 L13 9 M11 18 L21 14" />
    <path
      d="M8 7.5 L16 16"
      strokeDasharray="2 2"
    />
    {handle(3, 6)}
    {handle(21, 14)}
  </>
);
const Bidirectional = Glyph(
  <>
    <path d="M4 17 L20 7" />
    <path d="M9.9 8.6 L14.1 15.4" />
    {handle(4, 17)}
    {handle(20, 7)}
    {handle(9.9, 8.6)}
    {handle(14.1, 15.4)}
  </>
);
const Ellipse = Glyph(
  <>
    <ellipse
      cx="12"
      cy="12"
      rx="8"
      ry="5.5"
    />
    {handle(4, 12)}
    {handle(20, 12)}
    {handle(12, 6.5)}
    {handle(12, 17.5)}
  </>
);
const RectangleRoi = Glyph(
  <>
    <rect
      x="4.5"
      y="6.5"
      width="15"
      height="11"
    />
    {handle(4.5, 6.5)}
    {handle(19.5, 6.5)}
    {handle(4.5, 17.5)}
    {handle(19.5, 17.5)}
  </>
);
const CircleRoi = Glyph(
  <>
    <circle
      cx="12"
      cy="12"
      r="7.5"
    />
    <path
      d="M12 12 H19.5"
      strokeDasharray="1.5 1.5"
    />
    <path d="M11 12 h2 M12 11 v2" />
    {handle(19.5, 12)}
  </>
);
// Pixel probe: one point with its value tag.
const Probe = Glyph(
  <>
    <path d="M6 18 L11 13" />
    <rect
      x="11"
      y="5"
      width="9"
      height="7"
      rx="1"
    />
    <path d="M13.5 8.5 h4" />
    {handle(6, 18)}
  </>
);
// Arrow annotation: a label box pointing at a spot.
const Annotate = Glyph(
  <>
    <rect
      x="11"
      y="3.5"
      width="10"
      height="6.5"
      rx="1"
    />
    <path d="M13.5 6.75 h5" />
    <path d="M11 10 L4.5 18.5 M4.5 18.5 l0.6 -4.2 M4.5 18.5 l4 -1.3" />
  </>
);
// Hand-drawn outline: irregular, no handles.
const Freehand = Glyph(
  <path d="M5 14 C3 8 9 3 14 5 C19 7 22 12 18 16 C15 19 11 17 9 19 C7 21 6 17 5 14 Z" />
);
// Spline: smooth closed outline through square control points.
const Spline = Glyph(
  <>
    <path d="M5 13 C4.5 7.5 9.5 4.5 14 5.5 C19 6.5 21 12 18 16 C15 19.5 6 19 5 13 Z" />
    {handle(5, 13)}
    {handle(14, 5.5)}
    {handle(18, 16)}
  </>
);
// Livewire: an outline that snaps to the edge (dashed) between two placed points.
const Livewire = Glyph(
  <>
    <path
      d="M4 19 C7 12 13 15 20 5"
      strokeDasharray="1.5 2"
    />
    <path d="M4 17 L6.5 13.5 L9.5 14 L12 12.5 L14.5 12 L17 8.5 L19 5.5" />
    {handle(4, 17)}
    {handle(19, 5.5)}
  </>
);
const Calibration = Glyph(
  <>
    <path d="M3 16 L21 16 M3 13 L3 19 M21 13 L21 19" />
    <path d="M7 16 v-2 M11 16 v-3 M15 16 v-2" />
    <path d="M9 8 h6 M12 5 v6" />
  </>
);
const WindowRegion = Glyph(
  <>
    <rect
      x="4"
      y="4"
      width="16"
      height="16"
      strokeDasharray="3 2"
    />
    <path
      d="M12 8 a4 4 0 1 0 0 8 Z"
      fill="currentColor"
    />
    <circle
      cx="12"
      cy="12"
      r="4"
    />
  </>
);
// Half-filled circle: the conventional window/level symbol.
const WindowLevel = Glyph(
  <>
    <circle
      cx="12"
      cy="12"
      r="8.5"
    />
    <path
      d="M12 3.5 a8.5 8.5 0 0 1 0 17 Z"
      fill="currentColor"
    />
  </>
);
const Invert = Glyph(
  <>
    <rect
      x="4"
      y="4"
      width="16"
      height="16"
    />
    <path
      d="M4 20 L20 4 L20 20 Z"
      fill="currentColor"
    />
  </>
);
const MPR = Glyph(
  <>
    <rect
      x="3"
      y="4"
      width="18"
      height="16"
    />
    <path d="M9 4 v16 M15 4 v16" />
  </>
);
const MIP = Glyph(
  <>
    <rect
      x="3"
      y="4"
      width="18"
      height="16"
    />
    <path d="M3 12 h18 M12 4 v16" />
    <path d="M14.5 9.5 L18.5 6.5 M14.5 6.5 L18.5 9.5" />
  </>
);
const SegmentLabel = Glyph(
  <>
    <path d="M4 5 h9 l5 7 -5 7 H4 Z" />
    <circle
      cx="8"
      cy="12"
      r="1.3"
    />
  </>
);

// Segmentation: painted area is a translucent fill; the tool is drawn on top of it.
const area = (d: string) => (
  <path
    d={d}
    fill="currentColor"
    fillOpacity={0.3}
    stroke="none"
  />
);
const SWATH = 'M3 20 C5 15 8 14 10 12.5 L11.6 14.4 C9.6 16 7.5 17.5 6 21 Z';
const Brush = Glyph(
  <>
    {area(SWATH)}
    <circle
      cx="15"
      cy="9"
      r="5.5"
    />
    <path d="M15 6.8 v4.4 M12.8 9 h4.4" />
  </>
);
const Eraser = Glyph(
  <>
    {area(SWATH)}
    <circle
      cx="15"
      cy="9"
      r="5.5"
    />
    <path d="M12.8 9 h4.4" />
  </>
);
// Threshold: HU histogram with the cut-off line.
const ThresholdTool = Glyph(
  <>
    <path d="M4 20 h16" />
    <path d="M6 20 v-5 M9 20 v-9 M12 20 v-12 M15 20 v-7 M18 20 v-3" />
    <path
      d="M3 10 h18"
      strokeDasharray="2 1.5"
    />
  </>
);
// Fill a drawn shape (sphere / rectangle scissors).
const ShapeFill = Glyph(
  <>
    <rect
      x="4"
      y="5"
      width="16"
      height="14"
      strokeDasharray="2 1.5"
    />
    {area('M12 7.5 a4.5 4.5 0 1 0 0.01 0 Z')}
    <circle
      cx="12"
      cy="12"
      r="4.5"
    />
  </>
);
// One click: a seed point growing into a region.
const ClickSegment = Glyph(
  <>
    {area('M12 7 a5 5 0 1 0 0.01 0 Z')}
    <circle
      cx="12"
      cy="12"
      r="8.5"
      strokeDasharray="2 2"
    />
    {handle(12, 12)}
  </>
);
const EditWithContour = Glyph(
  <>
    {area('M4 15 C4 9 9 5 14 6 C18 7 20 11 19 15 C18 19 6 20 4 15 Z')}
    <path d="M3 12 C8 8 13 15 21 10" />
    {handle(21, 10)}
  </>
);
// Sculptor: a round tool pushing a dent into the outline.
const Sculptor = Glyph(
  <>
    <path d="M3 17 C7 17 8 13 12 13 C16 13 17 17 21 17" />
    <circle
      cx="12"
      cy="8"
      r="3.5"
    />
  </>
);
// Interpolate: slices drawn at top and bottom, the ones between filled in (dashed).
const Interpolate = Glyph(
  <>
    <path d="M4 4.5 h16 M4 19.5 h16" />
    <path
      d="M6 9.5 h12 M6 14.5 h12"
      strokeDasharray="1.5 1.5"
    />
    {handle(4, 4.5)}
    {handle(20, 4.5)}
    {handle(4, 19.5)}
    {handle(20, 19.5)}
  </>
);
const TwoCircles = (fill: React.ReactNode, dashRight = false) =>
  Glyph(
    <>
      {fill}
      <circle
        cx="9"
        cy="12"
        r="5.5"
      />
      <circle
        cx="15"
        cy="12"
        r="5.5"
        strokeDasharray={dashRight ? '1.5 1.5' : undefined}
      />
    </>
  );
const LENS = 'M12 7.4 A5.5 5.5 0 0 1 12 16.6 A5.5 5.5 0 0 1 12 7.4 Z';
const CombineMerge = TwoCircles(area('M12 7.4 A5.5 5.5 0 1 0 12 16.6 A5.5 5.5 0 1 0 12 7.4 Z'));
const CombineIntersect = TwoCircles(area(LENS));
const CombineSubtract = TwoCircles(
  area('M12 7.4 A5.5 5.5 0 1 0 12 16.6 A5.5 5.5 0 0 1 12 7.4 Z'),
  true
);
// Simplify: a dense jagged outline becomes a few straight edges.
const Simplify = Glyph(
  <>
    <path
      d="M3 17 l2 -3 l1.5 1 l2 -4 l1.5 1 l2 -4 l1.5 1.5 l2 -3 l1.5 1 l2 -2"
      strokeDasharray="1.2 1.2"
    />
    <path d="M3 19 L10 13 L21 6" />
    {handle(3, 19)}
    {handle(10, 13)}
    {handle(21, 6)}
  </>
);
const Smooth = Glyph(
  <>
    <path
      d="M3 15 l2 -3 l2 3 l2 -4 l2 4 l2 -5 l2 5 l2 -4 l2 3"
      strokeDasharray="1.2 1.2"
    />
    <path d="M3 18 C8 9 16 9 21 18" />
  </>
);
// Auto-align: two series side by side, levelled on the same anatomy.
const AutoAlign = Glyph(
  <>
    <rect
      x="3"
      y="3"
      width="7"
      height="14"
    />
    <rect
      x="14"
      y="7"
      width="7"
      height="14"
    />
    <path
      d="M3 12 H21"
      strokeDasharray="2 1.5"
    />
  </>
);

// Viewport layout thumbnails: panes as [x, y, w, h] on the 24 grid.
const Panes = (panes: number[][]) =>
  Glyph(
    <>
      {panes.map(([x, y, w, h]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={w}
          height={h}
          rx={0.5}
        />
      ))}
    </>
  );
// Plane letter in a frame (Axial, Coronal, Sagittal, Reformat).
const PlaneLetter = (letter: string) =>
  Glyph(
    <>
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
      />
      <text
        x="12"
        y="16.2"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="currentColor"
        stroke="none"
      >
        {letter}
      </text>
    </>
  );
const VoiSync = Glyph(
  <>
    <circle
      cx="7"
      cy="12"
      r="4"
    />
    <path
      d="M7 8 a4 4 0 0 1 0 8 Z"
      fill="currentColor"
    />
    <circle
      cx="17"
      cy="12"
      r="4"
    />
    <path
      d="M17 8 a4 4 0 0 1 0 8 Z"
      fill="currentColor"
    />
    <path d="M11 12 h2" />
  </>
);
const SegFillOutline = Glyph(
  <rect
    x="4"
    y="4"
    width="16"
    height="16"
    fill="currentColor"
    fillOpacity={0.35}
  />
);
const SegFillOnly = Glyph(
  <rect
    x="4"
    y="4"
    width="16"
    height="16"
    fill="currentColor"
    fillOpacity={0.35}
    stroke="none"
  />
);

// Slab projection: a stack of thin planes.
const Slab = Glyph(
  <>
    <path d="M4 8 L12 4 L20 8 L12 12 Z" />
    <path d="M4 12 L12 16 L20 12" />
    <path d="M4 16 L12 20 L20 16" />
  </>
);

const line = Component => (props: React.SVGProps<SVGSVGElement>) => (
  <Component
    strokeWidth={1.5}
    {...props}
  />
);

/**
 * Chrome icons (menus, panels, status) keep the replaced icon's own width/height, so
 * nothing around them reflows; className/size props from callers still win.
 */
const sized = (name: string, Component, extra: Record<string, unknown> = {}) => {
  let size = {};
  try {
    const { width, height } = (Icons as any)[name]?.({})?.props ?? {};
    size = width ? { width, height: height ?? width } : {};
  } catch {
    // Original needs React context (hooks); fall back to the 24px default.
  }
  const SizedIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <Component
      strokeWidth={1.5}
      {...size}
      {...extra}
      {...props}
    />
  );
  return SizedIcon;
};
const tone = (token: string) => ({ className: `text-[hsl(var(--${token}))]` });

const chromeIcons: Record<string, [React.ComponentType<any>, Record<string, unknown>?]> = {
  // Actions
  Add: [Plus],
  Plus: [Plus],
  Delete: [Trash2],
  Rename: [Pencil],
  Copy: [Copy],
  Download: [Download],
  Export: [FileOutput],
  'action-new-dialog': [ExternalLink],
  ColorChange: [Palette],
  Hide: [EyeOff],
  Show: [Eye],
  Lock: [Lock],
  JumpToSlice: [LocateFixed],
  Search: [Search],
  find: [Search],
  ToolMagnify: [Search],
  More: [Ellipsis],
  Actions: [EllipsisVertical],
  Minus: [Minus],
  'icon-play': [Play],
  'icon-pause': [Pause],
  'icon-color-lut': [Palette],
  IconColorLUT: [Palette],
  'launch-info': [Info],
  Settings: [Settings],
  'power-off': [Power],
  // Navigation / disclosure
  ArrowLeft: [ArrowLeft],
  ArrowRight: [ArrowRight],
  LaunchArrow: [ArrowRight],
  ArrowLeftBold: [ChevronLeft],
  ArrowRightBold: [ChevronRight],
  ChevronDown: [ChevronDown],
  ChevronOpen: [ChevronDown],
  DefaultAccordion: [ChevronDown],
  'chevron-down': [ChevronDown],
  ChevronRight: [ChevronRight],
  'chevron-next': [ChevronRight],
  'content-next': [ChevronRight],
  'chevron-prev': [ChevronLeft],
  'content-prev': [ChevronLeft],
  NavigationPanelReveal: [PanelLeftOpen],
  SidePanelCloseLeft: [PanelLeftClose],
  SidePanelCloseRight: [PanelRightClose],
  Cancel: [X],
  Close: [X],
  close: [X],
  Clear: [X],
  Checked: [Check],
  FeedbackComplete: [Check],
  SortingAscending: [ArrowUpNarrowWide],
  SortingDescending: [ArrowDownWideNarrow],
  // Info / people / data
  Info: [Info],
  info: [Info],
  InfoLink: [Info],
  InfoSeries: [Info],
  LaunchInfo: [Info],
  'notifications-info': [Info],
  Patient: [User],
  MultiplePatients: [Users],
  DicomTagBrowser: [Tags],
  Series: [Layers],
  GroupLayers: [Layers],
  'icon-stack': [SquareStack],
  'icon-transferring': [ArrowUpDown],
  ListView: [List],
  ThumbnailView: [LayoutGrid],
  // Viewport menus
  Navigation: [Compass],
  ViewportViews: [LayoutPanelLeft],
  OrientationSwitch: [Axis3d],
  Opacity: [Blend],
  Threshold: [SlidersHorizontal],
  WindowLevelAdvanced: [SlidersVertical],
  VolumeRendering: [Box],
  LayerBackground: [Layers],
  LayerForeground: [Layers2],
  LayerSegmentation: [Shapes],
  // Status (colour carries meaning; theme tokens)
  StatusSuccess: [CircleCheck, tone('success-text')],
  StatusTracking: [CircleCheck, { className: 'text-primary' }],
  TrackingStatus: [CircleCheck, { className: 'text-primary' }],
  'status-tracked': [CircleCheck, { className: 'text-primary' }],
  Status: [CircleCheck],
  StatusUntracked: [Circle],
  'status-untracked': [Circle],
  'status-locked': [Lock],
  StatusError: [CircleX, tone('error-text')],
  'status-error': [CircleX, tone('error-text')],
  StatusWarning: [TriangleAlert, tone('warning-text')],
  'status-alert': [TriangleAlert, tone('warning-text')],
  'icon-status-alert': [TriangleAlert, tone('warning-text')],
  'notificationwarning-diamond': [TriangleAlert, tone('warning-text')],
  'icon-alert-outline': [CircleAlert, tone('warning-text')],
  'icon-alert-small': [CircleAlert, tone('warning-text')],
};

export const iconOverrides: Record<string, React.ComponentType<any>> = {
  // Navigation / display
  'tool-zoom': line(ZoomIn),
  'tool-move': line(Move),
  'tool-window-level': WindowLevel,
  'viewport-window-level': WindowLevel,
  'filter-sharpen': line(Focus),
  'filter-smooth': line(Droplet),
  'tool-stack-scroll': line(Layers),
  'tool-reset': line(RefreshCcw),
  'tool-rotate-right': line(RotateCw),
  'tool-rotate-left': line(RotateCcw),
  'tool-flip-horizontal': line(FlipHorizontal2),
  'tool-flip-vertical': line(FlipVertical2),
  'tool-voi-sync': VoiSync,
  WindowLevel,
  ViewportWindowLevel: WindowLevel,
  'tool-invert': Invert,
  'tool-subtract': line(SquareMinus),
  'tool-crosshair': line(Crosshair),
  'tool-3d-rotate': line(Rotate3d),
  'tool-cine': line(Film),
  'tool-capture': line(Camera),
  link: line(Link2),
  'tool-referenceLines': line(Split),
  'tool-magnify': line(Search),
  'icon-tool-loupe': line(Search),
  'icon-tool-window-region': WindowRegion,
  'toggle-dicom-overlay': line(Info),
  'dicom-tag-browser': line(Tags),
  // Measurements
  'tool-length': Length,
  'tool-angle': Angle,
  'icon-tool-cobb-angle': CobbAngle,
  'tool-bidirectional': Bidirectional,
  ToolBidirectionalSegment: Bidirectional,
  'icon-tool-ultrasound-bidirectional': Bidirectional,
  'tool-ellipse': Ellipse,
  'tool-rectangle': RectangleRoi,
  'tool-circle': CircleRoi,
  'tool-probe': Probe,
  'icon-tool-probe': Probe,
  'tool-annotate': Annotate,
  'icon-tool-freehand-roi': Freehand,
  'icon-tool-spline-roi': Spline,
  'icon-tool-livewire': Livewire,
  'tool-calibration': Calibration,
  'tool-segment-label': SegmentLabel,
  // Segmentation (were OHIF's own artwork)
  'icon-tool-brush': Brush,
  'icon-tool-eraser': Eraser,
  'icon-tool-threshold': ThresholdTool,
  'icon-tool-shape': ShapeFill,
  'icon-tool-click-segment': ClickSegment,
  'icon-tool-sculptor': Sculptor,
  'tool-labelmap-edit-with-contour': EditWithContour,
  'actions-interpolate': Interpolate,
  'actions-bidirectional': Bidirectional,
  'actions-combine': CombineMerge,
  'actions-combine-merge': CombineMerge,
  'actions-combine-intersect': CombineIntersect,
  'actions-combine-subtract': CombineSubtract,
  'actions-simplify': Simplify,
  'actions-smooth': Smooth,
  'tool-stack-image-sync': AutoAlign,
  // MPR / 3D / layout
  'icon-mpr': MPR,
  'tool-slab': Slab,
  'layout-advanced-mpr': MIP,
  'layout-advanced-3d-only': line(Box),
  'tool-layout': line(LayoutGrid),
  'layout-common-1x1': line(Square),
  'layout-common-1x2': line(Columns2),
  'layout-common-2x2': line(Grid2x2),
  'layout-common-2x3': line(LayoutGrid),
  'layout-single': Panes([[3, 4, 18, 16]]),
  'layout-side-by-side': Panes([
    [3, 4, 8.5, 16],
    [12.5, 4, 8.5, 16],
  ]),
  'layout-three-col': Panes([
    [3, 4, 5.3, 16],
    [9.35, 4, 5.3, 16],
    [15.7, 4, 5.3, 16],
  ]),
  'layout-three-row': Panes([
    [3, 3, 18, 5.3],
    [3, 9.35, 18, 5.3],
    [3, 15.7, 18, 5.3],
  ]),
  'layout-four-up': Panes([
    [3, 4, 8.5, 7.5],
    [12.5, 4, 8.5, 7.5],
    [3, 12.5, 8.5, 7.5],
    [12.5, 12.5, 8.5, 7.5],
  ]),
  'layout-advanced-3d-four-up': Panes([
    [3, 4, 8.5, 7.5],
    [12.5, 4, 8.5, 7.5],
    [3, 12.5, 8.5, 7.5],
    [12.5, 12.5, 8.5, 7.5],
  ]),
  'layout-advanced-axial-primary': Panes([
    [3, 4, 11, 16],
    [15, 4, 6, 7.5],
    [15, 12.5, 6, 7.5],
  ]),
  'layout-advanced-3d-primary': Panes([
    [3, 4, 11, 16],
    [15, 4, 6, 4.7],
    [15, 9.65, 6, 4.7],
    [15, 15.3, 6, 4.7],
  ]),
  'layout-advanced-3d-main': Panes([
    [3, 4, 18, 10],
    [3, 15, 5.3, 5],
    [9.35, 15, 5.3, 5],
    [15.7, 15, 5.3, 5],
  ]),
  OrientationSwitchA: PlaneLetter('A'),
  OrientationSwitchC: PlaneLetter('C'),
  OrientationSwitchS: PlaneLetter('S'),
  OrientationSwitchR: PlaneLetter('R'),
  FillAndOutline: SegFillOutline,
  FillOnly: SegFillOnly,
  OutlineOnly: Panes([[4, 4, 16, 16]]),
  // Side panel tabs
  'tab-studies': line(Images),
  'tab-segmentation': line(Layers),
  'tab-linear': line(Ruler),
  'tab-contours': line(Shapes),
  'tab-time-intensity': line(Activity),
  // Chrome
  'tool-more-menu': line(Ellipsis),
  settings: line(Settings),
  GearSettings: line(Settings),
  Undo: line(Undo2),
  Redo: line(Redo2),
  ...Object.fromEntries(
    Object.entries(chromeIcons).map(([name, [Component, extra]]) => [
      name,
      sized(name, Component, extra),
    ])
  ),
};

export default function registerIcons() {
  // Same as Icons.addIcon, without its per-icon "Replacing icon" console warning.
  Object.assign(Icons, iconOverrides);
}
