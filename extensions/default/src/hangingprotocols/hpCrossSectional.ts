import { Types } from '@ohif/core';
import { viewportOptions } from './utils/viewportOptions';

/**
 * Fork: CT/MR layouts that open automatically (attributes in utils/crossSectionalAttributes.ts).
 * Series are chosen by normalised description tokens; a pane with no matching series stays
 * empty (allowUnmatchedView) rather than repeating another pane's series.
 */

type Rule = Types.HangingProtocol.MatchingRule;

const currentStudyOnly = [
  {
    attribute: 'studyInstanceUIDsIndex',
    from: 'options',
    required: true,
    constraint: { equals: { value: 0 } },
  },
];

// Every pane: a real image series of the current study, never the scout/localizer/dose sheet.
const readable: Rule[] = [
  { attribute: 'numImageFrames', constraint: { greaterThan: { value: 0 } }, required: true },
  { attribute: 'isLocalizer', constraint: { equals: { value: false } }, required: true },
  { attribute: 'isDisplaySetFromUrl', weight: 20, constraint: { equals: true } },
];

const labelHas = (words: string[], weight = 10, required = true): Rule => ({
  attribute: 'seriesLabel',
  weight,
  required,
  constraint: { containsI: words },
});
const labelLacks = (words: string[]): Rule => ({
  attribute: 'seriesLabel',
  required: true,
  constraint: { doesNotContainI: words },
});
const plane = (value: string, weight = 5, required = false): Rule => ({
  attribute: 'ImagePlane',
  weight,
  required,
  constraint: { equals: { value } },
});

const selector = (rules: Rule[]) => ({
  studyMatchingRules: currentStudyOnly,
  seriesMatchingRules: [...readable, ...rules],
});

const stack = (id: string, syncGroups = []) => ({
  viewportOptions: {
    ...viewportOptions,
    viewportType: 'stack',
    syncGroups: [...viewportOptions.syncGroups, ...syncGroups],
  },
  displaySets: [{ id }],
});

const sliceSync = (id: string) => ({ type: 'imageSlice', id, source: true, target: true });

const modality = (value: string, weight = 100): Rule => ({
  id: value,
  weight,
  attribute: 'ModalitiesInStudy',
  constraint: { contains: value },
  required: true,
});

const grid = (rows: number, columns: number) => ({
  layoutType: 'grid',
  properties: { rows, columns },
});

const base = {
  locked: true,
  toolGroupIds: ['default'],
  numberOfPriorsReferenced: 0,
  defaultViewport: {
    viewportOptions: { ...viewportOptions, viewportType: 'stack' },
    displaySets: [{ id: 'anySeries', matchedDisplaySetsIndex: -1 }],
  },
};
const anySeries = selector([]);

/** CT (not PET/CT, not mammo): main axial series + coronal reformat of it. */
export const hpCtBody: Types.HangingProtocol.Protocol = {
  ...base,
  id: '@axialscope/ctBody',
  // The coronal volume loads from where the reader is (top first, then follows scroll/hover).
  imageLoadStrategy: 'readerFirst',
  name: 'CT axial + coronal',
  description: 'CT: main axial series with a coronal reformat',
  protocolMatchingRules: [
    modality('CT'),
    {
      id: 'notFusionOrMammo',
      attribute: 'ModalitiesInStudy',
      constraint: { doesNotInclude: ['PT', 'MG'] },
      required: true,
    },
    {
      // Only scouts / single images: one viewport (default) instead of two empty panes.
      id: 'hasVolume',
      attribute: 'hasReadableVolume',
      constraint: { equals: { value: true } },
      required: true,
    },
  ],
  displaySetSelectors: {
    anySeries,
    ctMain: selector([
      { attribute: 'isReconstructable', constraint: { equals: { value: true } }, required: true },
      plane('axial', 10),
      labelHas(['soft', 'body', 'abd', 'std', 'standard', 'venous', 'portal', 'chest'], 5, false),
      // Thin-slice sets have more images; prefer them.
      { attribute: 'numImageFrames', weight: 3, constraint: { greaterThan: { value: 100 } } },
    ]),
  },
  stages: [
    {
      name: 'Axial + coronal',
      viewportStructure: grid(1, 2),
      viewports: [
        stack('ctMain'),
        {
          viewportOptions: {
            ...viewportOptions,
            viewportId: 'ctCoronal',
            viewportType: 'volume',
            orientation: 'coronal',
            // Same tool group as the axial pane: reference lines only draw within one group.
            toolGroupId: 'default',
            initialImageOptions: { preset: 'middle' },
          },
          displaySets: [{ id: 'ctMain' }],
        },
      ],
    },
  ],
};

