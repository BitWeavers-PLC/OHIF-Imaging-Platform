import HangingProtocolService from '../../../../platform/core/src/services/HangingProtocolService/HangingProtocolService';
import getHangingProtocolModule from '../getHangingProtocolModule';
import registerCrossSectionalAttributes, { getImagePlane } from './utils/crossSectionalAttributes';

const AXIAL = [1, 0, 0, 0, 1, 0];
const CORONAL = [1, 0, 0, 0, 0, -1];
const SAGITTAL = [0, 1, 0, 0, 0, -1];

const MODE_PROTOCOLS = [
  '@ohif/hpMammo',
  '@ohif/dxTwoView',
  '@axialscope/ctBody',
  '@axialscope/petCt',
  '@axialscope/mrBrain',
  '@axialscope/mrSpine',
  '@axialscope/mrGeneral',
  'default',
];

let n = 0;
const series = (study, Modality, SeriesDescription, frames, iop = AXIAL, extra = {}) => {
  n += 1;
  return {
    StudyInstanceUID: study.StudyInstanceUID,
    displaySetInstanceUID: `ds${n}`,
    SeriesInstanceUID: `s${n}`,
    SeriesNumber: n,
    Modality,
    SeriesDescription,
    numImageFrames: frames,
    isReconstructable: frames > 1,
    instances: [{ ImageOrientationPatient: iop, SeriesDescription }],
    ...extra,
  };
};

function hang(study, displaySets) {
  const hps = new HangingProtocolService({ run: jest.fn() } as any, { services: {} } as any);
  getHangingProtocolModule().forEach(({ name, protocol }) => hps.addProtocol(name, protocol));
  registerCrossSectionalAttributes(hps);
  hps.setActiveProtocolIds(MODE_PROTOCOLS);
  hps.run({ studies: [study], activeStudy: study, displaySets }, MODE_PROTOCOLS);
  const byViewport = [...hps.getMatchDetails().viewportMatchDetails.values()].map(
    v => v.displaySetsInfo?.[0]?.displaySetInstanceUID
  );
  return { protocolId: hps.getState().protocolId, byViewport };
}

const ModalitiesInStudy = m => ({ ModalitiesInStudy: m });

describe('getImagePlane', () => {
  it('names the plane from ImageOrientationPatient', () => {
    expect(getImagePlane(AXIAL)).toBe('axial');
    expect(getImagePlane(CORONAL)).toBe('coronal');
    expect(getImagePlane(SAGITTAL)).toBe('sagittal');
    expect(getImagePlane('1\\0\\0\\0\\0.94\\-0.34')).toBe('axial'); // tilted gantry
    expect(getImagePlane(undefined)).toBeUndefined();
  });
});

