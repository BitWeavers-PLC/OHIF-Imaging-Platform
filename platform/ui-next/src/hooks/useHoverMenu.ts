import { useEffect, useRef, useState } from 'react';

/**
 * Fork: a menu that opens when the mouse rests on its button and stays open while the mouse
 * is over the button or the menu. The open delay stops menus flashing open as the mouse
 * sweeps across the toolbar; the close delay lets it cross the gap into the menu.
 * Spread `hoverProps` on the button and on the menu content; `setOpen` serves clicks.
 */
export default function useHoverMenu({ openDelay = 150, closeDelay = 250 } = {}) {
  const [open, setOpenState] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const setOpen = (next: boolean | ((open: boolean) => boolean)) => {
    clearTimeout(timer.current);
    setOpenState(next);
  };
  const later = (next: boolean, delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpenState(next), delay);
  };

  return {
    open,
    setOpen,
    hoverProps: {
      onMouseEnter: () => (open ? clearTimeout(timer.current) : later(true, openDelay)),
      onMouseLeave: () => later(false, closeDelay),
    },
  };
}