const petCtSync = [sliceSync('petCtSlice')];
const series = (value: string): Rule => ({
  attribute: 'Modality',
  required: true,
  constraint: { equals: { value } },
});
// Mid-body: whole-body PET/CT starts at the skull vertex otherwise.
const fromMiddle = (pane, syncGroups) => {
  const view = stack(pane, syncGroups);
  return {
    ...view,
    viewportOptions: { ...view.viewportOptions, initialImageOptions: { preset: 'middle' } },
  };
};

/**
 * PET/CT: axial CT beside the attenuation-corrected PET, one frame of reference, so they
 * scroll together from the start (was: the scout alone, PET not linked).
 */
export const hpPetCt: Types.HangingProtocol.Protocol = {
  ...base,
  id: '@axialscope/petCt',
  name: 'PET/CT',
  description: 'PET/CT: axial CT and attenuation-corrected PET, scrolled together',
  protocolMatchingRules: [
    modality('CT'),
    modality('PT'),
    {
      id: 'hasVolume',
      attribute: 'hasReadableVolume',
      constraint: { equals: { value: true } },
      required: true,
    },
  ],
  displaySetSelectors: {
    anySeries,
    ctMain: selector([
      series('CT'),
      { attribute: 'isReconstructable', constraint: { equals: { value: true } }, required: true },
      plane('axial', 10),
      { attribute: 'numImageFrames', weight: 3, constraint: { greaterThan: { value: 100 } } },
    ]),
    // Not the non-attenuation-corrected reconstruction (NAC): it is for artefact checks.
    ptMain: selector([
      series('PT'),
      { attribute: 'isReconstructable', constraint: { equals: { value: true } }, required: true },
      labelLacks(['nac', 'non ac', 'noac', 'uncorrected']),
      plane('axial', 10),
    ]),
  },
  stages: [
    {
      name: 'CT | PET',
      viewportStructure: grid(1, 2),
      viewports: [fromMiddle('ctMain', petCtSync), fromMiddle('ptMain', petCtSync)],
    },
  ],
};

const mrBrainSync = [sliceSync('mrBrainSlice')];

/** MR brain: T1 | T2 / FLAIR | DWI, scrolled together. */
export const hpMrBrain: Types.HangingProtocol.Protocol = {
  ...base,
  id: '@axialscope/mrBrain',
  name: 'MR brain 2x2',
  description: 'MR brain: T1, T2, FLAIR, DWI',
  protocolMatchingRules: [
    modality('MR'),
    {
      id: 'brain',
      weight: 50,
      attribute: 'studyLabel',
      required: true,
      constraint: {
        containsI: [
          'brain',
          'head',
          'cerebr',
          'neuro',
          'skull',
          'hirn',
          'kopf',
          'cranio',
          'cranial',
          'crane',
          'encefal',
          'encephal',
          'cerveau',
          'schädel',
        ],
      },
    },
    {
      // Otherwise the 2x2 would be mostly empty; mrGeneral shows what the study has.
      id: 'hasT2orFlair',
      attribute: 'studyLabel',
      required: true,
      constraint: { containsI: ['flair', 't2', 'tirm'] },
    },
  ],
  displaySetSelectors: {
    anySeries,
    t1: selector([
      labelHas(['t1', 'mprage', 'spgr', 'bravo']),
      labelLacks(['flair', 'dwi', 'adc']),
      plane('axial'),
    ]),
    t2: selector([
      labelHas(['t2', 'tse', 'fse']),
      labelLacks(['flair', 'tirm', 'dwi', 'adc', 'swi', 'star', 'gre', 't1']),
      plane('axial'),
    ]),
    flair: selector([labelHas(['flair', 'tirm']), plane('axial')]),
    dwi: selector([
      labelHas(['dwi', 'diff', 'trace', 'adc', 'ep2d']),
      labelHas(['trace', 'dwi', 'b1000'], 5, false),
      plane('axial'),
    ]),
  },
  stages: [
    {
      name: 'T1 T2 FLAIR DWI',
      viewportStructure: grid(2, 2),
      viewports: [
        stack('t1', mrBrainSync),
        stack('t2', mrBrainSync),
        stack('flair', mrBrainSync),
        stack('dwi', mrBrainSync),
      ],
    },
  ],
};

