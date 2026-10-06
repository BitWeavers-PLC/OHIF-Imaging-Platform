import { nextCursor } from './annotationHoverCursor';

describe('annotation hover cursor', () => {
  const browse = 'url(browse.svg), auto';

  it('shows "move" over a measurement and restores the tool cursor after', () => {
    const over = nextCursor({
      current: browse,
      saved: null,
      overAnnotation: true,
      toolTakesClick: false,
    });
    expect(over).toEqual({ cursor: 'move', saved: browse });
    const still = nextCursor({
      current: 'move',
      saved: browse,
      overAnnotation: true,
      toolTakesClick: false,
    });
    expect(still).toEqual({ cursor: 'move', saved: browse });
    const off = nextCursor({
      current: 'move',
      saved: browse,
      overAnnotation: false,
      toolTakesClick: false,
    });
    expect(off).toEqual({ cursor: browse, saved: null });
  });

  it('never shows "move" when the active tool takes the click (brush)', () => {
    expect(
      nextCursor({ current: 'none', saved: null, overAnnotation: true, toolTakesClick: true })
        .cursor
    ).toBe('none');
  });

  it('leaves a cursor set by a tool switch alone', () => {
    const switched = nextCursor({
      current: 'crosshair',
      saved: browse,
      overAnnotation: false,
      toolTakesClick: false,
    });
    expect(switched).toEqual({ cursor: 'crosshair', saved: null });
  });
});