describe('CT/MR hanging protocols', () => {
  it('CT: skips the scout, main axial left and coronal reformat of it right', () => {
    const study = { StudyInstanceUID: 'ct', ...ModalitiesInStudy(['CT']) };
    const scout = series(study, 'CT', 'Topogram 0.6 T20f', 1);
    const main = series(study, 'CT', 'Abdomen 3.0 Br40', 180);
    const { protocolId, byViewport } = hang(study, [scout, main]);
    expect(protocolId).toBe('@axialscope/ctBody');
    expect(byViewport).toEqual([main.displaySetInstanceUID, main.displaySetInstanceUID]);
  });

  it('PET/CT: axial CT left, attenuation-corrected PET right (not the scout, not NAC)', () => {
    const study = { StudyInstanceUID: 'petct', ...ModalitiesInStudy(['CT', 'PT']) };
    const scout = series(study, 'CT', 'SCOUT', 1);
    const ct = series(study, 'CT', 'CT IMAGES', 135);
    const nac = series(study, 'PT', 'PET NAC', 135);
    const ac = series(study, 'PT', 'PET AC', 135);
    const { protocolId, byViewport } = hang(study, [scout, ct, nac, ac]);
    expect(protocolId).toBe('@axialscope/petCt');
    expect(byViewport).toEqual([ct.displaySetInstanceUID, ac.displaySetInstanceUID]);
  });

  it('MR brain: T1, T2, FLAIR, DWI in their panes', () => {
    const study = {
      StudyInstanceUID: 'brain',
      StudyDescription: 'MRI BRAIN W/WO',
      ...ModalitiesInStudy(['MR']),
    };
    const loc = series(study, 'MR', 'localizer', 3);
    const flair = series(study, 'MR', 'AX FLAIR', 30);
    const t2 = series(study, 'MR', 't2_tse_tra', 30);
    const dwi = series(study, 'MR', 'ep2d_diff_TRACEW', 30);
    const t1 = series(study, 'MR', 'AX T1 SE', 30);
    const { protocolId, byViewport } = hang(study, [loc, flair, t2, dwi, t1]);
    expect(protocolId).toBe('@axialscope/mrBrain');
    expect(byViewport).toEqual([t1, t2, flair, dwi].map(ds => ds.displaySetInstanceUID));
  });

  it('MR spine: sagittal T2, sagittal T1, axial T2 by plane', () => {
    const study = {
      StudyInstanceUID: 'spine',
      StudyDescription: 'MR LUMBAR SPINE',
      ...ModalitiesInStudy(['MR']),
    };
    const axT2 = series(study, 'MR', 'T2 TSE', 40, AXIAL);
    const sagT1 = series(study, 'MR', 'T1 TSE', 15, SAGITTAL);
    const sagT2 = series(study, 'MR', 'T2 TSE', 15, SAGITTAL);
    const { protocolId, byViewport } = hang(study, [axT2, sagT1, sagT2]);
    expect(protocolId).toBe('@axialscope/mrSpine');
    expect(byViewport).toEqual([sagT2, sagT1, axT2].map(ds => ds.displaySetInstanceUID));
  });

  it('other MR: first four image series 2x2', () => {
    const study = {
      StudyInstanceUID: 'knee',
      StudyDescription: 'MR KNEE',
      ...ModalitiesInStudy(['MR']),
    };
    const list = ['PD FS SAG', 'PD FS COR', 'T1 COR', 'PD FS AX', 'T2 SAG'].map(d =>
      series(study, 'MR', d, 20)
    );
    const { protocolId, byViewport } = hang(study, list);
    expect(protocolId).toBe('@axialscope/mrGeneral');
    expect(byViewport).toEqual(list.slice(0, 4).map(ds => ds.displaySetInstanceUID));
  });

  it('MR head with only T1 series falls back to the general 2x2', () => {
    const study = {
      StudyInstanceUID: 'cranio',
      StudyDescription: 'RNM CRANIO (ENCEFALO)',
      ...ModalitiesInStudy(['MR']),
    };
    const list = ['COR 3D T1', '3D T1', 'SAG 3D T1'].map(d => series(study, 'MR', d, 40));
    expect(hang(study, list).protocolId).toBe('@axialscope/mrGeneral');
  });

  it('other MR with two series: 1x2, no empty panes', () => {
    const study = { StudyInstanceUID: 'perf', ...ModalitiesInStudy(['MR']) };
    const list = ['PERFUSION', 'DTI'].map(d => series(study, 'MR', d, 900));
    expect(hang(study, list).byViewport).toEqual(list.map(ds => ds.displaySetInstanceUID));
  });

  it('single X-ray film opens one viewport; PA + lateral opens side by side', () => {
    const one = { StudyInstanceUID: 'cr1', ...ModalitiesInStudy(['CR']) };
    const single = hang(one, [series(one, 'CR', 'CHEST AP', 1)]);
    expect(single.protocolId).toBe('default');
    expect(single.byViewport).toHaveLength(1);

    const two = { StudyInstanceUID: 'dx2', ...ModalitiesInStudy(['DX']) };
    const pa = series(two, 'DX', 'PA', 1);
    const lat = series(two, 'DX', 'LAT', 1);
    const pair = hang(two, [pa, lat]);
    expect(pair.protocolId).toBe('@ohif/dxTwoView');
    expect(pair.byViewport).toEqual([pa.displaySetInstanceUID, lat.displaySetInstanceUID]);
  });

  it('CT with only a scout opens one viewport, not empty axial + coronal panes', () => {
    const study = { StudyInstanceUID: 'ctScout', ...ModalitiesInStudy(['CT']) };
    const result = hang(study, [series(study, 'CT', 'Topogram', 1)]);
    expect(result.protocolId).toBe('default');
    expect(result.byViewport).toHaveLength(1);
  });
});
