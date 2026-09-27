// Load only the real Icons map (the full ui-next index is too heavy for this test).
jest.mock('@ohif/ui-next', () => ({
  Icons: jest.requireActual('../../../platform/ui-next/src/components/Icons/Icons').Icons,
}));
import { Icons } from '@ohif/ui-next';
import toolbarButtons from '../../../modes/basic/src/toolbarButtons';
import registerIcons, { iconOverrides } from './icons';

describe('imaging-platform icon overrides', () => {
  it('replaces the OHIF icons by name', () => {
    const originals = Object.fromEntries(Object.keys(iconOverrides).map(n => [n, Icons[n]]));
    registerIcons();
    for (const [name, Component] of Object.entries(iconOverrides)) {
      expect(Icons[name]).toBe(Component);
      expect(Icons[name]).not.toBe(originals[name]);
    }
  });

  it('leaves no toolbar icon missing', () => {
    registerIcons();
    const missing = toolbarButtons
      .map(button => button.props?.icon)
      .filter(icon => typeof icon === 'string' && !Icons[icon]);
    // Viewport-corner items name icons that their custom components never render.
    expect(
      missing.filter(i => !['Status', 'Navigation', 'TrackingStatus', 'WindowLevel'].includes(i))
    ).toEqual([]);
  });
});
