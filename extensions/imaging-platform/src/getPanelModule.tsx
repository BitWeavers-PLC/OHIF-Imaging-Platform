import React from 'react';
import WrappedPanelStudyBrowserTracking from '@ohif/extension-measurement-tracking/src/panels/PanelStudyBrowserTracking';
import SeriesStrip from './panels/SeriesStrip';

/** Fork: left series strip; keeps the tracked study browser's logic, replaces its view. */
export default function getPanelModule() {
  return [
    {
      name: 'seriesStrip',
      iconName: 'tab-studies',
      iconLabel: 'Series',
      label: '',
      component: () => <WrappedPanelStudyBrowserTracking StudyBrowserComponent={SeriesStrip} />,
    },
  ];
}
