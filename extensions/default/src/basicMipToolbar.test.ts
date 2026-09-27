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

  it('exposes slab projections that call setViewportSlab', () => {
    expect(toolbarSections.primary).toContain('SlabTools');
    for (const id of toolbarSections.SlabTools) {
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
    expect(hangingProtocol).toEqual(['@ohif/hpMammo', '@ohif/dxTwoView', 'default']);
  });

  it('registers the CR/DX two-view protocol', () => {
    const protocols = require('./getHangingProtocolModule').default();
    const dx = protocols.find(p => p.name === '@ohif/dxTwoView').protocol;
    expect(dx.protocolMatchingRules[0].constraint.contains).toEqual(['CR', 'DX']);
    expect(dx.stages[0].viewports).toHaveLength(2);
  });
});

describe('basic MIP tool group', () => {
  it('rotates on wheel, jumps on click and windows on Shift+drag', () => {
    const { initMIPToolGroup } = require('../../../modes/basic/src/initToolGroups');
    const Enums = {
      MouseBindings: { Primary: 1, Secondary: 2, Auxiliary: 4, Wheel: 524288 },
      KeyboardBindings: { Shift: 16 },
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
      { mouseButton: Enums.MouseBindings.Primary, modifierKey: Enums.KeyboardBindings.Shift },
    ]);
  });
});
