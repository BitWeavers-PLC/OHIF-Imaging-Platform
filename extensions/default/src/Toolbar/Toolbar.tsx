import React from 'react';
import { useToolbar } from '@ohif/core';
import { useResponsiveToolbarOverflow } from './useResponsiveToolbarOverflow';
import ToolButtonListWrapper from './ToolButtonListWrapper';

/**
 * Props for the Toolbar component that renders a collection of toolbar buttons and/or button sections.
 *
 * @interface ToolbarProps
 */
interface ToolbarProps {
  /**
   * The section of buttons to display in the toolbar.
   * Common values include 'primary', 'secondary', 'tertiary', etc.
   * Defaults to 'primary' if not specified.
   *
   * @default 'primary'
   */
  buttonSection?: string;

  /**
   * The unique identifier of the viewport this toolbar is associated with.
   */
  viewportId?: string;

  /**
   * The numeric position or location of the toolbar.
   * Used for ordering and layout purposes in the UI.
   */
  location?: number;
}

export function Toolbar({ buttonSection = 'primary', viewportId, location }: ToolbarProps) {
  const {
    toolbarButtons,
    onInteraction,
    isItemOpen,
    isItemLocked,
    openItem,
    closeItem,
    toggleLock,
  } = useToolbar({
    buttonSection,
  });

  const appConfig = (window as any)?.config ?? {};
  const productConfig = appConfig.imagingPlatform ?? {};
  const toolbarConfig = productConfig.toolbar ?? {};
  const isPrimarySection = buttonSection === 'primary';
  const responsiveOverflowEnabled =
    isPrimarySection &&
    (toolbarConfig.responsiveOverflow ?? appConfig.toolbarResponsiveOverflow) !== false;
  const minVisible = Number(toolbarConfig.overflowMinVisible ?? appConfig.toolbarOverflowMinVisible ?? 8);
  const bufferToMoreCount = Number(
    toolbarConfig.bufferToMoreCount ?? appConfig.toolbarBufferToMoreCount ?? 0
  );
  const maxVisibleButtons = Number(
    toolbarConfig.maxVisibleButtons ?? appConfig.toolbarMaxVisibleButtons ?? Number.POSITIVE_INFINITY
  );
  const minRightActionsPx = Number(
    toolbarConfig.minRightActionsPx ?? appConfig.toolbarMinRightActionsPx ?? 44
  );
  const rightReservationMode =
    toolbarConfig.rightReservationMode ?? appConfig.toolbarRightReservationMode ?? 'measured';
  const moreAlwaysVisible =
    (toolbarConfig.alwaysShowMore ?? appConfig.toolbarMoreAlwaysVisible) !== false;
  const hasMoreHost = React.useMemo(
    () => toolbarButtons.some(button => button?.id === 'MoreTools'),
    [toolbarButtons]
  );
  const toolbarButtonsForRender = React.useMemo(
    () =>
      isPrimarySection && moreAlwaysVisible && !hasMoreHost
        ? [
            ...toolbarButtons,
            {
              id: 'MoreTools',
              Component: ToolButtonListWrapper,
              componentProps: {
                id: 'MoreTools',
                buttonSection: 'MoreTools',
              },
            },
          ]
        : toolbarButtons,
    [hasMoreHost, isPrimarySection, moreAlwaysVisible, toolbarButtons]
  );
  // The primary toolbar is rendered inside the center slot, which already excludes the right slot width.
  // Keep reservation configurable for legacy/future layouts, but default measured mode to no extra deduction.
  const reservedRightPx =
    isPrimarySection && rightReservationMode === 'fixed' ? minRightActionsPx : 0;

  const { containerRef, registerItemRef, visibleIds, overflowIds } = useResponsiveToolbarOverflow({
    toolbarButtons: toolbarButtonsForRender,
    enabled: responsiveOverflowEnabled,
    minVisible,
    reservedRightPx,
    bufferToMoreCount,
    maxVisibleButtons,
  });

  if (!toolbarButtonsForRender.length) {
    return null;
  }

  const finalVisibleIdSet = React.useMemo(() => {
    const nextSet = new Set(visibleIds);
    if (isPrimarySection && moreAlwaysVisible) {
      nextSet.add('MoreTools');
    }
    return nextSet;
  }, [isPrimarySection, moreAlwaysVisible, visibleIds]);
  const overflowItems = React.useMemo(
    () =>
      overflowIds
        .map(id => toolbarButtonsForRender.find(button => button.id === id))
        .filter(Boolean)
        .filter(button => button.componentProps?.commands)
        .map(button => ({
          id: button.id,
          icon: button.componentProps?.icon,
          label: button.componentProps?.label || button.componentProps?.tooltip || button.id,
          tooltip: button.componentProps?.tooltip,
          commands: button.componentProps?.commands,
          disabled: button.componentProps?.disabled,
          disabledText: button.componentProps?.disabledText,
          isActive: button.componentProps?.isActive,
        })),
    [overflowIds, toolbarButtonsForRender]
  );

  return (
    <div
      ref={containerRef}
      className="flex w-full min-w-0 flex-nowrap items-center justify-start gap-1 overflow-hidden"
    >
      {toolbarButtonsForRender?.map(toolDef => {
        if (!toolDef) {
          return null;
        }

        const { id, Component, componentProps } = toolDef;

        if (responsiveOverflowEnabled && !finalVisibleIdSet.has(id)) {
          return null;
        }

        // Enhanced props with state and actions - respecting viewport specificity
        const enhancedProps = {
          ...componentProps,
          isOpen: isItemOpen(id, viewportId),
          isLocked: isItemLocked(id, viewportId),
          onOpen: () => openItem(id, viewportId),
          onClose: () => closeItem(id, viewportId),
          onToggleLock: () => toggleLock(id, viewportId),
          viewportId,
          ...(id === 'MoreTools' ? { overflowItems } : {}),
        };

        const tool = (
          <Component
            key={id}
            id={id}
            location={location}
            onInteraction={args => {
              onInteraction({
                ...args,
                itemId: id,
                viewportId,
              });
            }}
            {...enhancedProps}
          />
        );

        return (
          <div
            key={id}
            ref={registerItemRef(id)}
            className="inline-flex shrink-0"
          >
            {tool}
          </div>
        );
      })}
    </div>
  );
}
