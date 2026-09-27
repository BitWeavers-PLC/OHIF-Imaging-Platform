import radiantHotkeys from './radiantHotkeys';
import SettingsDialog from './panels/SettingsDialog';

const appConfig = (window as any)?.config ?? {};
const productConfig = appConfig.imagingPlatform ?? {};
const productBrand = productConfig.brand ?? appConfig.brand ?? {};

export default function getCustomizationModule() {
  return [
    {
      name: 'imagingPlatform',
      value: {
        'imagingPlatform.brand.appName': productBrand.appName || 'AxialScope',
      },
    },
    {
      name: 'default',
      value: {
        // No onboarding tour: it is recognisably OHIF.
        'ohif.tours': { $set: [] },
        // RadiAnt keymap instead of the stock one.
        'ohif.hotkeyBindings': { $set: radiantHotkeys },
        // Settings dialog (gear menu) with sections instead of the flat preferences list.
        'ohif.userPreferencesModal': { $set: SettingsDialog },
      },
    },
  ];
}
