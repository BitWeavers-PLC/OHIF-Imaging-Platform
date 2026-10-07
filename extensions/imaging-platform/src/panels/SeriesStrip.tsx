import React from 'react';
import { useDrag } from 'react-dnd';
import { ChevronDown, ChevronRight, PanelLeftClose, User, Users } from 'lucide-react';
import i18n from '@ohif/i18n';
import { usePatientInfo } from '@ohif/extension-default';
import { useSystem } from '@ohif/core';

/**
 * Fork: compact vertical series strip (MedDream / Syngo style) replacing the OHIF study
 * browser view. All data, loading, drag-drop and double-click logic comes from
 * PanelStudyBrowser via props; this component only renders.
 */

// SR / SEG / RT etc. have no image: show a slim row instead of an empty tile.
const isNoImage = ds => ds.componentType === 'thumbnailNoImage';

function SeriesRow({ ds, isActive, onDoubleClick, ThumbnailMenuItems }) {
  const [, drag] = useDrag({
    type: 'displayset',
    item: { type: 'displayset', displaySetInstanceUID: ds.displaySetInstanceUID },
  });
  return (
    <div
      ref={drag}
      id={`thumbnail-${ds.displaySetInstanceUID}`}
      data-cy="series-row"
      data-active={isActive}
      title={ds.description}
      className={`group col-span-full flex cursor-pointer select-none items-center gap-1 border px-1 py-0.5 ${
        isActive ? 'border-primary' : 'border-border hover:border-muted-foreground'
      }`}
      onDoubleClick={() => onDoubleClick(ds.displaySetInstanceUID)}
    >
      <span className="text-muted-foreground w-9 shrink-0">{ds.modality}</span>
      <span className="min-w-0 flex-1 truncate text-white">{ds.description || '-'}</span>
      {ThumbnailMenuItems && (
        <ThumbnailMenuItems displaySetInstanceUID={ds.displaySetInstanceUID} />
      )}
    </div>
  );
}

function SeriesTile({ ds, isActive, onDoubleClick, onClickUntrack, ThumbnailMenuItems }) {
  const [, drag] = useDrag({
    type: 'displayset',
    item: { type: 'displayset', displaySetInstanceUID: ds.displaySetInstanceUID },
  });

  return (
    <div
      ref={drag}
      id={`thumbnail-${ds.displaySetInstanceUID}`}
      data-cy="series-tile"
      data-active={isActive}
      title={ds.description}
      className={`group relative aspect-square w-full cursor-pointer select-none overflow-hidden border bg-black ${
        isActive ? 'border-primary border-2' : 'border-border hover:border-muted-foreground'
      }`}
      onDoubleClick={() => onDoubleClick(ds.displaySetInstanceUID)}
    >
      {ds.imageSrc ? (
        <img
          src={ds.imageSrc}
          alt=""
          draggable={false}
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="text-muted-foreground flex h-full items-center justify-center text-lg">
          {ds.modality}
        </div>
      )}
      <div className="absolute inset-x-0 top-0 flex justify-between bg-black/60 px-1 text-[11px] leading-4 text-white">
        <span>
          S{ds.seriesNumber ?? '-'} {ds.modality}
        </span>
        <span>{ds.numInstances ?? ''}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1 text-[11px] leading-4 text-white">
        {ds.description || ' '}
      </div>
      {ds.isTracked && (
        <button
          type="button"
          title="Tracked: click to untrack"
          className="bg-primary absolute left-1 top-5 h-2 w-2"
          onClick={e => {
            e.stopPropagation();
            onClickUntrack(ds.displaySetInstanceUID);
          }}
        />
      )}
      {ThumbnailMenuItems && (
        <div className="absolute right-0 top-4">
          <ThumbnailMenuItems displaySetInstanceUID={ds.displaySetInstanceUID} />
        </div>
      )}
    </div>
  );
}

/** "ID · 65Y M · DOB", leaving out whatever the study does not have. */
export function patientDetails({ PatientID, PatientAge, PatientSex, PatientDOB }) {
  return [PatientID, [PatientAge, PatientSex].filter(Boolean).join(' '), PatientDOB]
    .filter(Boolean)
    .join(' · ');
}

/**
 * Fork: patient banner at the head of the study list (was in the toolbar header). The images
 * keep the name in their corner text, so the patient stays identifiable with this panel closed.
 */
