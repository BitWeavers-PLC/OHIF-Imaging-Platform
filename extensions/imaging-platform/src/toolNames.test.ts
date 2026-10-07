jest.mock('@ohif/ui-next', () => ({
  Icons: jest.requireActual('../../../platform/ui-next/src/components/Icons/Icons').Icons,
}));
import toolbarButtons, { toolNames, toolCaptions } from '../../../modes/basic/src/toolbarButtons';
import { toolbarButtons as segmentationButtons } from '../../../modes/segmentation/src/toolbarButtons';

it('renames only buttons that exist (a typo would silently keep the old name)', () => {
  const ids = new Set(toolbarButtons.map(button => button.id));
  expect(Object.keys(toolNames).filter(id => !ids.has(id))).toEqual([]);
});

it('captions only buttons that exist, in both the standard and segmentation toolbars', () => {
  const buttons = [...toolbarButtons, ...segmentationButtons];
  const ids = new Set(buttons.map(button => button.id));
  expect(Object.keys(toolCaptions).filter(id => !ids.has(id))).toEqual([]);
  const windowLevel = buttons.filter(button => button.id === 'WindowLevel');
  expect(windowLevel.length).toBe(2);
  windowLevel.forEach(button => expect('caption' in button.props).toBe(true));
});
