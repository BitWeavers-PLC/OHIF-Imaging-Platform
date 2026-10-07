import React from 'react';
import { Button, Icons } from '@ohif/ui-next';
import { useSystem } from '@ohif/core';
import { useTranslation } from 'react-i18next';

export function StudyMeasurementsActions({ items, StudyInstanceUID, measurementFilter, actions }) {
  const { commandsManager } = useSystem();
  const { t } = useTranslation('MeasurementTable');
  const disabled = !items?.length;
  // Fork: hide SR save when the PACS route is read-only (no STOW).
  const allowSRSave = (window as any).config?.imagingPlatform?.viewer?.allowSRSave !== false;

  if (disabled) {
    return null;
  }

  const stop = (run: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    run();
  };
  const iconButton = (title: string, icon: React.ReactNode, run: () => void) => (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 w-7 !rounded-sm p-0"
      title={title}
      aria-label={title}
      onClick={stop(run)}
    >
      {icon}
    </Button>
  );

  // Fork: one text action (copy findings for the report), the rest as icon buttons on the
  // right; OHIF's "CSV / Copy / Create SR / Delete" text row overflowed the panel.
  return (
    <div className="bg-background flex h-9 w-full items-center justify-between rounded px-1">
      <Button
        size="sm"
        variant="ghost"
        className="h-7 gap-1.5 !rounded-sm px-1.5"
        title={t('Copy findings to paste into the report')}
        onClick={stop(() =>
          commandsManager.runCommand('copyMeasurementsToClipboard', { measurementFilter })
        )}
      >
        <Icons.Copy className="h-4 w-4" />
        <span>{t('Copy findings')}</span>
      </Button>
      <div className="flex items-center gap-0.5">
        {iconButton(t('Download CSV'), <Icons.Download className="h-4 w-4" />, () =>
          commandsManager.runCommand('downloadCSVMeasurementsReport', {
            StudyInstanceUID,
            measurementFilter,
          })
        )}
        {allowSRSave &&
          iconButton(t('Save as structured report'), <Icons.Export className="h-4 w-4" />, () =>
            actions?.createSR
              ? actions.createSR({ StudyInstanceUID, measurementFilter })
              : commandsManager.run('promptSaveReport', { StudyInstanceUID, measurementFilter })
          )}
        {iconButton(t('Delete all measurements'), <Icons.Delete className="h-4 w-4" />, () =>
          actions?.onDelete
            ? actions.onDelete()
            : commandsManager.runCommand('clearMeasurements', { measurementFilter })
        )}
      </div>
    </div>
  );
}

export default StudyMeasurementsActions;
