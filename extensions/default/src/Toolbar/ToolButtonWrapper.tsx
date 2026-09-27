import React from 'react';
import { useIconPresentation, Icons, Button } from '@ohif/ui-next';
import { useSystem } from '@ohif/core';
import getShortcut from './getShortcut';

export default function ToolButtonWrapper(props) {
  const { IconContainer, containerProps } = useIconPresentation();
  const { hotkeysManager } = useSystem();
  const shortcut = getShortcut(hotkeysManager?.hotkeyDefinitions, props);

  const Icon = <Icons.ByName name={props.icon} />;

  return (
    <div>
      {IconContainer ? (
        <IconContainer
          disabled={props.disabled}
          shortcut={shortcut}
          {...props}
          {...containerProps}
        >
          {Icon}
        </IconContainer>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          disabled={props.disabled}
        >
          {Icon}
        </Button>
      )}
    </div>
  );
}

export { ToolButtonWrapper };
