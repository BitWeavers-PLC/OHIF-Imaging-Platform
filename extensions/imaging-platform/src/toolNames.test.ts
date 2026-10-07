jest.mock('@ohif/ui-next', () => ({
  Icons: jest.requireActual('../../../platform/ui-next/src/components/Icons/Icons').Icons,
}));
import toolbarButtons, { toolNames } from '../../../modes/basic/src/toolbarButtons';

it('renames only buttons that exist (a typo would silently keep the old name)', () => {
  const ids = new Set(toolbarButtons.map(button => button.id));
  expect(Object.keys(toolNames).filter(id => !ids.has(id))).toEqual([]);
});
