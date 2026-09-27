import React from 'react';
import WrappedPanelStudyBrowserTracking from '@ohif/extension-measurement-tracking/src/panels/PanelStudyBrowserTracking';
import SeriesStrip from './panels/SeriesStrip';
import TimeIntensityPanel from './panels/TimeIntensityPanel';

/** Fork: left series strip (tracked study browser's logic, our view) and the DCE curve panel. */
export default function getPanelModule() {
  return [
    {
      name: 'seriesStrip',
      iconName: 'tab-studies',
      iconLabel: 'Series',
      label: '',
      component: () => <WrappedPanelStudyBrowserTracking StudyBrowserComponent={SeriesStrip} />,
    },
    {
      // Fork: DCE time–intensity curves (right panel).
      name: 'timeIntensity',
      iconName: 'tab-time-intensity',
      iconLabel: 'Curves',
      label: 'Time–intensity',
      component: TimeIntensityPanel,
    },
  ];
}
