import type { Button } from '@ohif/core/types';

import { EVENTS } from '@cornerstonejs/core';
import { ViewportGridService } from '@ohif/core';
import i18n from 'i18next';

const callbacks = (toolName: string) => [
  {
    commandName: 'setViewportForToolConfiguration',
    commandOptions: {
      toolName,
    },
  },
];

export const setToolActiveToolbar = {
  commandName: 'setToolActiveToolbar',
  commandOptions: {
    toolGroupIds: ['default', 'mpr', 'SRToolGroup', 'volume3d'],
  },
};

/**
 * Fork: primary toolbar, grouped like RadiAnt. Common tools sit directly on the bar;
 * lists only hold presets and rarer tools. Each group is separated by a divider (Toolbar.tsx
 * reads the `group` prop set below); overflow goes to More from the right.
 */
export const primaryToolbarGroups = {
  navigate: ['StackScroll', 'WindowLevelTools', 'Pan', 'Zoom', 'Magnify', 'Reset'],
  measure: [
    'Length',
    'Angle',
    'EllipticalROI',
    'RectangleROI',
    'Bidirectional',
    'ArrowAnnotate',
    'Probe',
    'MeasurementTools',
  ],
  image: ['rotate-left', 'rotate-right', 'flipHorizontal', 'flipVertical', 'invert', 'Subtract'],
  layout: ['Layout', 'MPR', 'MIP', 'VolumeRendering3D', 'Crosshairs', 'SlabTools'],
  sync: ['ImageSliceSync', 'VOISync', 'ReferenceLines'],
  output: ['Cine', 'Capture', 'ImageOverlayViewer', 'TagBrowser'],
  edit: ['Undo', 'Redo', 'MoreTools'],
};

