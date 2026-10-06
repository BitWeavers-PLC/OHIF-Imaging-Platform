import React, { useState } from 'react';
import { useSystem, hotkeys as hotkeysModule } from '@ohif/core';
import {
  FooterAction,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  UserPreferencesModal,
} from '@ohif/ui-next';
import ohifI18n from '@ohif/i18n';
import i18n from 'i18next';
import { groupHotkeys } from '../settingsGroups';

const t = (text: string) => i18n.t(`UserPreferencesModal:${text}`);

const SECTIONS = ['General', 'Mouse', 'Keyboard', 'About'] as const;
type Section = (typeof SECTIONS)[number];

// RadiAnt mouse map (modes/basic/src/initToolGroups.ts radiantActiveTools); reference only.
const MOUSE = [
  ['Left drag', 'Browse images (active tool)'],
  ['Middle drag', 'Window / level'],
  ['Right drag', 'Zoom (up = in)'],
  ['Left + right drag', 'Pan'],
  ['Back button drag', 'Pan'],
  ['Forward button drag', 'Length'],
  ['Wheel', 'Browse images'],
  ['Tilt wheel / sideways swipe', 'Previous / next series'],
  ['Ctrl + wheel', 'Zoom'],
  ['Ctrl + left drag', 'Window / level'],
  ['Shift + left drag', 'Pan'],
  ['Double-click', 'Maximize / restore viewport'],
  ['Right click on a measurement', 'Measurement menu'],
];

const appConfig = () => (window as any)?.config ?? {};

/**
 * Fork: Settings dialog (gear menu), replacing the flat Preferences list: General (language),
 * Mouse (reference), Keyboard (grouped, searchable shortcuts), About. Same save/reset logic as
 * extensions/default/src/customizations/userPreferencesCustomization.tsx.
 */
export default function SettingsDialog({ hide }: { hide: () => void }) {
  const { hotkeysManager } = useSystem();
  const { availableLanguages, defaultLanguage, currentLanguage } = ohifI18n;
  const [section, setSection] = useState<Section>('Keyboard');
  const [query, setQuery] = useState('');
  const [hotkeyDefinitions, setHotkeyDefinitions] = useState(
    () => ({ ...hotkeysManager.hotkeyDefinitions }) as Record<string, any>
  );
  const [language, setLanguage] = useState(currentLanguage().value);

  const close = () => {
    hotkeysModule.stopRecord();
    hotkeysModule.unpause();
    hide();
  };

  const save = () => {
    if (language !== currentLanguage().value) {
      ohifI18n.changeLanguage(language);
      window.location.reload();
      return;
    }
    hotkeysManager.setHotkeys(hotkeyDefinitions);
    close();
  };

  const reset = () => {
    hotkeysManager.restoreDefaultBindings();
    setHotkeyDefinitions({ ...hotkeysManager.hotkeyDefinitions });
    setLanguage(defaultLanguage.value);
  };

  const brand = appConfig().imagingPlatform?.brand ?? appConfig().brand ?? {};
  const version = [process.env.VERSION_NUMBER, process.env.COMMIT_HASH?.slice(0, 8)]
    .filter(Boolean)
    .join(' · ');

  const heading = (text: string) => (
    <h3 className="text-muted-foreground mb-2 mt-4 text-xs font-medium uppercase tracking-wide first:mt-0">
      {text}
    </h3>
  );
  const row = (label: string, value: React.ReactNode, key?: string) => (
    <div
      key={key ?? label}
      className="border-border flex items-center justify-between gap-4 border-b py-1.5 last:border-0"
    >
      <span className="text-sm">{label}</span>
      {value}
    </div>
  );

  const body = {
    General: (
      <>
        {heading(t('Language'))}
        <Select
          value={language}
          onValueChange={setLanguage}
        >
          <SelectTrigger
            className="w-64"
            aria-label={t('Language')}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableLanguages.map(lang => (
              <SelectItem
                key={lang.value}
                value={lang.value}
              >
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground mt-2 text-xs">
          {t('Changing the language reloads the viewer.')}
        </p>
      </>
    ),
    Mouse: (
      <>
        {heading(t('Mouse'))}
        {MOUSE.map(([input, action]) =>
          row(t(input), <span className="text-muted-foreground text-sm">{t(action)}</span>)
        )}
        <p className="text-muted-foreground mt-3 text-xs">
          {t('Choosing a tool in the toolbar or by its key changes the left button only.')}
        </p>
      </>
    ),
    Keyboard: (
      <>
        <Input
          className="mb-3"
          placeholder={t('Search shortcuts')}
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        {groupHotkeys(hotkeyDefinitions, query).map(({ group, entries }) => (
          <div key={group}>
            {heading(t(group))}
            {entries.map(([id, definition]) => (
              <UserPreferencesModal.Hotkey
                key={id}
                className="border-border items-center border-b py-1 last:border-0"
                inputClassName="h-7 w-auto min-w-[96px] font-mono text-xs"
                label={i18n.t(definition.label)}
                value={definition.keys}
                placeholder={definition.keys}
                hotkeys={hotkeysModule}
                onChange={keys =>
                  setHotkeyDefinitions(defs => ({ ...defs, [id]: { ...defs[id], keys } }))
                }
              />
            ))}
          </div>
        ))}
      </>
    ),
    About: (
      <>
        {heading(t('About'))}
        {row(t('Application'), <span className="text-sm">{brand.appName || 'AxialScope'}</span>)}
        {version && row(t('Version'), <span className="font-mono text-sm">{version}</span>)}
        {brand.supportUrl &&
          row(
            t('Support'),
            <a
              className="text-primary text-sm hover:underline"
              href={brand.supportUrl}
              target="_blank"
              rel="noreferrer"
            >
              {brand.supportUrl}
            </a>
          )}
        {row(t('Browser'), <span className="text-sm">{navigator.userAgent.split(') ')[0]})</span>)}
      </>
    ),
  };

  return (
    <div className="text-foreground flex h-[70vh] max-h-[640px] w-full flex-col">
      <div className="flex min-h-0 flex-1 gap-4">
        <nav className="border-border flex w-40 shrink-0 flex-col gap-0.5 border-r pr-3">
          {SECTIONS.map(name => (
            <button
              key={name}
              className={`focus-visible:bg-muted rounded-sm px-3 py-1.5 text-left text-sm outline-none focus:outline-none focus-visible:outline-none ${
                section === name
                  ? 'bg-primary/15 text-primary'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              }`}
              onClick={() => setSection(name)}
            >
              {t(name)}
            </button>
          ))}
        </nav>
        <div className="min-w-0 flex-1 overflow-y-auto pr-2">{body[section]}</div>
      </div>
      <FooterAction className="border-border mt-4 border-t pt-4">
        <FooterAction.Left>
          <FooterAction.Auxiliary onClick={reset}>{t('Reset to defaults')}</FooterAction.Auxiliary>
        </FooterAction.Left>
        <FooterAction.Right>
          <FooterAction.Secondary onClick={close}>{t('Cancel')}</FooterAction.Secondary>
          <FooterAction.Primary onClick={save}>{t('Save')}</FooterAction.Primary>
        </FooterAction.Right>
      </FooterAction>
    </div>
  );
}

SettingsDialog.title = 'Settings';
SettingsDialog.menuTitle = i18n.t('UserPreferencesModal:Settings');
SettingsDialog.containerClassName = 'flex w-[880px] max-w-[95vw] flex-col p-6';
