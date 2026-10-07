import React, { useEffect, useReducer } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import i18n from '@ohif/i18n';

type Stage = { name?: string; status?: string };

/** Stages the reader can switch to, and where the current one sits among them. */
export function stagePosition(stages: Stage[] = [], stageIndex: number) {
  const usable = stages
    .map((stage, index) => ({ stage, index }))
    .filter(({ stage }) => stage.status !== 'disabled');
  return { usable, position: usable.findIndex(({ index }) => index === stageIndex) };
}

/**
 * Fork: a slim strip above the views when the opening layout has more than one stage (compare
 * one/two series each, MR grid sizes, ...), so its other arrangements are one click away.
 * Keys: "," previous, "." next.
 */
export default function StageBar({ servicesManager, commandsManager }) {
  const { hangingProtocolService } = servicesManager.services;
  const [, refresh] = useReducer(count => count + 1, 0);

  useEffect(() => {
    const { EVENTS } = hangingProtocolService;
    const subscriptions = [EVENTS.PROTOCOL_CHANGED, EVENTS.STAGE_ACTIVATION, EVENTS.NEW_LAYOUT].map(
      event => hangingProtocolService.subscribe(event, refresh)
    );
    return () => subscriptions.forEach(subscription => subscription.unsubscribe());
  }, [hangingProtocolService]);

  const { protocol, stageIndex } = hangingProtocolService.getActiveProtocol();
  const { usable, position } = stagePosition(protocol?.stages, stageIndex);
  if (usable.length < 2 || position === -1) {
    return null;
  }

  const step = (direction: number) =>
    commandsManager.run(direction > 0 ? 'nextStage' : 'previousStage');
  const arrow =
    'text-foreground/80 hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent flex h-6 w-6 items-center justify-center rounded-sm';

  return (
    <div
      data-cy="stage-bar"
      className="bg-popover text-foreground/85 flex h-7 shrink-0 items-center gap-1 px-2 text-xs"
    >
      <button
        type="button"
        className={arrow}
        disabled={position === 0}
        title={`${i18n.t('Common:Previous layout')}  ,`}
        aria-label={i18n.t('Common:Previous layout')}
        onClick={() => step(-1)}
      >
        <ChevronLeft
          className="h-4 w-4"
          strokeWidth={1.5}
        />
      </button>
      <span className="text-muted-foreground tabular-nums">
        {i18n.t('Common:Layout')} {position + 1}/{usable.length}
      </span>
      <span className="truncate">{usable[position].stage.name}</span>
      <button
        type="button"
        className={arrow}
        disabled={position === usable.length - 1}
        title={`${i18n.t('Common:Next layout')}  .`}
        aria-label={i18n.t('Common:Next layout')}
        onClick={() => step(1)}
      >
        <ChevronRight
          className="h-4 w-4"
          strokeWidth={1.5}
        />
      </button>
    </div>
  );
}
