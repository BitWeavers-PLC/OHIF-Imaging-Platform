import { act } from 'react';
import { renderHook } from '@testing-library/react';
import useHoverMenu from '../../../../platform/ui-next/src/hooks/useHoverMenu';

describe('useHoverMenu', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('opens only after the mouse rests, and a quick pass does not open it', () => {
    const { result } = renderHook(() => useHoverMenu());
    act(() => result.current.hoverProps.onMouseEnter());
    act(() => result.current.hoverProps.onMouseLeave()); // swept past
    act(() => jest.advanceTimersByTime(500));
    expect(result.current.open).toBe(false);

    act(() => result.current.hoverProps.onMouseEnter());
    act(() => jest.advanceTimersByTime(150));
    expect(result.current.open).toBe(true);
  });

  it('stays open while moving from the button into the menu, closes after leaving', () => {
    const { result } = renderHook(() => useHoverMenu());
    act(() => result.current.setOpen(true));
    act(() => result.current.hoverProps.onMouseLeave()); // leaves the button…
    act(() => jest.advanceTimersByTime(100));
    act(() => result.current.hoverProps.onMouseEnter()); // …enters the menu
    act(() => jest.advanceTimersByTime(500));
    expect(result.current.open).toBe(true);

    act(() => result.current.hoverProps.onMouseLeave());
    act(() => jest.advanceTimersByTime(250));
    expect(result.current.open).toBe(false);
  });
});
