jest.mock('@ohif/ui-next', () => ({ Icons: {}, LayoutSelector: {}, useHoverMenu: () => ({}) }));
jest.mock('@ohif/i18n', () => ({ t: (key: string) => key.split(':')[1] }));
import { layoutChoices } from './LayoutMenu';

const preset = (protocolId: string, title: string, disabled = false) => ({
  title,
  icon: 'x',
  commandOptions: { protocolId },
  disabled,
});

describe('layoutChoices', () => {
  it('uses our names and leaves out layouts the series cannot open', () => {
    const choices = layoutChoices([
      preset('fourUp', '3D four up'),
      preset('primaryAxial', 'Axial Primary', true),
      preset('@ohif/frameView', 'Frame View'),
      preset('custom', 'Site layout'),
    ]);
    expect(choices.map(c => c.title)).toEqual(['3D + MPR', 'All images', 'Site layout']);
  });
});