const spineSagSync = [sliceSync('mrSpineSagittal')];

/** MR spine: sagittal T2 | sagittal T1 | axial T2. */
export const hpMrSpine: Types.HangingProtocol.Protocol = {
  ...base,
  id: '@axialscope/mrSpine',
  name: 'MR spine 1x3',
  description: 'MR spine: sagittal T2, sagittal T1, axial T2',
  protocolMatchingRules: [
    modality('MR'),
    {
      id: 'spine',
      weight: 50,
      attribute: 'studyLabel',
      required: true,
      constraint: {
        containsI: ['spine', 'cervical', 'thoracic', 'lumbar', 'c-spine', 'l-spine', 'lws', 'hws'],
      },
    },
  ],
  displaySetSelectors: {
    anySeries,
    sagT2: selector([
      labelHas(['t2', 'tse', 'fse', 'stir']),
      labelLacks(['t1']),
      plane('sagittal', 10, true),
    ]),
    sagT1: selector([labelHas(['t1']), plane('sagittal', 10, true)]),
    // Axial T2 preferred; any axial series rather than an empty pane.
    axT2: selector([labelHas(['t2', 'tse', 'fse'], 10, false), plane('axial', 10, true)]),
  },
  stages: [
    {
      name: 'Sag T2, Sag T1, Ax T2',
      viewportStructure: grid(1, 3),
      // Sagittals open at the midline (image 1 is the far lateral slice); the axial at its top.
      viewports: [
        fromMiddle('sagT2', spineSagSync),
        fromMiddle('sagT1', spineSagSync),
        stack('axT2'),
      ],
    },
  ],
};

const mrGeneralSync = [sliceSync('mrGeneralSlice')];
const nth = (n: number) => ({
  ...stack('mrSeries', mrGeneralSync),
  displaySets: [{ id: 'mrSeries', matchedDisplaySetsIndex: n }],
});

/** Any other MR: first four image series side by side; same-plane panes scroll together. */
export const hpMrGeneral: Types.HangingProtocol.Protocol = {
  ...base,
  id: '@axialscope/mrGeneral',
  name: 'MR 2x2',
  description: 'MR: first four image series',
  protocolMatchingRules: [modality('MR')],
  displaySetSelectors: { anySeries, mrSeries: selector([]) },
  // Grid sized to the series available (first stage whose panes all match).
  stages: [
    [2, 2],
    [1, 3],
    [1, 2],
    [1, 1],
  ].map(([rows, columns]) => ({
    name: `MR ${rows}x${columns}`,
    stageActivation: { enabled: { minViewportsMatched: rows * columns } },
    viewportStructure: grid(rows, columns),
    viewports: Array.from({ length: rows * columns }, (_, i) => nth(i)),
  })),
};

export default [hpCtBody, hpPetCt, hpMrBrain, hpMrSpine, hpMrGeneral];
