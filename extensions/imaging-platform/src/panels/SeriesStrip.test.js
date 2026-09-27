import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SeriesStrip from './SeriesStrip';

jest.mock('react-dnd', () => ({ useDrag: () => [{}, () => {}] }));

const ds = (uid, seriesNumber, modality, numInstances, description) => ({
  displaySetInstanceUID: uid,
  seriesNumber,
  modality,
  numInstances,
  description,
});

const tabs = [
  {
    name: 'all',
    studies: [
      {
        studyInstanceUid: 'prior',
        date: '01-Jan-1959',
        description: 'OLD CHEST',
        modalities: 'CT',
        displaySets: [ds('p1', 1, 'CT', 50, 'OLD')],
      },
      {
        studyInstanceUid: 'current',
        date: '16-Jan-1960',
        description: 'LUNG',
        modalities: 'CT\\PT',
        displaySets: [ds('c1', 2, 'CT', 135, 'CT IMAGES'), ds('c2', 1, 'PT', 135, 'PET AC')],
      },
    ],
  },
];

function setup() {
  const props = {
    tabs,
    expandedStudyInstanceUIDs: ['current'],
    primaryStudyInstanceUIDs: ['current'],
    activeDisplaySetInstanceUIDs: ['c1'],
    onClickStudy: jest.fn(),
    onDoubleClickThumbnail: jest.fn(),
  };
  render(React.createElement(SeriesStrip, props));
  return props;
}

describe('SeriesStrip', () => {
  it('lists the current study first, expanded, with overlaid series info', () => {
    setup();
    const headers = screen.getAllByText(/16-Jan-1960|01-Jan-1959/).map(n => n.textContent);
    expect(headers).toEqual(['16-Jan-1960', '01-Jan-1959']);
    expect(screen.getByText('S2 CT')).toBeTruthy();
    expect(screen.getAllByText('135')).toHaveLength(2);
    expect(screen.getByText(/Prior · OLD CHEST/)).toBeTruthy();
    expect(screen.queryByText('S1 CT')).toBeNull(); // prior is collapsed
  });

  it('marks the active series and loads on double-click', () => {
    const props = setup();
    const tiles = screen.getAllByTitle(/CT IMAGES|PET AC/);
    expect(tiles[0].getAttribute('data-active')).toBe('true');
    expect(tiles[1].getAttribute('data-active')).toBe('false');
    fireEvent.doubleClick(tiles[1]);
    expect(props.onDoubleClickThumbnail).toHaveBeenCalledWith('c2');
  });

  it('expands a prior through onClickStudy', () => {
    const props = setup();
    fireEvent.click(screen.getByText(/Prior · OLD CHEST/));
    expect(props.onClickStudy).toHaveBeenCalledWith('prior');
  });
});
