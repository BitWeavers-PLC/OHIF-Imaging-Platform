import getStudiesForPatientByMRN from './getStudiesForPatientByMRN';

const study = (uid, mrn, patientName) => ({ studyInstanceUid: uid, mrn, patientName });

describe('getStudiesForPatientByMRN', () => {
  const current = [study('1', 'P1', 'DOE, JOHN')];
  const dataSource = {
    query: {
      studies: {
        search: jest.fn(async () => [
          study('1', 'P1', 'DOE, JOHN'),
          study('2', 'P1', 'Doe John'),
          study('3', 'P1', 'SMITH, JANE'), // same ID at another facility
        ]),
      },
    },
  };

  it('keeps only studies whose patient name also matches', async () => {
    const result = await getStudiesForPatientByMRN(dataSource, current);
    expect(result.map(s => s.studyInstanceUid)).toEqual(['1', '2']);
    expect(dataSource.query.studies.search).toHaveBeenCalledWith({
      patientId: 'P1',
      disableWildcard: true,
    });
  });

  it('does not search for priors without a patient name', async () => {
    const onlyCurrent = [study('1', 'P1', '')];
    expect(await getStudiesForPatientByMRN(dataSource, onlyCurrent)).toBe(onlyCurrent);
  });
});
