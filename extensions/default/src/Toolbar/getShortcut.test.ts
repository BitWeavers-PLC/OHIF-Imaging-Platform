import getShortcut from './getShortcut';
import radiantHotkeys from '../../../imaging-platform/src/radiantHotkeys';
import toolbarButtons, { setToolActiveToolbar } from '../../../../modes/basic/src/toolbarButtons';

const button = id => {
  const found = toolbarButtons.find(b => b.id === id);
  return { id, commands: found?.props?.commands };
};

describe('getShortcut', () => {
  it('finds the RadiAnt key for tool and command buttons', () => {
    expect(getShortcut(radiantHotkeys, button('WindowLevel'))).toBe('W');
    expect(getShortcut(radiantHotkeys, button('Length'))).toBe('L');
    expect(getShortcut(radiantHotkeys, button('Reset'))).toBe('Ctrl+Shift+\\');
    expect(getShortcut(radiantHotkeys, button('invert'))).toBe('I');
    expect(getShortcut(radiantHotkeys, button('WLBone'))).toBe('4');
    expect(getShortcut(radiantHotkeys, button('WLDefault'))).toBe('0');
  });

  it('shows no key for Cine (Space plays; the button only opens the player)', () => {
    expect(getShortcut(radiantHotkeys, button('Cine'))).toBeUndefined();
  });

  it('follows a user rebind', () => {
    const rebound = radiantHotkeys.map(h =>
      h.commandOptions?.toolName === 'Zoom' ? { ...h, keys: ['ctrl+shift+z'] } : h
    );
    expect(getShortcut(rebound, { id: 'Zoom', commands: setToolActiveToolbar })).toBe(
      'Ctrl+Shift+Z'
    );
  });
});
