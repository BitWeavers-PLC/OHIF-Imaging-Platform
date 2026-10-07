import React, { useEffect, useReducer } from 'react';
import { ToolButton } from '@ohif/ui-next';
import i18n from '@ohif/i18n';

// Panel names too long to read under an icon.
const SHORT: Record<string, string> = {
  Segmentation: 'Segments',
  'Patient Info': 'Patient',
};

/** Short enough to read under an icon: the tab label, else the panel's icon label. */
export function panelCaption({ label, iconLabel }: { label?: string; iconLabel?: string }) {
  const name = label && label.length <= 9 ? label : iconLabel || label || '';
  return SHORT[name] ? i18n.t(`Common:${SHORT[name]}`) : name;
}

/**
 * Fork: one header button per right-hand panel (Paint, Outline, Measure, Curves, ...), as the
 * toolbar's last group. A button opens its panel, switches to it, or closes it when showing;
 * the closed right panel takes no width (no tab strip at the image edge).
 */
export default function PanelButtons({ servicesManager }) {
  const { panelService } = servicesManager.services;
  const [, refresh] = useReducer(count => count + 1, 0);

  useEffect(() => {
    const subscriptions = [
      panelService.EVENTS.PANELS_CHANGED,
      panelService.EVENTS.OPEN_PANEL_CHANGED,
    ].map(event => panelService.subscribe(event, refresh));
    return () => subscriptions.forEach(subscription => subscription.unsubscribe());
  }, [panelService]);

  const panels = panelService.getPanels('right');
  if (!panels.length) {
    return null;
  }
  const open = panelService.getOpenPanel('right');

  return (
    <div
      className="border-muted mx-1.5 flex flex-shrink-0 items-center gap-0.5 border-x px-1.5"
      data-cy="panel-buttons"
    >
      {panels.map(panel => (
        <ToolButton
          key={panel.id}
          id={panel.id}
          icon={panel.iconName}
          label={panel.label || panel.iconLabel}
          caption={panelCaption(panel)}
          isActive={open === panel.id}
          onInteraction={() => panelService.togglePanel(panel.id)}
        />
      ))}
    </div>
  );
}
