import React from 'react';
import classNames from 'classnames';
import { ToolButton } from '@ohif/ui-next';
import { useToolbar } from '@ohif/core/src/hooks/useToolbar';

/**
 * Wraps the ToolButtonList component to handle the OHIF toolbar button structure
 * @param props - Component props
 * @returns Component
 */
export function ToolBoxButtonGroupWrapper({ buttonSection, id }) {
  const { onInteraction, toolbarButtons } = useToolbar({
    buttonSection,
  });

  if (!buttonSection) {
    return null;
  }

  const items = toolbarButtons.map(button => button.componentProps);

  return (
    // Fork: square bordered tool buttons in the segmentation toolbox, no rounded pill group.
    <div className="flex flex-row gap-1">
      {items.map(item => (
        <ToolButton
          {...item}
          key={item.id}
          size="small"
          className={classNames('border-border border', item.disabled && 'text-foreground/70')}
          onInteraction={event => {
            onInteraction?.({
              event,
              id,
              commands: item.commands,
              itemId: item.id,
              item,
            });
          }}
        />
      ))}
    </div>
  );
}

export function ToolBoxButtonWrapper({ onInteraction, className, options, ...props }) {
  return (
    <div className="flex flex-row">
      <ToolButton
        {...props}
        id={props.id}
        size="small"
        className={classNames(
          'border-border border',
          props.disabled && 'text-foreground/70',
          className
        )}
        onInteraction={event => {
          onInteraction?.({
            event,
            itemId: props.id,
            commands: props.commands,
            options,
          });
        }}
      />
    </div>
  );
}
