import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button, Header, Icons } from '@ohif/ui-next';
import { useSystem } from '@ohif/core';
import { Toolbar } from '../Toolbar/Toolbar';
import HeaderPatientInfo from './HeaderPatientInfo';
import { PatientInfoVisibility } from './HeaderPatientInfo/HeaderPatientInfo';
import useOpenSettings from './useOpenSettings';
import { preserveQueryParameters } from '@ohif/app';

function ViewerHeader({
  appConfig,
  hasLeftPanel = false,
}: withAppTypes<{ appConfig: AppTypes.Config; hasLeftPanel?: boolean }>) {
  const { servicesManager, extensionManager, commandsManager } = useSystem();
  // Fork: optional workflow switcher supplied by an extension (imaging-platform WorkflowMenu).
  const WorkflowMenu = servicesManager.services.customizationService.getCustomization(
    'viewerHeader.workflowMenu'
  ) as React.ComponentType | undefined;

  const navigate = useNavigate();
  const location = useLocation();

  const onClickReturnButton = () => {
    const { pathname } = location;
    const dataSourceIdx = pathname.indexOf('/', 1);

    const dataSourceName = pathname.substring(dataSourceIdx + 1);
    const existingDataSource = extensionManager.getDataSources(dataSourceName);

    const searchQuery = new URLSearchParams();
    if (dataSourceIdx !== -1 && existingDataSource) {
      searchQuery.append('datasources', pathname.substring(dataSourceIdx + 1));
    }
    preserveQueryParameters(searchQuery);

    navigate({
      pathname: '/',
      search: decodeURIComponent(searchQuery.toString()),
    });
  };

  const { t } = useTranslation();
  const settings = useOpenSettings();
  const viewerConfig = appConfig.imagingPlatform?.viewer ?? {};
  const undoRedoPlacement =
    viewerConfig.undoRedoPlacement ?? appConfig.undoRedoPlacement ?? 'toolbar-responsive';

  // Fork: settings live at the bottom of the left panel; here only when there is none.
  const menuOptions = !hasLeftPanel
    ? [{ title: settings.title, icon: 'settings', onClick: settings.open }]
    : [];

  if (appConfig.oidc) {
    menuOptions.push({
      title: t('Header:Logout'),
      icon: 'power-off',
      onClick: async () => {
        navigate(`/logout?redirect_uri=${encodeURIComponent(window.location.href)}`);
      },
    });
  }

  return (
    <Header
      menuOptions={menuOptions}
      Workflow={WorkflowMenu ? <WorkflowMenu /> : null}
      isReturnEnabled={!!appConfig.showStudyList}
      onClickReturnButton={onClickReturnButton}
      WhiteLabeling={appConfig.whiteLabeling}
      Secondary={<Toolbar buttonSection="secondary" />}
      // Fork: with a left panel the patient banner heads the study list instead.
      PatientInfo={
        !hasLeftPanel &&
        appConfig.showPatientInfo !== PatientInfoVisibility.DISABLED && (
          <HeaderPatientInfo
            servicesManager={servicesManager}
            appConfig={appConfig}
          />
        )
      }
      UndoRedo={
        undoRedoPlacement === 'header-fixed' ? (
          <div className="text-primary flex cursor-pointer items-center">
            <Button
              variant="ghost"
              className="hover:bg-muted"
              onClick={() => {
                commandsManager.run('undo');
              }}
            >
              <Icons.Undo className="" />
            </Button>
            <Button
              variant="ghost"
              className="hover:bg-muted"
              onClick={() => {
                commandsManager.run('redo');
              }}
            >
              <Icons.Redo className="" />
            </Button>
          </div>
        ) : null
      }
    >
      <div className="relative flex w-full justify-start gap-[2px] overflow-hidden">
        <Toolbar buttonSection="primary" />
      </div>
    </Header>
  );
}

export default ViewerHeader;
