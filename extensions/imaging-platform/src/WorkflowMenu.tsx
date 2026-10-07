import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSystem } from '@ohif/core';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icons,
} from '@ohif/ui-next';
import i18n from '@ohif/i18n';
import { validWorkflows, workflowToOpen } from './workflows';

/** Modalities across the opened studies ("CT\\PT"), from the series list (includes SM slides). */
async function studyModalities(dataSource, studyUids: string[]) {
  const series = (
    await Promise.all(studyUids.map(uid => dataSource.query.series.search(uid)))
  ).flat();
  return [...new Set(series.map(s => s.modality).filter(Boolean))].join('\\');
}

/**
 * Measurements and segmentations live in this workflow only; switching starts a fresh one, so
 * ask first instead of discarding them silently.
 */
function confirmUnsavedWork({ measurementService, segmentationService }) {
  const measurements = measurementService?.getMeasurements?.().length ?? 0;
  const segmentations = segmentationService?.getSegmentations?.().length ?? 0;
  if (!measurements && !segmentations) {
    return true;
  }
  return window.confirm(
    i18n.t(
      'Modes:Switching workflow closes this one. Its measurements and segmentations will not carry over. Continue?'
    )
  );
}

/**
 * Fork: header menu of the workflows that fit the open study (standard reading, slide viewer,
 * PET/CT tumor volume, ...), shown when there is more than one. A workflow that cannot show
 * the study switches to the first one that can (slides opened in the standard viewer).
 */
export default function WorkflowMenu() {
  const { extensionManager, servicesManager } = useSystem();
  const location = useLocation();
  const navigate = useNavigate();
  const [modalities, setModalities] = useState<string | null>(null);

  const query = new URLSearchParams(location.search);
  const studyUids = query
    .getAll('StudyInstanceUIDs')
    .flatMap(value => value.split(','))
    .filter(Boolean);
  const [, current, ...rest] = location.pathname.split('/');

  useEffect(() => {
    const dataSource = extensionManager.getActiveDataSource()?.[0];
    if (!dataSource || !studyUids.length) {
      return;
    }
    let cancelled = false;
    studyModalities(dataSource, studyUids)
      .then(found => !cancelled && setModalities(found))
      .catch(() => {}); // no menu if the PACS cannot be asked; the viewer still works
    return () => {
      cancelled = true;
    };
  }, [location.search]);

  const choices = modalities
    ? validWorkflows((extensionManager as any)._appConfig?.loadedModes ?? [], modalities)
    : [];
  const go = (route: string, replace = false) =>
    navigate(`/${[route, ...rest].join('/')}${location.search}`, { replace });

  useEffect(() => {
    const target = workflowToOpen(current, choices);
    if (target) {
      go(target, true);
    }
  }, [modalities, current]);

  if (choices.length < 2) {
    return null;
  }
  const active = choices.find(choice => choice.route === current);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          data-cy="workflow-menu"
          className="text-foreground/85 hover:bg-muted h-8 gap-1 !rounded-sm px-2 text-sm"
          title={i18n.t('Modes:Workflow')}
        >
          {active?.label ?? i18n.t('Modes:Workflow')}
          <Icons.ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {choices.map(choice => (
          <DropdownMenuItem
            key={choice.route}
            data-cy={`workflow-${choice.route}`}
            disabled={choice.route === current}
            onSelect={() => confirmUnsavedWork(servicesManager.services) && go(choice.route)}
          >
            {choice.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
