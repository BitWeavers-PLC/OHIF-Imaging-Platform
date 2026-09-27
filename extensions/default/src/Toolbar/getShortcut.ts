type Command = { commandName: string; commandOptions?: Record<string, unknown> };
type HotkeyDefinition = Command & { keys?: string[] | string };

const toCommands = (commands): Command[] =>
  (Array.isArray(commands) ? commands : commands ? [commands] : []).map(command =>
    typeof command === 'string' ? { commandName: command } : command
  );

const formatKeys = (keys: string[] | string) =>
  (Array.isArray(keys) ? keys.join('+') : keys)
    .split('+')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('+');

/**
 * Fork: the key bound to a toolbar button, for its tooltip ("Window Level  W").
 * Tool buttons run `setToolActiveToolbar` with the button id as toolName; other buttons
 * match on command name plus the options the hotkey sets. Alias keys (`alias` option)
 * are skipped so the primary key is shown.
 */
export default function getShortcut(
  hotkeyDefinitions: Record<string, HotkeyDefinition> | HotkeyDefinition[] | undefined,
  button: { id: string; commands?: unknown }
): string | undefined {
  const commands = toCommands(button.commands);
  const match = Object.values(hotkeyDefinitions ?? {}).find(
    ({ commandName, commandOptions = {}, keys }) =>
      keys?.length &&
      !commandOptions.alias &&
      commands.some(command =>
        command.commandName !== commandName
          ? false
          : commandName === 'setToolActiveToolbar'
            ? commandOptions.toolName === button.id
            : Object.entries(commandOptions).every(
                ([key, value]) => command.commandOptions?.[key] === value
              )
      )
  );
  return match ? formatKeys(match.keys) : undefined;
}
