import i18n from '@ohif/i18n';

// Reader-facing names for unlabelled measurements (OHIF showed "(empty)").
const NAMES: Record<string, string> = {
  Length: 'Length',
  Bidirectional: 'Bidirectional',
  SegmentBidirectional: 'Bidirectional',
  EllipticalROI: 'Ellipse',
  RectangleROI: 'Rectangle',
  CircleROI: 'Circle',
  PlanarFreehandROI: 'Freehand',
  SplineROI: 'Spline',
  LivewireContour: 'Edge-snap ROI',
  ArrowAnnotate: 'Arrow',
  Angle: 'Angle',
  CobbAngle: 'Cobb angle',
  Probe: 'Pixel value',
  CalibrationLine: 'Calibration',
  Polyline: 'Polyline',
  HeightDifference: 'Height difference',
  CTR: 'CTR',
  Label: 'Text',
  SpineLabel: 'Spine label',
  TTTG: 'TT-TG',
};

/** The measurement's tool as a reader would name it, e.g. "Ellipse" for EllipticalROI. */
export default function measurementToolLabel(toolName?: string): string {
  return i18n.t(`MeasurementTable:${NAMES[toolName] ?? 'Measurement'}`);
}
