import React from 'react';
import { Toaster as Sonner } from 'sonner';
import { Icons } from '../Icons';

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Fork: compact dark card with a status-coloured bar on the left (theme tokens), instead of
 * Sonner's saturated "rich colors" boxes. Top-right, below the header, clear of the
 * bottom-corner image overlays.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      loadingIcon={<Icons.LoadingSpinner />}
      icons={{
        warning: <Icons.StatusWarning />,
        info: <Icons.Info className="text-primary" />,
        success: <Icons.StatusSuccess />,
        error: <Icons.StatusError />,
      }}
      theme="dark"
      // Below the 44px header, close to the right edge (also on narrow windows).
      offset={{ top: 56, right: 12 }}
      mobileOffset={{ top: 56, right: 12, left: 12 }}
      closeButton
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'group relative flex w-[380px] items-start gap-3 rounded-sm border border-l-4 border-border border-l-primary bg-popover p-3 pr-8 text-popover-foreground shadow-lg',
          error: '!border-l-[hsl(var(--error-text))]',
          warning: '!border-l-[hsl(var(--warning-text))]',
          success: '!border-l-[hsl(var(--success-text))]',
          icon: 'mt-0.5 shrink-0 [&>svg]:h-4 [&>svg]:w-4',
          content: 'flex min-w-0 flex-1 flex-col gap-0.5',
          title: 'text-sm font-medium leading-snug',
          description: 'text-xs text-muted-foreground',
          actionButton:
            'mt-1 self-start bg-transparent p-0 text-xs text-primary hover:underline focus:outline-none',
          // Sonner's own stylesheet styles the close button; override it (!).
          closeButton:
            '!absolute !right-2 !top-2 !left-auto !h-5 !w-5 !transform-none !rounded-sm !border-0 !bg-transparent !text-muted-foreground hover:!text-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
