import { groupHotkeys } from './settingsGroups';

const defs = {
  a: { commandName: 'nextImage', label: 'Next Image', keys: ['down'] },
  b: { commandName: 'setWindowLevelPreset', label: 'Bone Window', keys: ['4'] },
  c: { commandName: 'setToolActiveToolbar', label: 'Length Tool', keys: ['l'] },
  d: { commandName: 'setToolActive', label: 'Brush', keys: ['shift+b'] },
  e: { commandName: 'somethingNew', label: 'Mystery', keys: ['q'] },
};

describe('groupHotkeys', () => {
  it('sorts shortcuts into ordered sections', () => {
    expect(groupHotkeys(defs).map(s => [s.group, s.entries.map(([id]) => id)])).toEqual([
      ['Navigation', ['a']],
      ['Window & level', ['b']],
      ['Tools', ['c']],
      ['Segmentation', ['d']],
      ['Other', ['e']],
    ]);
  });

  it('filters by label or key and drops empty sections', () => {
    expect(groupHotkeys(defs, 'window').map(s => s.group)).toEqual(['Window & level']);
    expect(groupHotkeys(defs, 'shift+b')[0].entries[0][0]).toBe('d');
  });
});
