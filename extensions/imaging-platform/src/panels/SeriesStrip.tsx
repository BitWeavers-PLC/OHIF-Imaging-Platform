import React from 'react';
import { useDrag } from 'react-dnd';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
