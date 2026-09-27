import { Types } from '@ohif/core';
import i18n from 'i18next';

const defaultDisplaySetSelector = {
  studyMatchingRules: [
    {
      // The priorInstance is a study counter that indicates what position this study is in
      // and the value comes from the options parameter.
      attribute: 'studyInstanceUIDsIndex',
      from: 'options',
      required: true,
      constraint: {
        equals: { value: 0 },
      },
    },
  ],
  seriesMatchingRules: [
    {
      attribute: 'numImageFrames',
      constraint: {
        greaterThan: { value: 0 },
      },
    },
    // Fork: real image series (not the scout/dose sheet) first.
    { attribute: 'isLocalizer', weight: 10, constraint: { equals: { value: false } } },
    { attribute: 'isReconstructable', weight: 2, constraint: { equals: { value: true } } },
    // This display set will select the specified items by preference
    // It has no affect if nothing is specified in the URL.
    {
      attribute: 'isDisplaySetFromUrl',
      weight: 20,
      constraint: {
        equals: true,
      },
    },
  ],
};

const priorDisplaySetSelector = {
  studyMatchingRules: [
    {
      // The priorInstance is a study counter that indicates what position this study is in
      // and the value comes from the options parameter.
      attribute: 'studyInstanceUIDsIndex',
      from: 'options',
      required: true,
      constraint: {
        equals: { value: 1 },
      },
    },
  ],
  seriesMatchingRules: [
    {
      attribute: 'numImageFrames',
      constraint: {
        greaterThan: { value: 0 },
      },
    },
    // Fork: the prior's series that matches one of the current study's (e.g. same CT recon).
    { attribute: 'sameSeriesAsCurrent', weight: 15, constraint: { equals: { value: true } } },
    // Fork: real image series (not the scout/dose sheet) first.
    { attribute: 'isLocalizer', weight: 10, constraint: { equals: { value: false } } },
    { attribute: 'isReconstructable', weight: 2, constraint: { equals: { value: true } } },
    // This display set will select the specified items by preference
    // It has no affect if nothing is specified in the URL.
    {
      attribute: 'isDisplaySetFromUrl',
      weight: 20,
      constraint: {
        equals: true,
      },
    },
  ],
};

const currentDisplaySet = {
  id: 'defaultDisplaySetId',
};

const priorDisplaySet = {
  id: 'priorDisplaySetId',
};

// Fork: current and prior scroll together (by position, see linkViewportsAtCurrentPosition)
// and each current/prior pair shares window/level.
const compareViewport = (displaySet, pair: number) => ({
  viewportOptions: {
    toolGroupId: 'default',
    allowUnmatchedView: true,
    syncGroups: [
      { type: 'imageSlice', id: 'compareSlice', source: true, target: true },
      { type: 'voi', id: `compareVoi${pair}`, source: true, target: true },
    ],
  },
  displaySets: [{ ...displaySet, matchedDisplaySetsIndex: pair }],
});

const currentViewport0 = compareViewport(currentDisplaySet, 0);
const currentViewport1 = compareViewport(currentDisplaySet, 1);
const priorViewport0 = compareViewport(priorDisplaySet, 0);
const priorViewport1 = compareViewport(priorDisplaySet, 1);

/**
 * This hanging protocol can be activated on the primary mode by directly
 * referencing it in a URL or by directly including it within a mode, e.g.:
 * `&hangingProtocolId=@ohif/mnGrid` added to the viewer URL
 * It is not included in the viewer mode by default.
 */
const hpMNCompare: Types.HangingProtocol.Protocol = {
  id: '@ohif/hpCompare',
  description: i18n.t('Hps:Compare two studies in various layouts'),
  name: i18n.t('Hps:Compare Two Studies'),
  numberOfPriorsReferenced: 1,
  protocolMatchingRules: [
    {
      id: 'Two Studies',
      weight: 1000,
      // is there a second study or in another work the attribute
      // studyInstanceUIDsIndex that we get from prior should not be null
      attribute: 'StudyInstanceUID',
      from: 'prior',
      required: true,
      constraint: {
        notNull: true,
      },
    },
  ],
  toolGroupIds: ['default'],
  displaySetSelectors: {
    defaultDisplaySetId: defaultDisplaySetSelector,
    priorDisplaySetId: priorDisplaySetSelector,
  },
  defaultViewport: {
    viewportOptions: {
      viewportType: 'stack',
      toolGroupId: 'default',
      allowUnmatchedView: true,
    },
    displaySets: [
      {
        id: 'defaultDisplaySetId',
        matchedDisplaySetsIndex: -1,
      },
    ],
  },
  // Fork: current | prior first; '.' (next stage) shows two series of each.
  stages: [
    {
      name: '2x1',
      stageActivation: {
        enabled: {
          minViewportsMatched: 2,
        },
      },
      viewportStructure: {
        layoutType: 'grid',
        properties: {
          rows: 1,
          columns: 2,
        },
      },
      viewports: [currentViewport0, priorViewport0],
    },
    {
      name: '2x2',
      stageActivation: {
        enabled: {
          minViewportsMatched: 4,
        },
      },
      viewportStructure: {
        layoutType: 'grid',
        properties: {
          rows: 2,
          columns: 2,
        },
      },
      viewports: [currentViewport0, priorViewport0, currentViewport1, priorViewport1],
    },
  ],
};

export default hpMNCompare;
