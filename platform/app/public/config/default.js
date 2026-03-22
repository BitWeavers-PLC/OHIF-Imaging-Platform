/** @type {AppTypes.Config} */

window.config = {
  name: 'config/default.js',
  routerBasename: null,
  whiteLabeling: {
    createLogoComponentFn: function (React) {
      return React.createElement(
        'a',
        {
          target: '_self',
          rel: 'noopener noreferrer',
          className: 'inline-flex items-center gap-2 text-white text-lg font-semibold',
          href: '/',
        },
        React.createElement('img', {
          src: `${window.PUBLIC_URL || '/'}assets/favicon-32x32.png`,
          alt: 'AxialScope logo',
          className: 'h-5 w-5 shrink-0 rounded-sm',
        }),
        React.createElement('span', null, 'AxialScope')
      );
    },
  },
  // Keep default config backward-compatible; use `config/imaging-platform.js`
  // to force the overlay mode/extension entrypoint.
  extensions: [],
  modes: [],
  customizationService: {},
  showStudyList: false,
  // some windows systems have issues with more than 3 web workers
  maxNumberOfWebWorkers: 3,
  // below flag is for performance reasons, but it might not work for all servers
  showWarningMessageForCrossOrigin: true,
  showCPUFallbackMessage: true,
  showLoadingIndicator: true,
  experimentalStudyBrowserSort: false,
  strictZSpacingForVolumeViewport: true,
  groupEnabledModesFirst: true,
  imagingPlatform: {
    brand: {
      appName: 'AxialScope',
      hideOHIFReferences: true,
      supportUrl: 'https://support.imagingplatform.local',
    },
    uiThemePreset: 'meddreamLike',
    studyBrowserDefaultView: 'thumbnails',
    toolbar: {
      responsiveOverflow: true,
      overflowMinVisible: 8,
      bufferToMoreCount: 0,
      alwaysShowMore: true,
      leftGuardPx: 12,
      minRightActionsPx: 44,
      rightReservationMode: 'measured',
      maxVisibleButtons: null,
      debug: true,
    },
    viewer: {
      patientInfoSingleLine: true,
      undoRedoPlacement: 'toolbar-responsive',
      panelAutoFit: true,
    },
  },
  // Backward-compatible flat keys; migration target is `imagingPlatform`.
  uiThemePreset: 'meddreamLike',
  studyBrowserDefaultView: 'thumbnails',
  studyBrowserPanelAutoFit: true,
  toolbarResponsiveOverflow: true,
  toolbarOverflowMinVisible: 8,
  toolbarBufferToMoreCount: 0,
  toolbarMoreAlwaysVisible: true,
  toolbarOverflowDebug: true,
  toolbarLeftGuardPx: 12,
  toolbarMinRightActionsPx: 44,
  toolbarRightReservationMode: 'measured',
  patientInfoSingleLine: true,
  undoRedoPlacement: 'toolbar-responsive',
  toolbarOnlyMPRDropdown: true,
  measurementPrimaryToolId: 'Length',
  headerToolsFirstCollapse: true,
  brand: {
    appName: 'AxialScope',
    hideOHIFReferences: true,
    supportUrl: 'https://support.imagingplatform.local',
  },
  measurementTrackingMode: 'simplified',
  allowMultiSelectExport: false,
  maxNumRequests: {
    interaction: 100,
    thumbnail: 75,
    // Prefetch number is dependent on the http protocol. For http 2 or
    // above, the number of requests can be go a lot higher.
    prefetch: 25,
  },
  showErrorDetails: 'always', // 'always', 'dev', 'production'
  // filterQueryParam: false,
  // Defines multi-monitor layouts
  multimonitor: [
    {
      id: 'split',
      test: ({ multimonitor }) => multimonitor === 'split',
      screens: [
        {
          id: 'ohif0',
          screen: null,
          location: {
            screen: 0,
            width: 0.5,
            height: 1,
            left: 0,
            top: 0,
          },
          options: 'location=no,menubar=no,scrollbars=no,status=no,titlebar=no',
        },
        {
          id: 'ohif1',
          screen: null,
          location: {
            width: 0.5,
            height: 1,
            left: 0.5,
            top: 0,
          },
          options: 'location=no,menubar=no,scrollbars=no,status=no,titlebar=no',
        },
      ],
    },

    {
      id: '2',
      test: ({ multimonitor }) => multimonitor === '2',
      screens: [
        {
          id: 'ohif0',
          screen: 0,
          location: {
            width: 1,
            height: 1,
            left: 0,
            top: 0,
          },
          options: 'fullscreen=yes,location=no,menubar=no,scrollbars=no,status=no,titlebar=no',
        },
        {
          id: 'ohif1',
          screen: 1,
          location: {
            width: 1,
            height: 1,
            left: 0,
            top: 0,
          },
          options: 'fullscreen=yes,location=no,menubar=no,scrollbars=no,status=no,titlebar=no',
        },
      ],
    },
  ],
  defaultDataSourceName: 'ohif',
  /* Dynamic config allows user to pass "configUrl" query string this allows to load config without recompiling application. The regex will ensure valid configuration source */
  // dangerouslyUseDynamicConfig: {
  //   enabled: true,
  //   // regex will ensure valid configuration source and default is /.*/ which matches any character. To use this, setup your own regex to choose a specific source of configuration only.
  //   // Example 1, to allow numbers and letters in an absolute or sub-path only.
  //   // regex: /(0-9A-Za-z.]+)(\/[0-9A-Za-z.]+)*/
  //   // Example 2, to restricts to either hosptial.com or othersite.com.
  //   // regex: /(https:\/\/hospital.com(\/[0-9A-Za-z.]+)*)|(https:\/\/othersite.com(\/[0-9A-Za-z.]+)*)/
  //   regex: /.*/,
  // },
  dataSources: [
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'ohif',
      configuration: {
        friendlyName: 'AWS S3 Static wado server',
        name: 'aws',
        wadoUriRoot: '/pacs/api',
        qidoRoot: '/pacs/api',
        wadoRoot: '/pacs/api',
        qidoSupportsIncludeField: false,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: true,
        supportsWildcard: false,
        staticWado: true,
        singlepart: 'bulkdata,video',
        // whether the data source should use retrieveBulkData to grab metadata,
        // and in case of relative path, what would it be relative to, options
        // are in the series level or study level (some servers like series some study)
        bulkDataURI: {
          enabled: true,
          relativeResolution: 'studies',
          transform: url => url.replace('/pixeldata.mp4', '/rendered'),
        },
        omitQuotationForMultipartRequest: true,
      },
    },
  ],
  httpErrorHandler: error => {
    // This is 429 when rejected from the public idc sandbox too often.
    console.warn(error.status);

    // Could use services manager here to bring up a dialog/modal if needed.
    console.warn('test, navigate to https://ohif.org/');
  },
  // segmentation: {
  //   segmentLabel: {
  //     enabledByDefault: true,
  //     labelColor: [255, 255, 0, 1], // must be an array
  //     hoverTimeout: 1,
  //     background: 'rgba(100, 100, 100, 0.5)', // can be any valid css color
  //   },
  // },
};
