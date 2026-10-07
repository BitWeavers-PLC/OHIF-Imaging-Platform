import React from 'react';
import {
  Button,
  Icons,
  useHoverMenu,
  ToolButtonList,
  ToolButton,
  ToolButtonListDefault,
  ToolButtonListDropDown,
  ToolButtonListItem,
} from '@ohif/ui-next';
import { useToolbar, useSystem } from '@ohif/core/src';
import i18n from '@ohif/i18n';
import getShortcut from './getShortcut';

const HOVER_LISTS = ['WindowLevelTools', 'MeasurementTools', 'SlabTools'];

interface ToolButtonListWrapperProps {
  buttonSection: string;
  onInteraction?: (details: { itemId: string; commands?: Record<string, unknown> }) => void;
  id: string;
  overflowItems?: Array<{
    id: string;
    icon?: string;
    label?: string;
    tooltip?: string;
    commands?: Record<string, unknown>;
    disabled?: boolean;
    disabledText?: string;
    isActive?: boolean;
  }>;
}

/**
 * Wraps the ToolButtonList component to handle the OHIF toolbar button structure
 * @param props - Component props
 * @returns Component
 * // test
 */
export default function ToolButtonListWrapper({
  buttonSection,
  id,
  overflowItems = [],
}: ToolButtonListWrapperProps) {
  const appConfig = (window as any)?.config ?? {};
  const productConfig = appConfig.imagingPlatform ?? {};
  const toolbarConfig = productConfig.toolbar ?? {};
  const moreAlwaysVisible =
    (toolbarConfig.alwaysShowMore ?? appConfig.toolbarMoreAlwaysVisible) !== false;
  const isMoreTools = id === 'MoreTools';
  const { onInteraction, toolbarButtons } = useToolbar({
    buttonSection,
  });
  const { hotkeysManager } = useSystem();
  const shortcutOf = item => getShortcut(hotkeysManager?.hotkeyDefinitions, item);

  // Fork: toolbar lists open when the mouse rests on them (useHoverMenu), non-modal so the
  // toolbar stays clickable, and without the split arrow. A list's button still runs its tool
  // on click (W/L, measurement, slab); More has no tool, so a click toggles the list.
  const opensOnHover = isMoreTools || HOVER_LISTS.includes(id);
  const { open: hoverOpen, setOpen: setHoverOpen, hoverProps } = useHoverMenu();
  const hover = opensOnHover ? hoverProps : {};

  if (!toolbarButtons?.length && !(isMoreTools && moreAlwaysVisible)) {
    return null;
  }

  const fallbackMorePrimary = {
    id: 'MoreTools',
    icon: 'tool-more-menu',
    label: i18n.t('Buttons:More'),
    isActive: false,
  };

  const primary = isMoreTools
    ? fallbackMorePrimary
    : toolbarButtons.find(button => button.componentProps.isActive)?.componentProps ||
      toolbarButtons[0]?.componentProps;

  const items = (toolbarButtons || []).map(button => button.componentProps);
  const mergedItems = [...items, ...overflowItems].filter(
    (item, index, array) => array.findIndex(candidate => candidate.id === item.id) === index
  );

  const menuItems = (
    <div {...hover}>
      {mergedItems.length ? (
        mergedItems.map(item => (
          <ToolButtonListItem
            key={item.id}
            {...item}
            data-cy={item.id}
            data-tool={item.id}
            data-active={item.isActive}
            onSelect={() => onInteraction?.({ id, itemId: item.id, commands: item.commands })}
          >
            {/* Text-only items (e.g. W/L presets) line up with the ones that have an icon. */}
            <span className={item.icon ? 'pl-1' : 'pl-9'}>
              {item.label || item.tooltip || item.id}
            </span>
            {shortcutOf(item) && (
              <kbd className="text-muted-foreground !ml-auto pl-6 font-mono text-xs">
                {shortcutOf(item)}
              </kbd>
            )}
          </ToolButtonListItem>
        ))
      ) : (
        <ToolButtonListItem
          key="no-more-tools"
          disabled
        >
          <span className="pl-1">{i18n.t('Buttons:No additional tools')}</span>
        </ToolButtonListItem>
      )}
    </div>
  );

  // Fork: More is a single ••• button that opens the list (hover or click): no split arrow.
  if (isMoreTools) {
    return (
      <div
        data-cy={`${id}-split-button-primary`}
        data-tool={primary.id}
        {...hover}
      >
        <ToolButtonListDropDown
          open={hoverOpen}
          onOpenChange={setHoverOpen}
          modal={false}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              aria-label={primary.label}
              className="text-foreground/80 hover:bg-background h-9 w-9 !rounded-sm"
            >
              <Icons.ByName
                name={primary.icon}
                className="h-6 w-6"
              />
            </Button>
          }
        >
          {menuItems}
        </ToolButtonListDropDown>
      </div>
    );
  }

  if (opensOnHover) {
    return (
      <div
        className="relative"
        data-cy={`${id}-split-button-primary`}
        data-tool={primary.id}
        data-active={primary.isActive}
        {...hover}
      >
        <ToolButton
          {...primary}
          // The open list explains the tools; the button's tooltip would cover its first item.
          hideTooltip={hoverOpen}
          shortcut={shortcutOf(primary)}
          onInteraction={({ itemId }) =>
            onInteraction?.({ id, itemId, commands: primary.commands })
          }
          className={primary.className}
        />
        <ToolButtonListDropDown
          open={hoverOpen}
          onOpenChange={setHoverOpen}
          modal={false}
          trigger={
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
            />
          }
        >
          {menuItems}
        </ToolButtonListDropDown>
      </div>
    );
  }

  return (
    <ToolButtonList
      className={
        primary.isActive ? 'bg-primary text-primary-foreground hover:bg-primary/90' : undefined
      }
    >
      <ToolButtonListDefault>
        <div
          data-cy={`${id}-split-button-primary`}
          data-tool={primary.id}
          data-active={primary.isActive}
        >
          <ToolButton
            {...primary}
            shortcut={shortcutOf(primary)}
            onInteraction={({ itemId }) =>
              onInteraction?.({ id, itemId, commands: primary.commands })
            }
            className={primary.className}
          />
        </div>
      </ToolButtonListDefault>
      <div data-cy={`${id}-split-button-secondary`}>
        <ToolButtonListDropDown>{menuItems}</ToolButtonListDropDown>
      </div>
    </ToolButtonList>
  );
}
