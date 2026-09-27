import React from 'react';
import { Button } from '@ohif/ui-next';
import i18n from 'i18next';

type Choice = { label: string; onSelect: () => void };

/** Fork: pick what to subtract from the active series (post − pre). */
export default function SubtractionDialog({
  choices,
  hide,
}: {
  choices: Choice[];
  hide: () => void;
}) {
  if (!choices.length) {
    return (
      <p className="text-foreground p-2 text-base">
        {i18n.t(
          'Messages:No series of this study has the same slices as this one, so nothing can be subtracted.'
        )}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2 p-2">
      <p className="text-muted-foreground text-sm">
        {i18n.t('Messages:Subtract from the series in the active viewport:')}
      </p>
      {choices.map(choice => (
        <Button
          key={choice.label}
          variant="secondary"
          className="justify-start !rounded-sm"
          onClick={() => {
            hide();
            choice.onSelect();
          }}
        >
          {choice.label}
        </Button>
      ))}
    </div>
  );
}
