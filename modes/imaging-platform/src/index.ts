import i18n from 'i18next';
import { id } from './id';
import {
  mode as basicMode,
  modeInstance as basicModeInstance,
  extensionDependencies as basicExtensionDependencies,
  toolbarButtons,
  initToolGroups,
} from '@ohif/mode-basic';

export const extensionDependencies = {
  ...basicExtensionDependencies,
  '@ohif/extension-imaging-platform': '^3.0.0',
};

export const modeInstance = {
  ...basicModeInstance,
  id,
  routeName: 'imaging-platform',
  hide: false,
  displayName: i18n.t('Modes:AxialScope'),
  extensions: extensionDependencies,
};

export const mode = {
  ...basicMode,
  id,
  modeInstance,
  extensionDependencies,
};

export default mode;
export { toolbarButtons, initToolGroups };
