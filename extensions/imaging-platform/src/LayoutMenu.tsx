import React, { useState } from 'react';
import { Icons, LayoutSelector, useHoverMenu } from '@ohif/ui-next';
import i18n from '@ohif/i18n';

type Preset = {
  title: string;
  icon: string;
  commandOptions: { protocolId: string };
  disabled?: boolean;
};

// Our names for the reconstruction layouts (OHIF: "3D four up", "Axial Primary", "Frame View"…).
const NAMES: Record<string, string> = {
  mpr: 'MPR (3 planes)',
  mip: 'MIP + MPR',
  fourUp: '3D + MPR',
  main3D: '3D large, MPR below',
  primaryAxial: 'Axial large, MPR right',
  only3D: '3D',
  primary3D: '3D large, MPR right',
  '@ohif/frameView': 'All images',
};

/** Layouts the current series can open, under our names; ones it can't open are left out. */
export function layoutChoices(presets: Preset[]) {
  return presets
    .filter(preset => !preset.disabled)
    .map(preset => {
      const name = NAMES[preset.commandOptions.protocolId];
      return { ...preset, title: name ? i18n.t(`ToolbarLayoutSelector:${name}`) : preset.title };
    });
}

const ROWS = 4;
const COLUMNS = 4;

/**
 * Fork: layout menu in RadiAnt's shape: a viewport grid you size by hovering (with the size
 * shown), then the reconstruction layouts as a plain list. Replaces OHIF's
 * "Common / Advanced / Custom" panel.
 */
export default function LayoutMenu({ commandsManager, servicesManager }) {
  // Opens on hover like the other toolbar menus; a click still toggles it.
  const { open, setOpen, hoverProps } = useHoverMenu();
  const [hover, setHover] = useState<[number, number] | null>(null);
  const generator = servicesManager.services.customizationService.getCustomization(
    'layoutSelector.advancedPresetGenerator'
  );
  const choices = open && generator ? layoutChoices(generator({ servicesManager })) : [];

  const run = (commandName: string, commandOptions: object) => {
    setOpen(false);
    commandsManager.run({ commandName, commandOptions });
  };

  return (
    <div
      id="Layout"
      data-cy="Layout"
      {...hoverProps}
    >
      <LayoutSelector
        open={open}
        onOpenChange={setOpen}
      >
        <LayoutSelector.Trigger
          tooltip={i18n.t('ToolbarLayoutSelector:Viewports and layouts')}
          caption={i18n.t('Buttons:Layout')}
        />
        <LayoutSelector.Content>
          <div
            className="bg-popover flex w-56 flex-col gap-2 p-2"
            {...hoverProps}
          >
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-muted-foreground">
                {i18n.t('ToolbarLayoutSelector:Viewports')}
              </span>
              <span className="text-foreground tabular-nums">
                {hover ? `${hover[0]} × ${hover[1]}` : ''}
              </span>
            </div>
            <div
              className="grid gap-[3px]"
              style={{ gridTemplateColumns: `repeat(${COLUMNS}, 1fr)` }}
              onMouseLeave={() => setHover(null)}
            >
              {Array.from({ length: ROWS * COLUMNS }, (_, index) => {
                const row = Math.floor(index / COLUMNS) + 1;
                const col = (index % COLUMNS) + 1;
                const lit = hover && row <= hover[0] && col <= hover[1];
                return (
                  <button
                    key={index}
                    type="button"
                    aria-label={`${row} × ${col}`}
                    data-cy={`Layout-${col - 1}-${row - 1}`}
                    className={`h-6 rounded-sm border ${
                      lit ? 'border-primary bg-primary/40' : 'border-border bg-muted'
                    }`}
                    onMouseEnter={() => setHover([row, col])}
                    onClick={() => run('setViewportGridLayout', { numRows: row, numCols: col })}
                  />
                );
              })}
            </div>
            {choices.length > 0 && (
              <>
                <div className="bg-border my-1 h-px" />
                <div className="text-muted-foreground text-xs">
                  {i18n.t('ToolbarLayoutSelector:Reconstruction')}
                </div>
                {choices.map(choice => (
                  <button
                    key={choice.commandOptions.protocolId}
                    type="button"
                    data-cy={choice.commandOptions.protocolId}
                    className="hover:bg-accent group flex items-center gap-2 rounded-sm px-1.5 py-1 text-left text-sm"
                    onClick={() => {
                      // Same as the MPR/MIP buttons: open at the level being read.
                      commandsManager.run('openAtReadingPosition');
                      run('setHangingProtocol', choice.commandOptions);
                    }}
                  >
                    <Icons.ByName
                      name={choice.icon}
                      className="group-hover:text-primary h-5 w-5 shrink-0"
                    />
                    <span className="text-foreground">{choice.title}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </LayoutSelector.Content>
      </LayoutSelector>
    </div>
  );
}