const toolbarButtons: Button[] = [
  // sections
  {
    id: 'MeasurementTools',
    uiType: 'ohif.toolButtonList',
    props: {
      buttonSection: true,
    },
  },
  {
    id: 'WindowLevelTools',
    uiType: 'ohif.toolButtonList',
    props: {
      buttonSection: true,
    },
  },
  {
    id: 'MoreTools',
    uiType: 'ohif.toolButtonList',
    props: {
      buttonSection: true,
    },
  },
  {
    id: 'AdvancedRenderingControls',
    uiType: 'ohif.advancedRenderingControls',
    props: {
      buttonSection: true,
    },
  },
  // tool defs
  {
    id: 'modalityLoadBadge',
    uiType: 'ohif.modalityLoadBadge',
    props: {
      icon: 'Status',
      label: i18n.t('Buttons:Status'),
      tooltip: i18n.t('Buttons:Status'),
      evaluate: {
        name: 'evaluate.modalityLoadBadge',
        hideWhenDisabled: true,
      },
    },
  },
  {
    id: 'navigationComponent',
    uiType: 'ohif.navigationComponent',
    props: {
      icon: 'Navigation',
      label: i18n.t('Buttons:Navigation'),
      tooltip: i18n.t('Buttons:Navigate between segments/measurements and manage their visibility'),
      evaluate: {
        name: 'evaluate.navigationComponent',
        hideWhenDisabled: true,
      },
    },
  },
  {
    id: 'trackingStatus',
    uiType: 'ohif.trackingStatus',
    props: {
      icon: 'TrackingStatus',
      label: i18n.t('Buttons:Tracking Status'),
      tooltip: i18n.t('Buttons:View and manage tracking status of measurements and annotations'),
      evaluate: {
        name: 'evaluate.trackingStatus',
        hideWhenDisabled: true,
      },
    },
  },
  {
    id: 'dataOverlayMenu',
    uiType: 'ohif.dataOverlayMenu',
    props: {
      icon: 'ViewportViews',
      label: i18n.t('Buttons:Data Overlay'),
      tooltip: i18n.t(
        'Buttons:Configure data overlay options and manage foreground/background display sets'
      ),
      evaluate: 'evaluate.dataOverlayMenu',
    },
  },
  {
    id: 'orientationMenu',
    uiType: 'ohif.orientationMenu',
    props: {
      icon: 'OrientationSwitch',
      label: i18n.t('Buttons:Orientation'),
      tooltip: i18n.t(
        'Buttons:Change viewport orientation between axial, sagittal, coronal and reformat planes'
      ),
      evaluate: {
        name: 'evaluate.orientationMenu',
        // hideWhenDisabled: true,
      },
    },
  },
  {
    id: 'windowLevelMenuEmbedded',
    uiType: 'ohif.windowLevelMenuEmbedded',
    props: {
      icon: 'WindowLevel',
      label: i18n.t('Buttons:Window Level'),
      tooltip: i18n.t('Buttons:Adjust window/level presets and customize image contrast settings'),
      evaluate: {
        name: 'evaluate.windowLevelMenuEmbedded',
        hideWhenDisabled: true,
      },
    },
  },
  {
    id: 'windowLevelMenu',
    uiType: 'ohif.windowLevelMenu',
    props: {
      icon: 'WindowLevel',
      label: i18n.t('Buttons:Window Level'),
      tooltip: i18n.t('Buttons:Adjust window/level presets and customize image contrast settings'),
      evaluate: {
        name: 'evaluate.windowLevelMenu',
      },
    },
  },
  {
    id: 'voiManualControlMenu',
    uiType: 'ohif.voiManualControlMenu',
    props: {
      icon: 'WindowLevelAdvanced',
      label: i18n.t('Buttons:Advanced Window Level'),
      tooltip: i18n.t('Buttons:Advanced window/level settings with manual controls and presets'),
      evaluate: 'evaluate.voiManualControlMenu',
    },
  },
  {
    id: 'thresholdMenu',
    uiType: 'ohif.thresholdMenu',
    props: {
      icon: 'Threshold',
      label: i18n.t('Buttons:Threshold'),
      tooltip: i18n.t('Buttons:Image threshold settings'),
      evaluate: {
        name: 'evaluate.thresholdMenu',
        hideWhenDisabled: true,
      },
    },
  },
  {
    id: 'opacityMenu',
    uiType: 'ohif.opacityMenu',
    props: {
      icon: 'Opacity',
      label: i18n.t('Buttons:Opacity'),
      tooltip: i18n.t('Buttons:Image opacity settings'),
      evaluate: {
        name: 'evaluate.opacityMenu',
        hideWhenDisabled: true,
      },
    },
  },
  {
    id: 'Colorbar',
    uiType: 'ohif.colorbar',
    props: {
      type: 'tool',
      label: i18n.t('Buttons:Colorbar'),
    },
  },
  {
    id: 'Reset',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-reset',
      label: i18n.t('Buttons:Reset View'),
      tooltip: i18n.t('Buttons:Reset View'),
      commands: 'resetViewport',
      evaluate: 'evaluate.action',
    },
  },
  {
    id: 'rotate-left',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-rotate-left',
      label: i18n.t('Buttons:Rotate Left'),
      tooltip: i18n.t('Buttons:Rotate -90'),
      commands: 'rotateViewportCCW',
      evaluate: [
        'evaluate.action',
        {
          name: 'evaluate.viewport.supported',
          unsupportedViewportTypes: ['video'],
        },
      ],
    },
  },
  {
    id: 'rotate-right',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-rotate-right',
      label: i18n.t('Buttons:Rotate Right'),
      tooltip: i18n.t('Buttons:Rotate +90'),
      commands: 'rotateViewportCW',
      evaluate: [
        'evaluate.action',
        {
          name: 'evaluate.viewport.supported',
          unsupportedViewportTypes: ['video'],
        },
      ],
    },
  },
  {
    id: 'flipVertical',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-flip-vertical',
      label: i18n.t('Buttons:Flip Vertical'),
      tooltip: i18n.t('Buttons:Flip Vertically'),
      commands: 'flipViewportVertical',
      evaluate: [
        'evaluate.viewportProperties.toggle',
        {
          name: 'evaluate.viewport.supported',
          unsupportedViewportTypes: ['video', 'volume3d'],
        },
      ],
    },
  },
  {
    id: 'flipHorizontal',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-flip-horizontal',
      label: i18n.t('Buttons:Flip Horizontal'),
      tooltip: i18n.t('Buttons:Flip Horizontally'),
      commands: 'flipViewportHorizontal',
      evaluate: [
        'evaluate.viewportProperties.toggle',
        {
          name: 'evaluate.viewport.supported',
          unsupportedViewportTypes: ['video', 'volume3d'],
        },
      ],
    },
  },
  {
    id: 'ImageSliceSync',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'link',
      label: i18n.t('Buttons:Image Slice Sync'),
      tooltip: i18n.t('Buttons:Enable position synchronization on stack viewports'),
      commands: {
        commandName: 'toggleSynchronizer',
        commandOptions: {
          type: 'imageSlice',
        },
      },
      listeners: {
        [EVENTS.VIEWPORT_NEW_IMAGE_SET]: {
          commandName: 'toggleImageSliceSync',
          commandOptions: { toggledState: true },
        },
      },
      evaluate: [
        'evaluate.cornerstone.synchronizer',
        {
          name: 'evaluate.viewport.supported',
          unsupportedViewportTypes: ['video', 'volume3d'],
        },
      ],
    },
  },
  {
    id: 'VOISync',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-voi-sync',
      label: i18n.t('Buttons:Window Level Sync'),
      tooltip: i18n.t('Buttons:Link window/level across viewports of the same modality'),
      commands: {
        commandName: 'toggleSynchronizer',
        commandOptions: {
          type: 'voi',
        },
      },
      evaluate: [
        'evaluate.cornerstone.synchronizer',
        {
          name: 'evaluate.viewport.supported',
          unsupportedViewportTypes: ['video', 'volume3d'],
        },
      ],
    },
  },
  {
    id: 'ReferenceLines',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-referenceLines',
      label: i18n.t('Buttons:Reference Lines'),
      tooltip: i18n.t('Buttons:Show Reference Lines'),
      commands: 'toggleEnabledDisabledToolbar',
      listeners: {
        [ViewportGridService.EVENTS.ACTIVE_VIEWPORT_ID_CHANGED]: callbacks('ReferenceLines'),
        [ViewportGridService.EVENTS.VIEWPORTS_READY]: callbacks('ReferenceLines'),
      },
      evaluate: [
        'evaluate.cornerstoneTool.toggle',
        {
          name: 'evaluate.viewport.supported',
          unsupportedViewportTypes: ['video'],
        },
      ],
    },
  },
  {
    id: 'ImageOverlayViewer',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'toggle-dicom-overlay',
      label: i18n.t('Buttons:Image Overlay'),
      tooltip: i18n.t('Buttons:Toggle Image Overlay'),
      commands: 'toggleEnabledDisabledToolbar',
      evaluate: [
        'evaluate.cornerstoneTool.toggle',
        {
          name: 'evaluate.viewport.supported',
          unsupportedViewportTypes: ['video'],
        },
      ],
    },
  },
  {
    id: 'StackScroll',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-stack-scroll',
      label: i18n.t('Buttons:Browse'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'invert',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-invert',
      label: i18n.t('Buttons:Invert'),
      tooltip: i18n.t('Buttons:Invert Colors'),
      commands: 'invertViewport',
      evaluate: [
        'evaluate.viewportProperties.toggle',
        {
          name: 'evaluate.viewport.supported',
          unsupportedViewportTypes: ['video'],
        },
      ],
    },
  },
  {
    id: 'Probe',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-probe',
      label: i18n.t('Buttons:Probe'),
      tooltip: i18n.t('Buttons:Probe'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'Cine',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-cine',
      label: i18n.t('Buttons:Cine'),
      tooltip: i18n.t('Buttons:Cine'),
      commands: 'toggleCine',
      evaluate: [
        'evaluate.cine',
        {
          name: 'evaluate.viewport.supported',
          unsupportedViewportTypes: ['volume3d'],
        },
      ],
    },
  },
  {
    id: 'Angle',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-angle',
      label: i18n.t('Buttons:Angle'),
      tooltip: i18n.t('Buttons:Angle'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'CobbAngle',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'icon-tool-cobb-angle',
      label: i18n.t('Buttons:Cobb Angle'),
      tooltip: i18n.t('Buttons:Cobb Angle'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'Magnify',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-magnify',
      label: i18n.t('Buttons:Zoom-in'),
      tooltip: i18n.t('Buttons:Zoom-in'),
      commands: setToolActiveToolbar,
      evaluate: [
        'evaluate.cornerstoneTool',
        {
          name: 'evaluate.viewport.supported',
          unsupportedViewportTypes: ['video'],
        },
      ],
    },
  },
  {
    id: 'CalibrationLine',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-calibration',
      label: i18n.t('Buttons:Calibration'),
      tooltip: i18n.t('Buttons:Calibration Line'),
      commands: setToolActiveToolbar,
      evaluate: [
        'evaluate.cornerstoneTool',
        {
          name: 'evaluate.viewport.supported',
          unsupportedViewportTypes: ['video'],
        },
      ],
    },
  },
  {
    id: 'TagBrowser',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'dicom-tag-browser',
      label: i18n.t('Buttons:Dicom Tag Browser'),
      tooltip: i18n.t('Buttons:Dicom Tag Browser'),
      commands: 'openDICOMTagViewer',
    },
  },
  {
    id: 'AdvancedMagnify',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'icon-tool-loupe',
      label: i18n.t('Buttons:Magnify Probe'),
      tooltip: i18n.t('Buttons:Magnify Probe'),
      commands: 'toggleActiveDisabledToolbar',
      evaluate: [
        'evaluate.cornerstoneTool.toggle.ifStrictlyDisabled',
        {
          name: 'evaluate.viewport.supported',
          unsupportedViewportTypes: ['video'],
        },
      ],
    },
  },
  {
    id: 'UltrasoundDirectionalTool',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'icon-tool-ultrasound-bidirectional',
      label: i18n.t('Buttons:Ultrasound Directional'),
      tooltip: i18n.t('Buttons:Ultrasound Directional'),
      commands: setToolActiveToolbar,
      evaluate: [
        'evaluate.cornerstoneTool',
        {
          name: 'evaluate.modality.supported',
          supportedModalities: ['US'],
        },
      ],
    },
  },
  {
    id: 'WindowLevelRegion',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'icon-tool-window-region',
      label: i18n.t('Buttons:Window Level Region'),
      tooltip: i18n.t('Buttons:Window Level Region'),
      commands: setToolActiveToolbar,
      evaluate: [
        'evaluate.cornerstoneTool',
        {
          name: 'evaluate.viewport.supported',
          unsupportedViewportTypes: ['video'],
        },
      ],
    },
  },
  {
    id: 'Length',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-length',
      label: i18n.t('Buttons:Length'),
      tooltip: i18n.t('Buttons:Length Tool'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'Bidirectional',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-bidirectional',
      label: i18n.t('Buttons:Bidirectional'),
      tooltip: i18n.t('Buttons:Bidirectional Tool'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'ArrowAnnotate',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-annotate',
      label: i18n.t('Buttons:Annotation'),
      tooltip: i18n.t('Buttons:Arrow Annotate'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'EllipticalROI',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-ellipse',
      label: i18n.t('Buttons:Ellipse'),
      tooltip: i18n.t('Buttons:Ellipse ROI'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'RectangleROI',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-rectangle',
      label: i18n.t('Buttons:Rectangle'),
      tooltip: i18n.t('Buttons:Rectangle ROI'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'CircleROI',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-circle',
      label: i18n.t('Buttons:Circle'),
      tooltip: i18n.t('Buttons:Circle Tool'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'PlanarFreehandROI',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'icon-tool-freehand-roi',
      label: i18n.t('Buttons:Freehand ROI'),
      tooltip: i18n.t('Buttons:Freehand ROI'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'SplineROI',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'icon-tool-spline-roi',
      label: i18n.t('Buttons:Spline ROI'),
      tooltip: i18n.t('Buttons:Spline ROI'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'LivewireContour',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'icon-tool-livewire',
      label: i18n.t('Buttons:Livewire tool'),
      tooltip: i18n.t('Buttons:Livewire tool'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  // Fork: RadiAnt-style window presets under the W/L split button (keys 0-9).
  ...(
    [
      ['WLDefault', 'Default window', 'resetWindowLevel', {}],
      ['WLFull', 'Full dynamic range', 'fullDynamicRange', {}],
      ['WLAbdomen', 'Abdomen', 'setWindowLevelPreset', { presetName: 'ct-abdomen' }],
      ['WLAngio', 'Angio', 'setWindowLevelPreset', { presetName: 'ct-angio' }],
      ['WLBone', 'Bone', 'setWindowLevelPreset', { presetName: 'ct-bone' }],
      ['WLBrain', 'Brain', 'setWindowLevelPreset', { presetName: 'ct-brain' }],
      ['WLChest', 'Chest', 'setWindowLevelPreset', { presetName: 'ct-mediastinum' }],
      ['WLLung', 'Lung', 'setWindowLevelPreset', { presetName: 'ct-lung' }],
      ['WLStroke', 'Stroke', 'setWindowLevelPreset', { presetName: 'ct-stroke' }],
      ['WLSubdural', 'Subdural', 'setWindowLevelPreset', { presetName: 'ct-subdural' }],
      ['WLADC', 'ADC (MR)', 'setWindowLevelPreset', { presetName: 'mr-adc' }],
    ] as const
  ).map(([id, label, commandName, commandOptions]) => ({
    id,
    uiType: 'ohif.toolButton',
    // No icon: a plain text list, like RadiAnt's presets menu.
    props: {
      label: i18n.t(`Buttons:${label}`),
      commands: { commandName, commandOptions },
      evaluate: 'evaluate.action',
    },
  })),
  {
    // Fork: MR post − pre contrast (imaging-platform subtractSeries).
    id: 'Subtract',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-subtract',
      label: i18n.t('Buttons:Subtraction'),
      tooltip: i18n.t('Buttons:Post minus pre contrast (MR)'),
      commands: 'subtractSeries',
      evaluate: [
        'evaluate.action',
        { name: 'evaluate.modality.supported', supportedModalities: ['MR'] },
      ],
    },
  },
  // Window Level
  {
    id: 'WindowLevel',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-window-level',
      label: i18n.t('Buttons:Window Level'),
      commands: setToolActiveToolbar,
      evaluate: [
        'evaluate.cornerstoneTool',
        {
          name: 'evaluate.viewport.supported',
          unsupportedViewportTypes: ['wholeSlide'],
        },
      ],
    },
  },
  {
    id: 'Pan',
    uiType: 'ohif.toolButton',
    props: {
      type: 'tool',
      icon: 'tool-move',
      label: i18n.t('Buttons:Pan'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'Zoom',
    uiType: 'ohif.toolButton',
    props: {
      type: 'tool',
      icon: 'tool-zoom',
      label: i18n.t('Buttons:Zoom'),
      commands: setToolActiveToolbar,
      evaluate: 'evaluate.cornerstoneTool',
    },
  },
  {
    id: 'MPR',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'icon-mpr',
      label: i18n.t('Buttons:MPR'),
      tooltip: i18n.t('Buttons:MPR'),
      commands: {
        commandName: 'toggleHangingProtocol',
        commandOptions: {
          protocolId: 'mpr',
        },
      },
      evaluate: 'evaluate.displaySetIsReconstructable',
    },
  },
  {
    id: 'MIP',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'layout-advanced-mpr',
      label: i18n.t('Buttons:MIP'),
      tooltip: i18n.t(
        'Buttons:MIP: wheel rotates, click jumps, middle or Ctrl+drag adjusts brightness/contrast, Shift+drag pans'
      ),
      commands: {
        commandName: 'toggleHangingProtocol',
        commandOptions: {
          protocolId: 'mip',
        },
      },
      evaluate: 'evaluate.displaySetIsReconstructable',
    },
  },
  {
    id: 'SlabTools',
    uiType: 'ohif.toolButtonList',
    props: {
      buttonSection: true,
    },
  },
  // Slab projections on the active MPR viewport (setViewportSlab). Thin slice = normal MPR.
  ...[
    ['SlabMIP10', 'MIP 10 mm', 'mip', 10, 'layout-advanced-mpr'],
    ['SlabMIP20', 'MIP 20 mm', 'mip', 20, 'layout-advanced-mpr'],
    ['SlabMIPFull', 'MIP full volume', 'mip', 'fullVolume', 'layout-advanced-mpr'],
    ['SlabMinIP10', 'MinIP 10 mm (airways)', 'minip', 10, 'icon-mpr'],
    ['SlabAvgIP5', 'AvgIP 5 mm', 'avg', 5, 'icon-mpr'],
    ['SlabOff', 'Thin slice (slab off)', undefined, undefined, 'tool-reset'],
  ].map(([id, label, blendMode, slabThickness, icon]) => ({
    id,
    uiType: 'ohif.toolButton',
    props: {
      icon,
      label: i18n.t(`Buttons:${label}`),
      tooltip: i18n.t(`Buttons:${label}`),
      commands: { commandName: 'setViewportSlab', commandOptions: { blendMode, slabThickness } },
      evaluate: [
        'evaluate.action',
        {
          name: 'evaluate.viewport.supported',
          unsupportedViewportTypes: ['stack', 'video', 'volume3d', 'wholeSlide'],
          disabledText: i18n.t('Buttons:Open MPR to use slab projections'),
        },
      ],
    },
  })),
  {
    id: 'VolumeRendering3D',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'layout-advanced-3d-only',
      label: '3D VR',
      tooltip: '3D Volume Rendering',
      commands: {
        commandName: 'toggleHangingProtocol',
        commandOptions: {
          protocolId: 'only3D',
        },
      },
      evaluate: 'evaluate.displaySetIsReconstructable',
    },
  },
  {
    id: 'TrackballRotate',
    uiType: 'ohif.toolButton',
    props: {
      type: 'tool',
      icon: 'tool-3d-rotate',
      label: i18n.t('Buttons:3D Rotate'),
      commands: setToolActiveToolbar,
      evaluate: {
        name: 'evaluate.cornerstoneTool',
        disabledText: i18n.t('Buttons:Select a 3D viewport to enable this tool'),
      },
    },
  },
  {
    id: 'VolumeCropping',
    uiType: 'ohif.toolButton',
    props: {
      type: 'tool',
      icon: 'tool-3d-rotate',
      label: i18n.t('Buttons:3D Crop'),
      tooltip: i18n.t('Buttons:Drag the coloured handles to crop the 3D volume'),
      commands: setToolActiveToolbar,
      evaluate: {
        name: 'evaluate.cornerstoneTool',
        disabledText: i18n.t('Buttons:Select a 3D viewport to enable this tool'),
      },
    },
  },
  // Image filters on the active viewport (setViewportFilter).
  ...[
    ['FilterSharpenLow', 'Sharpen (low)', { sharpening: 0.2 }],
    ['FilterSharpenHigh', 'Sharpen (high)', { sharpening: 0.5 }],
    ['FilterSmooth', 'Smooth', { smoothing: 2 }],
    ['FilterOff', 'Filter off', {}],
  ].map(([id, label, commandOptions]) => ({
    id,
    uiType: 'ohif.toolButton',
    props: {
      icon:
        id === 'FilterOff'
          ? 'tool-reset'
          : id === 'FilterSmooth'
            ? 'filter-smooth'
            : 'filter-sharpen',
      label: i18n.t(`Buttons:${label}`),
      tooltip: i18n.t(`Buttons:${label}`),
      commands: { commandName: 'setViewportFilter', commandOptions },
      evaluate: [
        'evaluate.action',
        {
          name: 'evaluate.viewport.supported',
          unsupportedViewportTypes: ['video', 'volume3d', 'wholeSlide'],
        },
      ],
    },
  })),
  {
    id: 'Capture',
    uiType: 'ohif.toolButton',
    props: {
      icon: 'tool-capture',
      label: i18n.t('Buttons:Capture'),
      commands: 'showDownloadViewportModal',
      evaluate: [
        'evaluate.action',
        {
          name: 'evaluate.viewport.supported',
          unsupportedViewportTypes: ['video', 'wholeSlide'],
        },
      ],
    },
  },
  {
    id: 'Layout',
    uiType: 'ohif.layoutSelector',
    props: {
      rows: 3,
      columns: 4,
      evaluate: 'evaluate.action',
    },
  },
  {
    id: 'Crosshairs',
    uiType: 'ohif.toolButton',
    props: {
      type: 'tool',
      icon: 'tool-crosshair',
      label: i18n.t('Buttons:Crosshairs'),
      tooltip: i18n.t(
        'Buttons:Crosshairs: drag a line to rotate, drag its end handles for a slab MIP'
      ),
      commands: {
        commandName: 'setToolActiveToolbar',
        commandOptions: {
          toolGroupIds: ['mpr'],
        },
      },
      evaluate: {
        name: 'evaluate.cornerstoneTool',
        disabledText: i18n.t('Buttons:Select an MPR viewport to enable this tool'),
      },
    },
  },
  {
    id: 'SegmentLabelTool',
    uiType: 'ohif.toolBoxButton',
    props: {
      icon: 'tool-segment-label',
      label: i18n.t('Buttons:Segment Label Display'),
      tooltip: i18n.t(
        'Buttons:Click to show or hide segment labels when hovering with your mouse.'
      ),
      commands: { commandName: 'toggleSegmentLabel' },
      evaluate: [
        'evaluate.cornerstoneTool.toggle',
        {
          name: 'evaluate.cornerstone.hasSegmentation',
        },
      ],
    },
  },
  {
    id: 'Undo',
    uiType: 'ohif.toolButton',
    props: {
      type: 'tool',
      icon: 'Undo',
      label: i18n.t('Buttons:Undo'),
      commands: {
        commandName: 'undo',
      },
      evaluate: 'evaluate.action',
    },
  },
  {
    id: 'Redo',
    uiType: 'ohif.toolButton',
    props: {
      type: 'tool',
      icon: 'Redo',
      label: i18n.t('Buttons:Redo'),
      commands: {
        commandName: 'redo',
      },
      evaluate: 'evaluate.action',
    },
  },
];

for (const [group, ids] of Object.entries(primaryToolbarGroups)) {
  for (const id of ids) {
    const button = toolbarButtons.find(b => b.id === id);
    if (button) {
      button.props = { ...button.props, group };
    }
  }
}

export default toolbarButtons;
