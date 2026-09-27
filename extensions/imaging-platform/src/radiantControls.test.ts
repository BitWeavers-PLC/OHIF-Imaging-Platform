// The command module's dialogs import ui-next, which is too heavy for Jest.
jest.mock('@ohif/ui-next', () => ({ Button: () => null }));
import fs from 'fs';
import path from 'path';
import { radiantActiveTools } from '../../../modes/basic/src/initToolGroups';
import radiantHotkeys from './radiantHotkeys';
import getCommandsModule from './commandsModule';

const MouseBindings = {
  Primary: 1,
  Secondary: 2,
  Auxiliary: 4,
  Fourth_Button: 8,
  Fifth_Button: 16,
  Wheel: 524288,
};
const KeyboardBindings = { Shift: 16, Ctrl: 17 };
const toolNames = new Proxy({}, { get: (_, name) => name });

const toolFor = (tools, mouseButton, modifierKey?) =>
  tools.find(t =>
    t.bindings.some(b => b.mouseButton === mouseButton && b.modifierKey === modifierKey)
  )?.toolName;

describe('RadiAnt mouse map', () => {
  const tools = radiantActiveTools(toolNames, { MouseBindings, KeyboardBindings });

  it('binds each button like RadiAnt', () => {
    expect(toolFor(tools, MouseBindings.Primary)).toBe('StackScroll');
    expect(toolFor(tools, MouseBindings.Auxiliary)).toBe('WindowLevel');
    expect(toolFor(tools, MouseBindings.Secondary)).toBe('Zoom');
    expect(toolFor(tools, MouseBindings.Fourth_Button)).toBe('Pan');
    expect(toolFor(tools, MouseBindings.Fifth_Button)).toBe('Length');
    expect(toolFor(tools, MouseBindings.Wheel)).toBe('StackScroll');
    expect(toolFor(tools, MouseBindings.Wheel, KeyboardBindings.Ctrl)).toBe('Zoom');
    expect(toolFor(tools, MouseBindings.Primary, KeyboardBindings.Ctrl)).toBe('WindowLevel');
    expect(toolFor(tools, MouseBindings.Primary, KeyboardBindings.Shift)).toBe('Pan');
  });

  it('never binds one input to two tools', () => {
    const inputs = tools.flatMap(t =>
      t.bindings.map(b => `${b.mouseButton}/${b.modifierKey}/${b.numTouchPoints}`)
    );
    expect(new Set(inputs).size).toBe(inputs.length);
  });
});

describe('RadiAnt keymap', () => {
  it('uses each key combo once', () => {
    const keys = radiantHotkeys.map(h => h.keys.join('+'));
    expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([]);
  });

  it('gives every definition a distinct command + options (HotkeysManager keys by that)', () => {
    const ids = radiantHotkeys.map(h => JSON.stringify([h.commandName, h.commandOptions ?? {}]));
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  it('only runs commands that exist', () => {
    const root = path.resolve(__dirname, '../../..');
    const known = new Set(
      Object.keys(getCommandsModule({ servicesManager: { services: {} } } as any).definitions)
    );
    for (const ext of ['cornerstone', 'default', 'cornerstone-dicom-seg']) {
      const src = fs.readFileSync(
        path.join(root, `extensions/${ext}/src/commandsModule.ts`),
        'utf8'
      );
      for (const [, name] of src.matchAll(/^\s+(\w+):\s*(?:\{\s*commandFn|actions\.)/gm)) {
        known.add(name);
      }
    }
    const missing = radiantHotkeys.map(h => h.commandName).filter(name => !known.has(name));
    expect(missing).toEqual([]);
  });
});
