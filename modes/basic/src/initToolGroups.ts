// Fork: not the package index, which imports this mode back.
import { createTools as createSegmentationTools } from '../../segmentation/src/initToolGroups';

const colours = {
  'viewport-0': 'rgb(200, 0, 0)',
  'viewport-1': 'rgb(200, 200, 0)',
  'viewport-2': 'rgb(0, 200, 0)',
};

const colorsByOrientation = {
  axial: 'rgb(200, 0, 0)',
  sagittal: 'rgb(200, 200, 0)',
  coronal: 'rgb(0, 200, 0)',
};

/**
 * RadiAnt-style mouse map for 2D viewports: left browse, middle W/L, right zoom,
 * back pan, forward length, wheel browse, Ctrl+wheel zoom, Ctrl+left W/L, Shift+left pan.
 * Toolbar tools replace only the plain left binding.
 */
export function radiantActiveTools(toolNames, Enums, { lengthToolName = toolNames.Length } = {}) {
  const { MouseBindings, KeyboardBindings } = Enums;
  const tools = [
    {
      toolName: toolNames.StackScroll,
      bindings: [
        { mouseButton: MouseBindings.Primary },
        { mouseButton: MouseBindings.Wheel },
        { numTouchPoints: 3 },
      ],
    },
    {
      toolName: toolNames.WindowLevel,
      bindings: [
        { mouseButton: MouseBindings.Auxiliary },
        { mouseButton: MouseBindings.Primary, modifierKey: KeyboardBindings.Ctrl },
      ],
    },
    {
      toolName: toolNames.Zoom,
      bindings: [
        { mouseButton: MouseBindings.Secondary },
        { mouseButton: MouseBindings.Wheel, modifierKey: KeyboardBindings.Ctrl },
        { numTouchPoints: 2 },
      ],
    },
    {
      toolName: toolNames.Pan,
      bindings: [
        { mouseButton: MouseBindings.Fourth_Button },
        { mouseButton: MouseBindings.Primary, modifierKey: KeyboardBindings.Shift },
      ],
    },
  ];
  if (lengthToolName) {
    tools.push({
      toolName: lengthToolName,
      bindings: [{ mouseButton: MouseBindings.Fifth_Button }],
    });
  }
  return tools;
}

/**
 * Fork: segmentation editing in the main viewer. Adds the segmentation mode's brush, eraser,
 * threshold, scissors and contour tools as passive, skipping any tool this group already has
 * (so StackScroll keeps its active bindings).
 */
export function withSegmentationTools(tools, utilityModule, commandsManager) {
  const present = new Set(
    Object.values(tools)
      .flat()
      .map((tool: any) => tool.toolName)
  );
  const extra = createSegmentationTools({ utilityModule, commandsManager }).passive.filter(
    tool => !present.has(tool.toolName)
  );
  return { ...tools, passive: [...(tools.passive ?? []), ...extra] };
}

function initDefaultToolGroup(extensionManager, toolGroupService, commandsManager, toolGroupId) {
  const utilityModule = extensionManager.getModuleEntry(
    '@ohif/extension-cornerstone.utilityModule.tools'
  );

  const { toolNames, Enums } = utilityModule.exports;

  const tools = {
    active: radiantActiveTools(toolNames, Enums),
    passive: [
      {
        toolName: toolNames.ArrowAnnotate,
        configuration: {
          getTextCallback: (callback, eventDetails) => {
            commandsManager.runCommand('arrowTextCallback', {
              callback,
              eventDetails,
            });
          },
          changeTextCallback: (data, eventDetails, callback) => {
            commandsManager.runCommand('arrowTextCallback', {
              callback,
              data,
              eventDetails,
            });
          },
        },
      },
      {
        toolName: toolNames.SegmentBidirectional,
      },
      { toolName: toolNames.Bidirectional },
      { toolName: toolNames.DragProbe },
      { toolName: toolNames.Probe },
      { toolName: toolNames.EllipticalROI },
      { toolName: toolNames.CircleROI },
      { toolName: toolNames.RectangleROI },
      { toolName: toolNames.Angle },
      { toolName: toolNames.CobbAngle },
      { toolName: toolNames.Magnify },
      { toolName: toolNames.CalibrationLine },
      {
        toolName: toolNames.PlanarFreehandContourSegmentation,
        configuration: {
          displayOnePointAsCrosshairs: true,
        },
      },
      { toolName: toolNames.UltrasoundDirectional },
      { toolName: toolNames.PlanarFreehandROI },
      { toolName: toolNames.SplineROI },
      { toolName: toolNames.LivewireContour },
      { toolName: toolNames.WindowLevelRegion },
    ],
    enabled: [{ toolName: toolNames.ImageOverlayViewer }, { toolName: toolNames.ReferenceLines }],
    disabled: [
      {
        toolName: toolNames.AdvancedMagnify,
      },
    ],
  };

  const updatedTools = commandsManager.run('initializeSegmentLabelTool', { tools });

  toolGroupService.createToolGroupAndAddTools(
    toolGroupId,
    withSegmentationTools(updatedTools, utilityModule, commandsManager)
  );
}

