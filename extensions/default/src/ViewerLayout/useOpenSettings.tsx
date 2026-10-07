import { useTranslation } from 'react-i18next';
import { useModal } from '@ohif/ui-next';
import { useSystem, Types } from '@ohif/core';

/** Opens the settings (user preferences) dialog. Shared by the header and the left panel. */
export default function useOpenSettings() {
  const { servicesManager } = useSystem();
  const { t } = useTranslation();
  const { show } = useModal();
  const SettingsModal = servicesManager.services.customizationService.getCustomization(
    'ohif.userPreferencesModal'
  ) as Types.MenuComponentCustomization;

  return {
    title: SettingsModal.menuTitle ?? t('Header:Preferences'),
    open: () =>
      show({
        content: SettingsModal,
        title: SettingsModal.title ?? t('UserPreferencesModal:User preferences'),
        containerClassName: SettingsModal?.containerClassName ?? 'flex max-w-4xl p-6 flex-col',
      }),
  };
}
