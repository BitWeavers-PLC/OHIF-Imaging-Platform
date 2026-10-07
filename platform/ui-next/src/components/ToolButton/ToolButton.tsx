import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip';
import { Button } from '../Button';
import { cn } from '../../lib/utils';
import { useIconPresentation } from '../../contextProviders/IconPresentationProvider';
import { ToolbarGlyph, captionedButtonClass } from './ToolbarGlyph';

const baseClasses = '!rounded-sm inline-flex items-center justify-center';
const defaultClasses = 'bg-transparent text-foreground/80 hover:bg-muted hover:text-foreground';
const activeClasses = 'bg-primary text-primary-foreground hover:!bg-primary/90';
const disabledClasses =
  'text-foreground hover:bg-muted hover:text-foreground opacity-40 cursor-not-allowed';

const sizeClasses = {
  default: {
    buttonSizeClass: 'h-9 w-9',
    iconSizeClass: 'h-6 w-6',
  },
  small: {
    buttonSizeClass: 'h-8 w-8',
    iconSizeClass: 'h-5 w-5',
  },
  tiny: {
    buttonSizeClass: 'w-6 h-6',
    iconSizeClass: 'h-4 w-4',
  },
};

interface ToolButtonProps {
  id: string;
  icon?: string;
  label?: string;
  tooltip?: string;
  size?: 'default' | 'small';
  isActive?: boolean;
  disabled?: boolean;
  disabledText?: string;
  commands?: Record<string, unknown>;
  onInteraction?: (details: { itemId: string; commands?: Record<string, unknown> }) => void;
  className?: string;
  children?: React.ReactNode;
  /** Fork: key bound to this button, shown in the tooltip. */
  shortcut?: string;
  /** Fork: suppress the tooltip (e.g. while the button's hover menu is open over it). */
  hideTooltip?: boolean;
  /** Fork: short text under the icon in the header toolbar (falls back to the label). */
  caption?: string;
  /** Fork: the button opens a menu (corner mark in the header toolbar). */
  hasMenu?: boolean;
}

function ToolButton(props: ToolButtonProps) {
  const {
    id,
    icon = 'MissingIcon',
    label,
    tooltip,
    size = 'default',
    disabled = false,
    isActive = false,
    disabledText,
    commands,
    onInteraction,
    className,
    children,
    shortcut,
    hideTooltip = false,
    caption,
    hasMenu = false,
  } = props;

  const { className: iconClassName, showLabels } = useIconPresentation();
  const { buttonSizeClass, iconSizeClass } = sizeClasses[size] || sizeClasses.default;

  const buttonClasses = cn(
    baseClasses,
    buttonSizeClass,
    showLabels && !children && captionedButtonClass,
    disabled ? disabledClasses : isActive ? activeClasses : defaultClasses,
    className
  );

  const defaultTooltip = label;
  const disabledTooltip = disabled && disabledText ? disabledText : null;
  const hasSecondaryTooltip = tooltip || disabledTooltip;

  // Fork: with a caption under the icon the name is already on screen; the tooltip then gives
  // only the shortcut key (or why the button is disabled), after a longer pause, and none
  // when there is neither.
  const captioned = showLabels && !children;
  const detail = captioned ? disabledTooltip : disabledTooltip || tooltip;
  const showTooltip = captioned
    ? Boolean(detail || shortcut)
    : hasSecondaryTooltip || defaultTooltip;

  return (
    <Tooltip
      open={hideTooltip || !showTooltip ? false : undefined}
      delayDuration={captioned ? 700 : undefined}
    >
      <TooltipTrigger
        asChild
        className={cn(disabled && 'cursor-not-allowed')}
      >
        {/* TooltipTrigger is a span since a disabled button does not fire events and the tooltip
        will not show. */}
        {/* Fork: inline-flex so the span is as tall as the button; inline, its box ended
            mid-button and the tooltip sat over the caption. */}
        <span
          className="inline-flex"
          data-cy={id}
          data-tool={id}
          data-active={isActive}
        >
          <Button
            className={buttonClasses}
            onClick={() => {
              if (!disabled) {
                onInteraction?.({ itemId: id, commands });
              }
            }}
            variant="ghost"
            size="icon"
            aria-label={defaultTooltip}
            disabled={disabled}
            name={id}
          >
            {children || (
              <ToolbarGlyph
                icon={icon}
                caption={caption ?? label}
                hasMenu={hasMenu}
                iconClassName={iconClassName || iconSizeClass}
              />
            )}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        sideOffset={6}
        className="text-wrap w-auto max-w-sm whitespace-normal break-words"
      >
        {showTooltip && captioned && (
          <div className="flex items-center justify-between gap-4 text-xs">
            {detail && <span>{detail}</span>}
            {shortcut && <kbd className="text-muted-foreground font-mono">{shortcut}</kbd>}
          </div>
        )}
        {showTooltip && !captioned && (
          <div className="space-y-1">
            {defaultTooltip && (
              <div className="flex items-center justify-between gap-4 text-sm">
                <span>{defaultTooltip}</span>
                {shortcut && (
                  <kbd className="text-muted-foreground font-mono text-xs">{shortcut}</kbd>
                )}
              </div>
            )}
            {disabledTooltip ? (
              <div className="text-muted-foreground text-xs">{disabledTooltip}</div>
            ) : (
              tooltip && <div className="text-muted-foreground text-xs">{tooltip}</div>
            )}
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export default ToolButton;
