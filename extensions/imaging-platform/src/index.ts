import { Types } from '@ohif/core';
import getCustomizationModule from './getCustomizationModule';
import { id } from './id';
import registerIcons from './icons';
import getPanelModule from './getPanelModule';

const imagingPlatformExtension: Types.Extensions.Extension = {
  id,
  preRegistration() {
    registerIcons();
  },
  getCustomizationModule,
  getPanelModule,
};

export default imagingPlatformExtension;
