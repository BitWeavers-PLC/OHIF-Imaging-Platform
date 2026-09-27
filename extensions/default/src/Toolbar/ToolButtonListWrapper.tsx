import React from 'react';
import {
  ToolButtonList,
  ToolButton,
  ToolButtonListDefault,
  ToolButtonListDropDown,
  ToolButtonListItem,
} from '@ohif/ui-next';
import { useToolbar, useSystem } from '@ohif/core/src';
import i18n from '@ohif/i18n';
import getShortcut from './getShortcut';

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
        <ToolButtonListDropDown>
          {mergedItems.length ? (
            mergedItems.map(item => {
              return (
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
              );
            })
          ) : (
            <ToolButtonListItem
              key="no-more-tools"
              disabled
            >
              <span className="pl-1">{i18n.t('Buttons:No additional tools')}</span>
            </ToolButtonListItem>
          )}
        </ToolButtonListDropDown>
      </div>
    </ToolButtonList>
  );
}
