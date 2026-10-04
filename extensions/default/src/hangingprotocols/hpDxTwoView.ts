import { Types } from '@ohif/core';
import { seriesWithImages } from './utils/seriesSelectors';
import { viewportOptions } from './utils/viewportOptions';

/**
 * Fork: radiographs (CR/DX) with 2+ image series open side-by-side (e.g. PA + lateral).
 * Single-series radiographs fall through to 'default'.
 */
const hpDxTwoView: Types.HangingProtocol.Protocol = {
  id: '@ohif/dxTwoView',
  name: 'Radiograph 2-up',
  description: 'CR/DX: first two image series side-by-side',
  protocolMatchingRules: [
    {
      id: 'Radiography',
      weight: 100,
      attribute: 'ModalitiesInStudy',
      constraint: { contains: ['CR', 'DX'] },
      required: true,
    },
    {
      id: 'twoImageSeries',
      attribute: 'numberOfDisplaySetsWithImages',
      // OHIF's greaterThan is ">=": 2 means two or more (a single film opens 1-up).
      constraint: { greaterThan: { value: 2 } },
      required: true,
    },
  ],
  toolGroupIds: ['default'],
  displaySetSelectors: {
    dxDisplaySetId: {
      allowUnmatchedView: true,
      seriesMatchingRules: seriesWithImages,
    },
  },
  defaultViewport: {
    viewportOptions: { ...viewportOptions, viewportType: 'stack' },
    displaySets: [{ id: 'dxDisplaySetId', matchedDisplaySetsIndex: -1 }],
  },
  stages: [
    {
      name: '1x2',
      viewportStructure: {
        layoutType: 'grid',
        properties: { rows: 1, columns: 2 },
      },
      viewports: [
        { viewportOptions, displaySets: [{ id: 'dxDisplaySetId' }] },
        { viewportOptions, displaySets: [{ id: 'dxDisplaySetId', matchedDisplaySetsIndex: 1 }] },
      ],
    },
  ],
};

export default hpDxTwoView;
