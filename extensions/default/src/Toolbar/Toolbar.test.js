import React from 'react';
import { render } from '@testing-library/react';

let mockButtons = [];
jest.mock('@ohif/core', () => ({
  useToolbar: () => ({
    toolbarButtons: mockButtons,
    onInteraction: () => {},
    isItemOpen: () => false,
    isItemLocked: () => false,
    openItem: () => {},
    closeItem: () => {},
    toggleLock: () => {},
  }),
  useSystem: () => ({ servicesManager: { services: { toolbarService: {} } } }),
}));
jest.mock('./ToolButtonListWrapper', () => () => null);

const { Toolbar } = require('./Toolbar');

describe('Toolbar', () => {
  it('can gain buttons after rendering empty (hooks stay in order, no React #310)', () => {
    const view = render(React.createElement(Toolbar, { buttonSection: 'viewportCorner' }));
    mockButtons = [
      {
        id: 'orientationMenu',
        Component: () => React.createElement('span', null, 'menu'),
        componentProps: {},
      },
    ];
    expect(() =>
      view.rerender(React.createElement(Toolbar, { buttonSection: 'viewportCorner' }))
    ).not.toThrow();
    expect(view.container.textContent).toContain('menu');
  });
});
