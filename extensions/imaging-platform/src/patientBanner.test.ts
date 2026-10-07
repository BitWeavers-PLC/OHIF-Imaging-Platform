jest.mock('react-dnd', () => ({ useDrag: () => [{}, () => {}] }));
jest.mock('@ohif/extension-default', () => ({ usePatientInfo: () => ({}) }));
jest.mock('@ohif/i18n', () => ({ t: (key: string) => key }));
import { patientDetails } from './panels/SeriesStrip';

describe('patientDetails', () => {
  it('joins ID, age with sex, and birth date', () => {
    expect(
      patientDetails({ PatientID: 'MRN1', PatientAge: '65Y', PatientSex: 'M', PatientDOB: '1958' })
    ).toBe('MRN1 · 65Y M · 1958');
  });

  it('leaves out what the study does not have', () => {
    expect(patientDetails({ PatientID: 'MRN1', PatientSex: 'F' })).toBe('MRN1 · F');
  });
});
