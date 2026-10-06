import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../Accordion/Accordion';
import { cn } from '../../lib/utils';
import { Icons } from '../Icons/Icons';

interface PanelSectionProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

interface PanelSectionHeaderProps {
  children: React.ReactNode;
  className?: string;
  showChevron?: boolean;
}

interface PanelSectionContentProps {
  children: React.ReactNode;
  className?: string;
}

export const PanelSection: React.FC<PanelSectionProps> & {
  Header: React.FC<PanelSectionHeaderProps>;
  Content: React.FC<PanelSectionContentProps>;
} = ({ children, defaultOpen = true, className, ...props }) => {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? 'item' : undefined}
      className={cn('flex-shrink-0 overflow-hidden', className)}
      {...props}
    >
      <AccordionItem
        value="item"
        className="border-none"
      >
        {children}
      </AccordionItem>
    </Accordion>
  );
};

PanelSection.Header = ({ children, className }) => (
  <AccordionTrigger
    // Fork: flat section bar (series strip style): small caps label, muted chevron, no red hover.
    className={cn(
      'bg-card hover:bg-muted text-muted-foreground border-border border-b',
      'flex h-7 w-full items-center justify-between rounded-none py-1 pr-1.5 pl-2',
      'text-[11px] font-semibold uppercase tracking-wider',
      '[&>svg]:text-muted-foreground [&>svg]:h-3.5 [&>svg]:w-3.5',
      className
    )}
  >
    {children}
  </AccordionTrigger>
);

PanelSection.Header.displayName = 'PanelSection.Header';

PanelSection.Content = ({ children, className }) => (
  <AccordionContent className={cn('overflow-hidden p-0', className)}>
    <div>{children}</div>
  </AccordionContent>
);

PanelSection.Content.displayName = 'PanelSection.Content';
