import { Types } from '@ohif/core';
import i18n from 'i18next';

import { HYDRATE_SEG_SYNC_GROUP, VOI_SYNC_GROUP } from './mpr';

export const mip: Types.HangingProtocol.Protocol = {
  id: 'mip',
  name: i18n.t('Hps:MIP'),
  locked: true,
  icon: 'layout-advanced-mpr',
  isPreset: true,
  createdDate: '2026-05-08',
  modifiedDate: '2026-05-08',
  availableTo: {},
  editableBy: {},
  numberOfPriorsReferenced: 0,
  protocolMatchingRules: [],
  // Fork: load nearest-first to where the reader is (readerFirstLoader).
  imageLoadStrategy: 'readerFirst',
  callbacks: {},
  displaySetSelectors: {
    activeDisplaySet: {
      seriesMatchingRules: [
        {
          weight: 1,
          attribute: 'isReconstructable',
          constraint: {
            equals: {
              value: true,
            },
          },
          required: true,
        },
      ],
    },
  },
  stages: [
    {
      name: 'MIP 2x2',
      viewportStructure: {
        layoutType: 'grid',
        properties: {
          rows: 2,
          columns: 2,
        },
      },
      viewports: [
        {
          viewportOptions: {
            viewportId: 'mip-axial',
            toolGroupId: 'mpr',
            viewportType: 'volume',
            orientation: 'axial',
            initialImageOptions: {
              preset: 'middle',
            },
            syncGroups: [VOI_SYNC_GROUP, HYDRATE_SEG_SYNC_GROUP],
          },
          displaySets: [
            {
              id: 'activeDisplaySet',
            },
          ],
        },
        {
          viewportOptions: {
            viewportId: 'mip-mip',
            // Rotating MIP: wheel rotates, click jumps the MPR viewports (modes/basic initToolGroups).
            toolGroupId: 'mip',
            viewportType: 'volume',
            orientation: 'coronal',
            initialImageOptions: {
              preset: 'middle',
            },
            // Own window (CT angio, openAtReadingPosition): the MPR views keep soft tissue.
            syncGroups: [HYDRATE_SEG_SYNC_GROUP],
          },
          displaySets: [
            {
              id: 'activeDisplaySet',
              options: {
                blendMode: 'MIP',
                slabThickness: 'fullVolume',
              },
            },
          ],
        },
        {
          viewportOptions: {
            viewportId: 'mip-coronal',
            toolGroupId: 'mpr',
            viewportType: 'volume',
            orientation: 'coronal',
            initialImageOptions: {
              preset: 'middle',
            },
            syncGroups: [VOI_SYNC_GROUP, HYDRATE_SEG_SYNC_GROUP],
          },
          displaySets: [
            {
              id: 'activeDisplaySet',
            },
          ],
        },
        {
          viewportOptions: {
            viewportId: 'mip-sagittal',
            toolGroupId: 'mpr',
            viewportType: 'volume',
            orientation: 'sagittal',
            initialImageOptions: {
              preset: 'middle',
            },
            syncGroups: [VOI_SYNC_GROUP, HYDRATE_SEG_SYNC_GROUP],
          },
          displaySets: [
            {
              id: 'activeDisplaySet',
            },
          ],
        },
      ],
    },
  ],
};
