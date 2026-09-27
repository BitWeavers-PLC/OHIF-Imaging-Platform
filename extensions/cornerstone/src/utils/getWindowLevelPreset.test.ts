import getWindowLevelPreset from './getWindowLevelPreset';
import presets from '../components/WindowLevelActionMenu/defaultWindowLevelPresets';

describe('getWindowLevelPreset', () => {
  it('finds array presets by id rather than index', () => {
    expect(getWindowLevelPreset(presets.CT, 'ct-bone', 2).id).toBe('ct-bone');
    expect(getWindowLevelPreset(presets.CT, 'ct-brain', 3).id).toBe('ct-brain');
  });

  it('supports object-keyed presets and index fallback', () => {
    const custom = { lung: { window: 1500, level: -600 }, bone: { window: 2500, level: 480 } };
    expect(getWindowLevelPreset(custom, 'bone', 0)).toBe(custom.bone);
    expect(getWindowLevelPreset(custom, 'missing', 0)).toBe(custom.lung);
    expect(getWindowLevelPreset(undefined, 'x', 0)).toBeUndefined();
  });
});
