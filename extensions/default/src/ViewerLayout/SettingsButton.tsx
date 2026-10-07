import React from 'react';
import { Button, Icons } from '@ohif/ui-next';
import useOpenSettings from './useOpenSettings';

/** Fork: settings gear at the bottom left (left panel footer), as in most desktop viewers. */
export default function SettingsButton() {
  const settings = useOpenSettings();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-foreground hover:bg-muted h-6 w-6 !rounded-sm"
      title={settings.title}
      aria-label={settings.title}
      data-cy="settings-button"
      onClick={settings.open}
    >
      <Icons.GearSettings className="h-[18px] w-[18px]" />
    </Button>
  );
}
