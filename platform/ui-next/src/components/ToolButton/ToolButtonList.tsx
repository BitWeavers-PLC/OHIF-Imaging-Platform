import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '../Button';
import { Icons } from '../Icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { cn } from '../../lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip';

/**
 * ToolButtonList Component
 * Root component that wraps the default and dropdown sections
 * -----------------------------------------------
 */
interface ToolButtonListProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const ToolButtonList = React.forwardRef<HTMLDivElement, ToolButtonListProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        // Fork: button and arrow read as one control (shared hover), no divider line.
        className={cn('hover:bg-muted flex items-center rounded-sm', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ToolButtonList.displayName = 'ToolButtonList';

/**
 * ToolButtonListDefault Component
 * Container for the default/primary tool button
 * -----------------------------------------------
 */
interface ToolButtonListDefaultProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  tooltip?: string;
  disabledText?: string;
  disabled?: boolean;
}

const ToolButtonListDefault = React.forwardRef<HTMLDivElement, ToolButtonListDefaultProps>(
  ({ className, children, tooltip, disabledText, disabled, ...props }, ref) => {
    const hasTooltip = tooltip || disabledText;

    const defaultContent = (
      <div
        ref={ref}
        className={cn('flex items-center', className)}
        {...props}
      >
        {children}
      </div>
    );

    if (!hasTooltip) {
      return defaultContent;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>{defaultContent}</span>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {tooltip && <div>{tooltip}</div>}
          {disabledText && disabled && <div className="text-muted-foreground">{disabledText}</div>}
        </TooltipContent>
      </Tooltip>
    );
  }
);
ToolButtonListDefault.displayName = 'ToolButtonListDefault';

/**
 * ToolButtonListDropDown Component
 * Container for the dropdown section with trigger and content
 * -----------------------------------------------
 */
interface ToolButtonListDropDownProps {
  children: React.ReactNode;
  className?: string;
  // Fork: passed to the DropdownMenu so a list can be opened on hover (More tools).
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  // Fork: replaces the chevron as the menu's trigger (More tools is one button, no split).
  trigger?: React.ReactNode;
  /** Fork: props for the menu panel itself (e.g. hover tracking that covers the scroll strips). */
  contentProps?: React.HTMLAttributes<HTMLDivElement>;
}

/**
 * Fork: a long menu scrolls by resting the mouse on a strip at its top or bottom (as in
 * desktop menus) instead of showing a scrollbar; the wheel and arrow keys still scroll too.
 */
const SCROLL_PX_PER_SECOND = 360; // the same speed on 60 Hz and 120 Hz screens
function HoverScrollArea({ children }: { children: React.ReactNode }) {
  const areaRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [edges, setEdges] = useState({ up: false, down: false });

  const update = useCallback(() => {
    const area = areaRef.current;
    if (!area) {
      return;
    }
    const up = area.scrollTop > 0;
    const down = area.scrollTop + area.clientHeight < area.scrollHeight - 1;
    setEdges(previous => (previous.up === up && previous.down === down ? previous : { up, down }));
  }, []);

  const stop = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const start = (direction: number) => {
    stop();
    let last: number | null = null;
    const step = (now: number) => {
      const area = areaRef.current;
      if (!area) {
        return;
      }
      if (last !== null) {
        area.scrollTop += (direction * SCROLL_PX_PER_SECOND * Math.max(0, now - last)) / 1000;
      }
      last = now;
      update();
      // The strip disappears at the end, so its mouseleave may never come: stop there.
      const atEnd =
        direction > 0
          ? area.scrollTop + area.clientHeight >= area.scrollHeight - 1
          : area.scrollTop <= 0;
      frameRef.current = atEnd ? null : requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
  };

  useLayoutEffect(() => {
    update();
    const area = areaRef.current;
    if (!area) {
      return;
    }
    const observer = new ResizeObserver(update);
    observer.observe(area);
    if (area.firstElementChild) {
      observer.observe(area.firstElementChild);
    }
    return () => observer.disconnect();
  }, [update]);

  useEffect(() => stop, [stop]);

  const strip = (direction: number) => (
    <div
      aria-hidden
      data-cy={direction > 0 ? 'menu-scroll-down' : 'menu-scroll-up'}
      className="text-muted-foreground hover:text-foreground hover:bg-muted/60 flex h-5 shrink-0 cursor-default items-center justify-center rounded-sm"
      onMouseEnter={() => start(direction)}
      onMouseLeave={stop}
    >
      <Icons.ByName
        name="chevron-down"
        className={cn('h-3.5 w-3.5', direction < 0 && 'rotate-180')}
      />
    </div>
  );

  return (
    <>
      {edges.up && strip(-1)}
      <div
        ref={areaRef}
        onScroll={update}
        className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      {edges.down && strip(1)}
    </>
  );
}

const ToolButtonListDropDown = React.forwardRef<HTMLDivElement, ToolButtonListDropDownProps>(
  ({ children, className, trigger, contentProps, ...props }, ref) => (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'inline-flex h-9 w-4 items-center justify-center text-current opacity-75',
              'hover:bg-transparent hover:text-current hover:opacity-100',
              '!rounded-tr-sm !rounded-br-sm !rounded-tl-none !rounded-bl-none',
              'bg-transparent',
              className
            )}
          >
            <Icons.ByName
              name="chevron-down"
              className="h-3.5 w-3.5"
            />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        ref={ref}
        side="bottom"
        align="start"
        alignOffset={trigger ? 0 : -40}
        // Fork: a long list (More on a small window) stays within the space below the bar and
        // scrolls by hovering the strips at its ends (no scrollbar).
        collisionPadding={8}
        className="flex max-h-[var(--radix-dropdown-menu-content-available-height)] flex-col overflow-hidden"
        {...contentProps}
      >
        <HoverScrollArea>{children}</HoverScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
);
ToolButtonListDropDown.displayName = 'ToolButtonListDropDown';

/**
 * ToolButtonListItem Component
 * Individual item in the dropdown menu
 * -----------------------------------------------
 */
interface ToolButtonListItemProps extends React.ComponentProps<typeof DropdownMenuItem> {
  icon?: string;
  children?: React.ReactNode;
  className?: string;
  disabledText?: string;
  tooltip?: string;
}

const ToolButtonListItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuItem>,
  ToolButtonListItemProps
>(({ className, children, icon, disabledText, tooltip, disabled, ...props }, ref) => {
  const defaultTooltip = tooltip || (typeof children === 'string' ? children : undefined);

  const menuItem = (
    <DropdownMenuItem
      ref={ref}
      className={cn('flex items-center space-x-2', className)}
      disabled={disabled}
      {...props}
    >
      {icon && (
        <Icons.ByName
          name={icon || 'MissingIcon'}
          className="h-6 w-6"
        />
      )}
      {children}
    </DropdownMenuItem>
  );

  // Todo: there is a weird issue where i can't control the duration of the delay
  // for the items in this list, causing the tooltip to show up too early in the
  // dropdown menu. So i'm just removing the tooltip for list items unless the disabledText is set.
  if (!disabled) {
    return menuItem;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>{menuItem}</span>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {defaultTooltip && <div>{defaultTooltip}</div>}
        {disabledText && disabled && <div className="text-muted-foreground">{disabledText}</div>}
      </TooltipContent>
    </Tooltip>
  );
});
ToolButtonListItem.displayName = 'ToolButtonListItem';

/**
 * ToolButtonListDivider Component
 * Divider between items in the dropdown menu
 * -----------------------------------------------
 */
const ToolButtonListDivider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('bg-primary h-5 w-px self-center', className)}
    {...props}
  />
));
ToolButtonListDivider.displayName = 'ToolButtonListDivider';

export {
  ToolButtonList,
  ToolButtonListDefault,
  ToolButtonListDropDown,
  ToolButtonListItem,
  ToolButtonListDivider,
};
