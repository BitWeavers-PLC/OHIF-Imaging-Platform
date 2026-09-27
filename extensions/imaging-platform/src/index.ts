import { Types } from '@ohif/core';
import getCustomizationModule from './getCustomizationModule';
import { id } from './id';
import registerIcons from './icons';
import getPanelModule from './getPanelModule';
import getCommandsModule from './commandsModule';

const imagingPlatformExtension: Types.Extensions.Extension = {
  id,
  preRegistration() {
    registerIcons();
    // Mouse back/forward drive Pan/Length (RadiAnt); stop them navigating away from the study.
    document.addEventListener('mouseup', e => {
      if (e.button === 3 || e.button === 4) {
        e.preventDefault();
      }
    });
  },
  getCommandsModule,
  getCustomizationModule,
  getPanelModule,
};

export default imagingPlatformExtension;
