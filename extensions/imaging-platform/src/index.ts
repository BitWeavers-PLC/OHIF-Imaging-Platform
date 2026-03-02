import { Types } from '@ohif/core';
import getCustomizationModule from './getCustomizationModule';
import { id } from './id';

const imagingPlatformExtension: Types.Extensions.Extension = {
  id,
  getCustomizationModule,
};

export default imagingPlatformExtension;
