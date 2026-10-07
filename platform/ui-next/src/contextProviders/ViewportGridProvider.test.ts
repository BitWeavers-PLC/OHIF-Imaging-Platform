import { determineActiveViewportId } from './ViewportGridProvider';

const pane = (viewportId: string, displaySetInstanceUIDs: string[] = []) => ({
  viewportId,
  displaySetInstanceUIDs,
  viewportOptions: { viewportId },
});

describe('determineActiveViewportId', () => {
  it('picks the first pane when every new pane is empty (localizer-only study)', () => {
    const state = {
      activeViewportId: 'default',
      viewports: new Map([['default', pane('default', ['a'])]]),
    };
    const empty = new Map([
      ['p1', pane('p1')],
      ['p2', pane('p2')],
    ]);
    expect(determineActiveViewportId(state as any, empty as any)).toBe('p1');
  });

  it('prefers the pane still showing the active series', () => {
    const state = {
      activeViewportId: 'default',
      viewports: new Map([['default', pane('default', ['b'])]]),
    };
    const next = new Map([
      ['p1', pane('p1', ['a'])],
      ['p2', pane('p2', ['b'])],
    ]);
    expect(determineActiveViewportId(state as any, next as any)).toBe('p2');
  });
});
