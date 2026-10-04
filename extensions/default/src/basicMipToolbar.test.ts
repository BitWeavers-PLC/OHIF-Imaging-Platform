import toolbarButtons from '../../../modes/basic/src/toolbarButtons';
import { toolbarSections } from '../../../modes/basic/src/index';

const byId = id => toolbarButtons.find(button => button.id === id);

describe('basic MIP toolbar action', () => {
  it('includes a dedicated MIP hanging protocol button', () => {
    const mipButton = byId('MIP');

    expect(mipButton).toBeDefined();
    expect(mipButton.props.commands).toEqual({
      commandName: 'toggleHangingProtocol',
      commandOptions: {
        protocolId: 'mip',
      },
    });
    expect(mipButton.props.evaluate).toBe('evaluate.displaySetIsReconstructable');
  });

  it('points the 3D button at the registered only3D protocol', () => {
    expect(byId('VolumeRendering3D').props.commands.commandOptions.protocolId).toBe('only3D');
  });

  it('has one MIP control: the MIP layout first, then slab projections', () => {
    expect(toolbarSections.primary).toContain('SlabTools');
    expect(toolbarSections.primary).not.toContain('MIP');
    const [first, ...slabs] = toolbarSections.SlabTools;
    expect(first).toBe('MIP');
    for (const id of slabs) {
      expect(byId(id)?.props.commands.commandName).toBe('setViewportSlab');
    }
    expect(byId('SlabMinIP10').props.commands.commandOptions).toEqual({
      blendMode: 'minip',
      slabThickness: 10,
    });
    expect(byId('SlabOff').props.commands.commandOptions.blendMode).toBeUndefined();
  });

  it('every button referenced by a toolbar section is defined', () => {
    const ids = new Set(toolbarButtons.map(button => button.id));
    for (const [section, buttonIds] of Object.entries(toolbarSections)) {
      for (const id of buttonIds as string[]) {
        expect(`${section}:${ids.has(id) ? id : 'MISSING ' + id}`).toBe(`${section}:${id}`);
      }
    }
  });
});

describe('basic hanging protocol selection', () => {
  it('prefers modality-specific layouts, falling back to default', () => {
    const { hangingProtocol } = require('../../../modes/basic/src/index').default.modeInstance;
    expect(hangingProtocol[0]).toBe('@ohif/hpMammo'); // filterSeriesRequiredForRun reads [0]
    expect(hangingProtocol.at(-1)).toBe('default');
    const registered = require('./getHangingProtocolModule')
      .default()
      .map(p => p.name);
    expect(hangingProtocol.filter(id => id !== 'default' && !registered.includes(id))).toEqual([]);
  });

  it('registers the CR/DX two-view protocol', () => {
    const protocols = require('./getHangingProtocolModule').default();
    const dx = protocols.find(p => p.name === '@ohif/dxTwoView').protocol;
    expect(dx.protocolMatchingRules[0].constraint.contains).toEqual(['CR', 'DX']);
    expect(dx.stages[0].viewports).toHaveLength(2);
  });
});

describe('basic MIP tool group', () => {
  it('rotates on wheel, jumps on click, windows on middle/Ctrl+drag, pans on Shift+drag', () => {
    const { initMIPToolGroup } = require('../../../modes/basic/src/initToolGroups');
    const Enums = {
      MouseBindings: { Primary: 1, Secondary: 2, Auxiliary: 4, Fourth_Button: 8, Wheel: 524288 },
      KeyboardBindings: { Shift: 16, Ctrl: 17 },
    };
    const toolNames = new Proxy({}, { get: (_, name) => name });
    const groups = {};
    initMIPToolGroup(
      { getModuleEntry: () => ({ exports: { toolNames, Enums } }) },
      { createToolGroupAndAddTools: (id, tools) => (groups[id] = tools) }
    );

    const bindingsOf = name => groups.mip.active.find(t => t.toolName === name)?.bindings;
    expect(bindingsOf('VolumeRotate')).toEqual([{ mouseButton: Enums.MouseBindings.Wheel }]);
    expect(bindingsOf('MipJumpToClick')).toEqual([{ mouseButton: Enums.MouseBindings.Primary }]);
    expect(bindingsOf('WindowLevel')).toEqual([
      { mouseButton: Enums.MouseBindings.Auxiliary },
      { mouseButton: Enums.MouseBindings.Primary, modifierKey: Enums.KeyboardBindings.Ctrl },
    ]);
    expect(bindingsOf('Pan')).toContainEqual({
      mouseButton: Enums.MouseBindings.Primary,
      modifierKey: Enums.KeyboardBindings.Shift,
    });
  });
});

describe('basic toolbar grouping', () => {
  it('gives every primary item a group, in contiguous runs', () => {
    const groups = toolbarSections.primary.map(id => byId(id)?.props?.group);
    expect(groups.filter(g => !g)).toEqual([]);
    // A group never reappears after another one starts (one separator per group).
    const runs = groups.filter((g, i) => g !== groups[i - 1]);
    expect(new Set(runs).size).toBe(runs.length);
  });

  it('puts window presets under the W/L split button', () => {
    expect(toolbarSections.WindowLevelTools[0]).toBe('WindowLevel');
    expect(byId('WLBone').props.commands).toEqual({
      commandName: 'setWindowLevelPreset',
      commandOptions: { presetName: 'ct-bone' },
    });
  });
});