/** Fork: hides the series panel (it has no header row; the toolbar's edge button reopens it). */
function CollapseButton() {
  const { panelService } = useSystem().servicesManager.services;
  return (
    <button
      type="button"
      data-cy="series-panel-collapse"
      title={i18n.t('Common:Hide series')}
      aria-label={i18n.t('Common:Hide series')}
      className="text-muted-foreground hover:text-foreground hover:bg-muted ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-sm"
      onClick={() => {
        const panelId = panelService.getOpenPanel('left');
        if (panelId) {
          panelService.togglePanel(panelId);
        }
      }}
    >
      <PanelLeftClose
        className="h-4 w-4"
        strokeWidth={1.5}
      />
    </button>
  );
}

/**
 * Fork: patient banner at the head of the study list (was in the toolbar header), with the
 * panel's collapse button. The images keep the name in their corner text, so the patient stays
 * identifiable with this panel closed.
 */
export function PatientBanner() {
  const { patientInfo, isMixedPatients } = usePatientInfo();
  const { PatientName, PatientID } = patientInfo;
  const hasPatient = Boolean(PatientName || PatientID);
  const details = patientDetails(patientInfo);
  const Icon = isMixedPatients ? Users : User;
  return (
    <div
      data-cy="patient-banner"
      className="bg-card border-background flex shrink-0 items-center gap-2 border-b-2 px-2 py-1.5"
      title={hasPatient ? [PatientName, details].filter(Boolean).join('\n') : undefined}
    >
      {hasPatient && (
        <>
          <Icon
            className={`h-4 w-4 shrink-0 ${isMixedPatients ? 'text-[hsl(var(--warning-text))]' : 'text-primary'}`}
            strokeWidth={1.5}
          />
          <div className="min-w-0">
            <div className="text-foreground truncate text-[13px] font-semibold">
              {isMixedPatients
                ? i18n.t('Common:Multiple patients loaded')
                : PatientName || PatientID}
            </div>
            {!isMixedPatients && (
              <div className="text-muted-foreground truncate text-[11px]">{details}</div>
            )}
          </div>
        </>
      )}
      <CollapseButton />
    </div>
  );
}

export default function SeriesStrip({
  tabs,
  expandedStudyInstanceUIDs = [],
  primaryStudyInstanceUIDs = [],
  onClickStudy,
  onClickUntrack = () => {},
  onDoubleClickThumbnail,
  activeDisplaySetInstanceUIDs = [],
  StudyMenuItems,
  ThumbnailMenuItems,
}) {
  // One flat list: current study first, then priors (no Primary/Recent/All tabs).
  const studies = tabs?.find(tab => tab.name === 'all')?.studies || tabs?.[0]?.studies || [];
  const ordered = [
    ...studies.filter(s => primaryStudyInstanceUIDs.includes(s.studyInstanceUid)),
    ...studies.filter(s => !primaryStudyInstanceUIDs.includes(s.studyInstanceUid)),
  ];

  return (
    <div
      className="bg-background ohif-scrollbar flex h-full flex-col gap-px overflow-y-auto text-xs"
      data-cy="series-strip"
    >
      <PatientBanner />
      {ordered.map(study => {
        const isExpanded = expandedStudyInstanceUIDs.includes(study.studyInstanceUid);
        const isPrior = !primaryStudyInstanceUIDs.includes(study.studyInstanceUid);
        const Chevron = isExpanded ? ChevronDown : ChevronRight;
        return (
          <section key={study.studyInstanceUid}>
            <div
              role="button"
              data-cy="study-header"
              className="bg-card hover:bg-muted group flex cursor-pointer items-center gap-1 px-1.5 py-1"
              onClick={() => onClickStudy(study.studyInstanceUid)}
            >
              <Chevron
                className="text-muted-foreground h-3.5 w-3.5 shrink-0"
                strokeWidth={1.5}
              />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-1 text-white">
                  <span className="truncate">{study.date}</span>
                  <span className="text-muted-foreground shrink-0">{study.modalities}</span>
                </div>
                <div className="text-muted-foreground truncate">
                  {isPrior ? 'Prior · ' : ''}
                  {study.description || 'No description'}
                </div>
              </div>
              {StudyMenuItems && <StudyMenuItems StudyInstanceUID={study.studyInstanceUid} />}
            </div>
            {isExpanded && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-1 p-1">
                {study.displaySets?.map(ds => {
                  const Item = isNoImage(ds) ? SeriesRow : SeriesTile;
                  return (
                    <Item
                      key={ds.displaySetInstanceUID}
                      ds={ds}
                      isActive={activeDisplaySetInstanceUIDs?.includes(ds.displaySetInstanceUID)}
                      onDoubleClick={onDoubleClickThumbnail}
                      onClickUntrack={onClickUntrack}
                      ThumbnailMenuItems={ThumbnailMenuItems}
                    />
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
