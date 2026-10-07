import i18n from '@ohif/i18n';
import radiantHotkeys from './radiantHotkeys';
import SettingsDialog from './panels/SettingsDialog';
import WorkflowMenu from './WorkflowMenu';

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
        // Header switcher between the workflows that fit the study (standard, slides, PET/CT…).
        'viewerHeader.workflowMenu': { $set: WorkflowMenu },
        // Right-click on a measurement: RadiAnt wording, label first (OHIF: "Delete measurement / Add Label").
        measurementsContextMenu: {
          $set: {
            inheritsFrom: 'ohif.contextMenu',
            menus: [
              {
                id: 'forExistingMeasurement',
                selector: ({ nearbyToolData }) => !!nearbyToolData,
                items: [
                  { label: i18n.t('Common:Edit label…'), commands: 'setMeasurementLabel' },
                  { label: i18n.t('Common:Delete'), commands: 'removeMeasurement' },
                ],
              },
            ],
          },
        },
      },
    },
  ];
}
