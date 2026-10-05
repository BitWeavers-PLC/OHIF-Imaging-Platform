import { radiantActiveTools, withSegmentationTools } from '../../../modes/basic/src/initToolGroups';

const toolNames = new Proxy({}, { get: (_, name) => name });
const Enums = {
  MouseBindings: {
    Primary: 1,
    Secondary: 2,
    Auxiliary: 4,
    Fourth_Button: 8,
    Fifth_Button: 16,
    Wheel: 524288,
  },
  KeyboardBindings: { Shift: 16, Ctrl: 17 },
};
const utilityModule = { exports: { toolNames, Enums } };
const commandsManager = { run: (_, { tools }) => tools };

describe('segmentation editing in the main viewer', () => {
  const tools = withSegmentationTools(
    { active: radiantActiveTools(toolNames, Enums), passive: [{ toolName: 'Probe' }] },
    utilityModule,
    commandsManager
  );
  const passive = tools.passive.map(tool => tool.toolName);

  it('adds the brush, eraser and threshold tools', () => {
    expect(passive).toEqual(
      expect.arrayContaining(['CircularBrush', 'CircularEraser', 'ThresholdCircularBrush'])
    );
  });

  it('keeps StackScroll active only, so its left-button binding survives', () => {
    expect(passive).not.toContain('StackScroll');
    expect(tools.active.map(tool => tool.toolName)).toContain('StackScroll');
  });

  it('adds no tool twice', () => {
    const all = [...tools.active, ...tools.passive].map(tool => tool.toolName);
    expect(new Set(all).size).toBe(all.length);
  });
});
