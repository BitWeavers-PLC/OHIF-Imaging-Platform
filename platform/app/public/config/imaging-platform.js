/** @type {AppTypes.Config} */

window.config = {
  name: 'config/imaging-platform.js',
  routerBasename: null,
  extensions: ['@ohif/extension-imaging-platform'],
  modes: ['@ohif/mode-imaging-platform'],
  customizationService: {},
  showStudyList: false,

  imagingPlatform: {
    brand: {
      appName: 'Imaging Platform',
      hideOHIFReferences: true,
      supportUrl: 'https://support.imagingplatform.local',
    },
    uiThemePreset: 'meddreamLike',
    studyBrowserDefaultView: 'thumbnails',
    toolbar: {
      responsiveOverflow: true,
      alwaysShowMore: true,
      leftGuardPx: 12,
      maxVisibleButtons: null,
      bufferToMoreCount: 0,
      overflowMinVisible: 8,
      minRightActionsPx: 44,
      rightReservationMode: 'measured',
    },
    viewer: {
      undoRedoPlacement: 'toolbar-responsive',
      patientInfoSingleLine: true,
      panelAutoFit: true,
    },
  },

  // Backward-compatible mirrors for components still reading legacy flat keys.
  brand: {
    appName: 'Imaging Platform',
    hideOHIFReferences: true,
    supportUrl: 'https://support.imagingplatform.local',
  },
  uiThemePreset: 'meddreamLike',
  studyBrowserDefaultView: 'thumbnails',
  studyBrowserPanelAutoFit: true,
  toolbarResponsiveOverflow: true,
  toolbarOverflowMinVisible: 8,
  toolbarBufferToMoreCount: 0,
  toolbarMoreAlwaysVisible: true,
  toolbarLeftGuardPx: 12,
  toolbarMinRightActionsPx: 44,
  toolbarRightReservationMode: 'measured',
  patientInfoSingleLine: true,
  undoRedoPlacement: 'toolbar-responsive',

  whiteLabeling: {
    createLogoComponentFn: function (React) {
      return React.createElement(
        'a',
        {
          target: '_self',
          rel: 'noopener noreferrer',
          className: 'text-white text-lg font-semibold',
          href: '/',
        },
        'Imaging Platform'
      );
    },
  },

  // Keep datasource/server details in your deployment-specific config.
  dataSources: [],
};
