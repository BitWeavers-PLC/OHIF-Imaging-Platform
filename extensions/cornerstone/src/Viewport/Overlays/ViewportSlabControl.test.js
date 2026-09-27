import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Enums } from '@cornerstonejs/core';
import ViewportSlabControl from './ViewportSlabControl';

jest.mock('@ohif/ui-next', () => {
  const React = require('react');
  return {
    Slider: ({ value, onValueChange, min, max }) =>
      React.createElement('input', {
        type: 'range',
        'aria-label': 'Slab thickness',
        min,
        max,
        value: value[0],
        onChange: e => onValueChange([Number(e.target.value)]),
      }),
  };
});

jest.mock('@cornerstonejs/core', () => {
  const actual = jest.requireActual('@cornerstonejs/core');
  return {
    ...actual,
    cache: { getVolume: () => ({ dimensions: [100, 100, 0], spacing: [3, 4, 1] }) }, // diagonal 500
  };
});

function setup(blendMode = Enums.BlendModes.MAXIMUM_INTENSITY_BLEND, thickness = 20) {
  const viewport = {
    type: Enums.ViewportType.ORTHOGRAPHIC,
    getBlendMode: jest.fn(() => blendMode),
    getSlabThickness: jest.fn(() => thickness),
    getVolumeId: () => 'vol',
    setBlendMode: jest.fn(),
    setSlabThickness: jest.fn(),
    resetSlabThickness: jest.fn(),
    render: jest.fn(),
  };
  const element = document.createElement('div');
  const servicesManager = {
    services: { cornerstoneViewportService: { getCornerstoneViewport: () => viewport } },
  };
  render(React.createElement(ViewportSlabControl, { viewportId: 'v1', element, servicesManager }));
  return { viewport, element };
}

describe('ViewportSlabControl', () => {
  it('shows the current slab and drags thickness', () => {
    const { viewport } = setup();
    expect(screen.getByText('20 mm')).toBeTruthy();
    expect(screen.getByLabelText('Slab thickness').getAttribute('max')).toBe('500');

    fireEvent.change(screen.getByLabelText('Slab thickness'), { target: { value: '35' } });
    expect(viewport.setSlabThickness).toHaveBeenCalledWith(35);
    expect(viewport.render).toHaveBeenCalled();
  });

  it('switches off to a thin slice and hides on the next render', () => {
    const { viewport, element } = setup();
    fireEvent.change(screen.getByLabelText('Projection'), { target: { value: '' } });
    expect(viewport.setBlendMode).toHaveBeenCalledWith(Enums.BlendModes.COMPOSITE);
    expect(viewport.resetSlabThickness).toHaveBeenCalled();

    viewport.getBlendMode.mockReturnValue(Enums.BlendModes.COMPOSITE);
    act(() => {
      element.dispatchEvent(new Event(Enums.Events.IMAGE_RENDERED));
    });
    expect(screen.queryByLabelText('Slab thickness')).toBeNull();
  });

  it('labels a full-volume slab as Full', () => {
    setup(Enums.BlendModes.MAXIMUM_INTENSITY_BLEND, 600);
    expect(screen.getByText('Full')).toBeTruthy();
  });
});
