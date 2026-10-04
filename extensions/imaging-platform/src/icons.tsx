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
  CircleDot,
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
  MoveUpRight,
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

const Angle = Glyph(
  <>
    <path d="M4 20 L20 20 M4 20 L15 5" />
    <path d="M10 20 A6 6 0 0 0 8 15.5" />
  </>
);
const CobbAngle = Glyph(
  <>
    <path d="M3 6 L13 9 M11 18 L21 14" />
    <path
      d="M8 7.5 L16 16"
      strokeDasharray="2 2"
    />
  </>
);
const Bidirectional = Glyph(
  <>
    <path d="M4 17 L20 7" />
    <path d="M9 6 L15 18" />
    <path d="M4 17 l1 -3 M20 7 l-3 -0.5 M9 6 l2.5 1.5 M15 18 l-2.5 -1.5" />
  </>
);
const Ellipse = Glyph(
  <ellipse
    cx="12"
    cy="12"
    rx="9"
    ry="6"
  />
);
const Freehand = Glyph(
  <path d="M5 14 C3 8 9 3 14 5 C19 7 22 12 18 16 C15 19 11 17 9 19 C7 21 6 17 5 14 Z" />
);
const Spline = Glyph(
  <>
    <path d="M4 16 C6 6 12 4 14 10 S19 18 20 8" />
    <circle
      cx="4"
      cy="16"
      r="1.3"
    />
    <circle
      cx="14"
      cy="10"
      r="1.3"
    />
    <circle
      cx="20"
      cy="8"
      r="1.3"
    />
  </>
);
const Livewire = Glyph(
  <>
    <path d="M4 18 L7 12 L11 13 L13 7 L17 9 L20 5" />
    <circle
      cx="4"
      cy="18"
      r="1.3"
    />
    <circle
      cx="20"
      cy="5"
      r="1.3"
    />
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
  'tool-length': line(Ruler),
  'tool-angle': Angle,
  'icon-tool-cobb-angle': CobbAngle,
  'tool-bidirectional': Bidirectional,
  ToolBidirectionalSegment: Bidirectional,
  'icon-tool-ultrasound-bidirectional': Bidirectional,
  'tool-ellipse': Ellipse,
  'tool-rectangle': line(Square),
  'tool-circle': line(Circle),
  'tool-probe': line(CircleDot),
  'icon-tool-probe': line(CircleDot),
  'tool-annotate': line(MoveUpRight),
  'icon-tool-freehand-roi': Freehand,
  'icon-tool-spline-roi': Spline,
  'icon-tool-livewire': Livewire,
  'tool-calibration': Calibration,
  'tool-segment-label': SegmentLabel,
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
