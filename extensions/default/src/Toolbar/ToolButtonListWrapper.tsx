import React from 'react';
import {
  ToolButtonList,
  ToolButton,
  ToolButtonListDefault,
  ToolButtonListDropDown,
  ToolButtonListItem,
  ToolButtonListDivider,
} from '@ohif/ui-next';
import { useToolbar } from '@ohif/core/src';

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

  if (!toolbarButtons?.length && !(isMoreTools && moreAlwaysVisible)) {
    return null;
  }

  const fallbackMorePrimary = {
    id: 'MoreTools',
    icon: 'tool-more-menu',
    label: 'More',
    tooltip: 'More',
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
    <ToolButtonList>
      <ToolButtonListDefault>
        <div
          data-cy={`${id}-split-button-primary`}
          data-tool={primary.id}
          data-active={primary.isActive}
        >
          <ToolButton
            {...primary}
            onInteraction={({ itemId }) =>
              onInteraction?.({ id, itemId, commands: primary.commands })
            }
            className={primary.className}
          />
        </div>
      </ToolButtonListDefault>
      <ToolButtonListDivider className={primary.isActive ? 'opacity-0' : 'opacity-100'} />
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
                  <span className="pl-1">{item.label || item.tooltip || item.id}</span>
                </ToolButtonListItem>
              );
            })
          ) : (
            <ToolButtonListItem
              key="no-more-tools"
              disabled
            >
              <span className="pl-1">No additional tools</span>
            </ToolButtonListItem>
          )}
        </ToolButtonListDropDown>
      </div>
    </ToolButtonList>
  );
}
