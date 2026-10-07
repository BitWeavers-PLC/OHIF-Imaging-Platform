import React from 'react';
import LayoutMenu from './LayoutMenu';

export default function getToolbarModule({ commandsManager, servicesManager }) {
  return [
    {
      name: 'imagingPlatform.layoutMenu',
      defaultComponent: props => (
        <LayoutMenu
          {...props}
          commandsManager={commandsManager}
          servicesManager={servicesManager}
        />
      ),
    },
  ];
}