function initSRToolGroup(extensionManager, toolGroupService) {
  const SRUtilityModule = extensionManager.getModuleEntry(
    '@ohif/extension-cornerstone-dicom-sr.utilityModule.tools'
  );

  if (!SRUtilityModule) {
    return;
  }

  const CS3DUtilityModule = extensionManager.getModuleEntry(
    '@ohif/extension-cornerstone.utilityModule.tools'
  );

  const { toolNames: SRToolNames } = SRUtilityModule.exports;
  const { toolNames, Enums } = CS3DUtilityModule.exports;
  const tools = {
    // SR group has no plain Length tool; the forward button stays unbound.
    active: radiantActiveTools(toolNames, Enums, { lengthToolName: null }),
    passive: [
      { toolName: SRToolNames.SRLength },
      { toolName: SRToolNames.SRArrowAnnotate },
      { toolName: SRToolNames.SRBidirectional },
      { toolName: SRToolNames.SREllipticalROI },
      { toolName: SRToolNames.SRCircleROI },
      { toolName: SRToolNames.SRPlanarFreehandROI },
      { toolName: SRToolNames.SRRectangleROI },
      { toolName: toolNames.WindowLevelRegion },
    ],
    enabled: [
      {
        toolName: SRToolNames.DICOMSRDisplay,
      },
    ],
    // disabled
  };

  const toolGroupId = 'SRToolGroup';
  toolGroupService.createToolGroupAndAddTools(toolGroupId, tools);
}

