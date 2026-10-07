export default {
  'viewportOverlay.topLeft': [
    {
      id: 'StudyDate',
      inheritsFrom: 'ohif.overlayItem',
      label: '',
      title: 'Study date',
      condition: ({ referenceInstance }) => referenceInstance?.StudyDate,
      contentF: ({ referenceInstance, formatters: { formatDate } }) =>
        formatDate(referenceInstance.StudyDate),
    },
    {
      id: 'SeriesDescription',
      inheritsFrom: 'ohif.overlayItem',
      label: '',
      title: 'Series description',
      condition: ({ referenceInstance }) => {
        return referenceInstance && referenceInstance.SeriesDescription;
      },
      contentF: ({ referenceInstance }) => referenceInstance.SeriesDescription,
    },
  ],
  // Fork: patient identity and slice geometry in the corners, as radiologists expect.
  'viewportOverlay.topRight': [
    {
      id: 'PatientName',
      inheritsFrom: 'ohif.overlayItem',
      label: '',
      title: 'Patient name',
      condition: ({ referenceInstance }) => referenceInstance?.PatientName,
      contentF: ({ referenceInstance, formatters: { formatPN } }) =>
        formatPN(referenceInstance.PatientName),
    },
    {
      id: 'PatientAgeSex',
      inheritsFrom: 'ohif.overlayItem',
      label: '',
      title: 'Patient age / sex',
      contentF: ({ referenceInstance }) =>
        [referenceInstance?.PatientAge, referenceInstance?.PatientSex].filter(Boolean).join(' '),
    },
  ],
  'viewportOverlay.bottomLeft': [
    // Fork: live value under the mouse (HU for CT), no Probe needed.
    {
      id: 'PixelValue',
      inheritsFrom: 'ohif.overlayItem.pixelValue',
    },
    {
      id: 'WindowLevel',
      inheritsFrom: 'ohif.overlayItem.windowLevel',
    },
    {
      id: 'ZoomLevel',
      inheritsFrom: 'ohif.overlayItem.zoomLevel',
      condition: props => {
        const activeToolName = props.toolGroupService.getActiveToolForViewport(props.viewportId);
        return activeToolName === 'Zoom';
      },
    },
  ],
  'viewportOverlay.bottomRight': [
    {
      id: 'SliceThickness',
      inheritsFrom: 'ohif.overlayItem',
      label: 'Thick:',
      title: 'Slice thickness (mm)',
      contentF: ({ instance, referenceInstance }) => {
        const thickness = Number((instance ?? referenceInstance)?.SliceThickness);
        return thickness ? `${+thickness.toFixed(2)} mm` : null;
      },
    },
    {
      id: 'SliceLocation',
      inheritsFrom: 'ohif.overlayItem',
      label: 'Loc:',
      title: 'Slice location (mm)',
      // Per-image value, only meaningful on stack viewports (not reformatted MPR).
      contentF: ({ instance, viewportData }) => {
        const location = instance?.SliceLocation;
        return viewportData?.viewportType === 'stack' && location != null && location !== ''
          ? `${Number(location).toFixed(1)} mm`
          : null;
      },
    },
    {
      id: 'InstanceNumber',
      inheritsFrom: 'ohif.overlayItem.instanceNumber',
    },
  ],
};
