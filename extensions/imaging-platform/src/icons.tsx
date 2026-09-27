import React from 'react';
import { Icons } from '@ohif/ui-next';
import {
  Box,
  Camera,
  Circle,
  CircleDot,
  Columns2,
  Crosshair,
  Droplet,
  Ellipsis,
  Film,
  FlipHorizontal2,
  Focus,
  Grid2x2,
  Images,
  Info,
  Layers,
  LayoutGrid,
  Link2,
  Move,
  MoveUpRight,
  Redo2,
  Rotate3d,
  RotateCcw,
  RotateCw,
  Ruler,
  Search,
  Shapes,
  Settings,
  Split,
  Square,
  Tags,
  Undo2,
  ZoomIn,
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

const line = Component => (props: React.SVGProps<SVGSVGElement>) => (
  <Component
    strokeWidth={1.5}
    {...props}
  />
);

export const iconOverrides: Record<string, React.ComponentType<any>> = {
  // Navigation / display
  'tool-zoom': line(ZoomIn),
  'tool-move': line(Move),
  'tool-window-level': WindowLevel,
  'viewport-window-level': WindowLevel,
  'filter-sharpen': line(Focus),
  'filter-smooth': line(Droplet),
  'tool-stack-scroll': line(Layers),
  'tool-reset': line(RotateCcw),
  'tool-rotate-right': line(RotateCw),
  'tool-flip-horizontal': line(FlipHorizontal2),
  'tool-invert': Invert,
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
  'layout-advanced-mpr': MIP,
  'layout-advanced-3d-only': line(Box),
  'tool-layout': line(LayoutGrid),
  'layout-common-1x1': line(Square),
  'layout-common-1x2': line(Columns2),
  'layout-common-2x2': line(Grid2x2),
  'layout-common-2x3': line(LayoutGrid),
  // Side panel tabs
  'tab-studies': line(Images),
  'tab-segmentation': line(Layers),
  'tab-linear': line(Ruler),
  'tab-contours': line(Shapes),
  // Chrome
  'tool-more-menu': line(Ellipsis),
  settings: line(Settings),
  GearSettings: line(Settings),
  Undo: line(Undo2),
  Redo: line(Redo2),
};

export default function registerIcons() {
  // Same as Icons.addIcon, without its per-icon "Replacing icon" console warning.
  Object.assign(Icons, iconOverrides);
}