function initMPRToolGroup(extensionManager, toolGroupService, commandsManager) {
  const utilityModule = extensionManager.getModuleEntry(
    '@ohif/extension-cornerstone.utilityModule.tools'
  );

  const serviceManager = extensionManager._servicesManager;
  const { cornerstoneViewportService } = serviceManager.services;

  const { toolNames, Enums } = utilityModule.exports;

  const tools = {
    active: radiantActiveTools(toolNames, Enums),
    passive: [
      {
        toolName: toolNames.ArrowAnnotate,
        configuration: {
          getTextCallback: (callback, eventDetails) => {
            commandsManager.runCommand('arrowTextCallback', {
              callback,
              eventDetails,
            });
          },
          changeTextCallback: (data, eventDetails, callback) => {
            commandsManager.runCommand('arrowTextCallback', {
              callback,
              data,
              eventDetails,
            });
          },
        },
      },
      { toolName: toolNames.Bidirectional },
      { toolName: toolNames.DragProbe },
      { toolName: toolNames.Probe },
      { toolName: toolNames.EllipticalROI },
      { toolName: toolNames.CircleROI },
      { toolName: toolNames.RectangleROI },
      { toolName: toolNames.Angle },
      { toolName: toolNames.CobbAngle },
      { toolName: toolNames.PlanarFreehandROI },
      { toolName: toolNames.SplineROI },
      { toolName: toolNames.LivewireContour },
      { toolName: toolNames.WindowLevelRegion },
      {
        toolName: toolNames.PlanarFreehandContourSegmentation,
        configuration: {
          displayOnePointAsCrosshairs: true,
        },
      },
    ],
    disabled: [
      {
        toolName: toolNames.Crosshairs,
        configuration: {
          viewportIndicators: true,
          viewportIndicatorsConfig: {
            circleRadius: 5,
            xOffset: 0.95,
            yOffset: 0.05,
          },
          disableOnPassive: true,
          autoPan: {
            enabled: false,
            panSize: 10,
          },
          getReferenceLineColor: viewportId => {
            const viewportInfo = cornerstoneViewportService.getViewportInfo(viewportId);
            const viewportOptions = viewportInfo?.viewportOptions;
            if (viewportOptions) {
              return (
                colours[viewportOptions.id] ||
                colorsByOrientation[viewportOptions.orientation] ||
                '#0c0'
              );
            } else {
              console.warn('missing viewport?', viewportId);
              return '#0c0';
            }
          },
        },
      },
      {
        toolName: toolNames.AdvancedMagnify,
      },
      { toolName: toolNames.ReferenceLines },
    ],
  };

  toolGroupService.createToolGroupAndAddTools(
    'mpr',
    withSegmentationTools(tools, utilityModule, commandsManager)
  );
}
function initVolume3DToolGroup(extensionManager, toolGroupService) {
  const utilityModule = extensionManager.getModuleEntry(
    '@ohif/extension-cornerstone.utilityModule.tools'
  );

  const { toolNames, Enums } = utilityModule.exports;

  const tools = {
    active: [
      {
        toolName: toolNames.TrackballRotateTool,
        bindings: [{ mouseButton: Enums.MouseBindings.Primary }],
      },
      {
        toolName: toolNames.Zoom,
        bindings: [{ mouseButton: Enums.MouseBindings.Secondary }, { numTouchPoints: 2 }],
      },
      {
        toolName: toolNames.WindowLevel,
        bindings: [{ mouseButton: Enums.MouseBindings.Auxiliary }],
      },
      {
        toolName: toolNames.Pan,
        bindings: [{ mouseButton: Enums.MouseBindings.Fourth_Button }, { numTouchPoints: 3 }],
      },
    ],
    // Crop box handles; also rotates when not dragging a handle (VolumeCropping button).
    passive: [{ toolName: toolNames.VolumeCropping }],
    enabled: [{ toolName: toolNames.OrientationMarker }],
  };

  toolGroupService.createToolGroupAndAddTools('volume3d', tools);
}

/** Rotating MIP viewport (as in tmtv): wheel rotates, click jumps the MPR viewports there. */
export function initMIPToolGroup(extensionManager, toolGroupService) {
  const utilityModule = extensionManager.getModuleEntry(
    '@ohif/extension-cornerstone.utilityModule.tools'
  );

  const { toolNames, Enums } = utilityModule.exports;

  const tools = {
    active: [
      {
        toolName: toolNames.VolumeRotate,
        bindings: [{ mouseButton: Enums.MouseBindings.Wheel }],
        configuration: { rotateIncrementDegrees: 5 },
      },
      {
        toolName: toolNames.MipJumpToClick,
        bindings: [{ mouseButton: Enums.MouseBindings.Primary }],
        configuration: { toolGroupId: 'mpr' },
      },
      {
        // Middle or Ctrl+drag windows the MIP itself (plain click is jump-to-click).
        toolName: toolNames.WindowLevel,
        bindings: [
          { mouseButton: Enums.MouseBindings.Auxiliary },
          {
            mouseButton: Enums.MouseBindings.Primary,
            modifierKey: Enums.KeyboardBindings.Ctrl,
          },
        ],
      },
      {
        toolName: toolNames.Zoom,
        bindings: [{ mouseButton: Enums.MouseBindings.Secondary }, { numTouchPoints: 2 }],
      },
      {
        toolName: toolNames.Pan,
        bindings: [
          { mouseButton: Enums.MouseBindings.Fourth_Button },
          {
            mouseButton: Enums.MouseBindings.Primary,
            modifierKey: Enums.KeyboardBindings.Shift,
          },
          { numTouchPoints: 3 },
        ],
      },
    ],
    enabled: [{ toolName: toolNames.OrientationMarker }],
  };

  toolGroupService.createToolGroupAndAddTools('mip', tools);
}

function initToolGroups(extensionManager, toolGroupService, commandsManager) {
  initDefaultToolGroup(extensionManager, toolGroupService, commandsManager, 'default');
  initSRToolGroup(extensionManager, toolGroupService);
  initMPRToolGroup(extensionManager, toolGroupService, commandsManager);
  initVolume3DToolGroup(extensionManager, toolGroupService);
  initMIPToolGroup(extensionManager, toolGroupService);
}

export default initToolGroups;
