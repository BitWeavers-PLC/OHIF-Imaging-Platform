jest.mock('@ohif/i18n', () => ({ t: (key: string) => key.split(':')[1] }));
import { validWorkflows, workflowToOpen } from './workflows';

const mode = (routeName: string, accepts: (m: string[]) => boolean) => ({
  routeName,
  isValidMode: ({ modalities }) => ({ valid: accepts(modalities.split('\\')) }),
});
const modes = [
  mode('viewer', m => m.some(x => x !== 'SM')),
  mode('microscopy', m => m.includes('SM')),
  mode('tmtv', m => m.includes('PT') && m.includes('CT')),
  mode('segmentation', m => m.some(x => x !== 'SM')),
  mode('dev', () => true), // installed but not a reader workflow
];

describe('workflows', () => {
  it('offers only the workflows that fit the study, under our names', () => {
    expect(validWorkflows(modes, 'CT/PT').map(w => w.label)).toEqual([
      'Standard reading',
      'PET/CT tumor volume',
      'Segmentation',
    ]);
    expect(validWorkflows(modes, 'SM').map(w => w.route)).toEqual(['microscopy']);
  });

  it('switches only when the open workflow cannot show the study', () => {
    expect(workflowToOpen('viewer', validWorkflows(modes, 'SM'))).toBe('microscopy');
    expect(workflowToOpen('viewer', validWorkflows(modes, 'CT'))).toBeNull();
    expect(workflowToOpen('dev', validWorkflows(modes, 'SM'))).toBeNull(); // unknown route: leave it
  });
});
