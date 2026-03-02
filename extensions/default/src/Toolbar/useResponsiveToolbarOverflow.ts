import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const PREFERRED_VISIBLE_IDS = new Set([
  'Length',
  'Zoom',
  'Pan',
  'WindowLevel',
  'StackScroll',
  'Probe',
  'Reset',
  'Layout',
  'MPRTools',
]);

const PINNED_IDS = new Set(['MPRTools']);
const PRIMARY_MORE_ID = 'MoreTools';
const OVERFLOW_FIRST_IDS = [
  'Redo',
  'Undo',
  'LivewireContour',
  'SplineROI',
  'PlanarFreehandROI',
  'CircleROI',
  'EllipticalROI',
  'ArrowAnnotate',
  'Bidirectional',
  'RectangleROI',
  'Magnify',
  'rotate-right',
  'flipHorizontal',
  'TagBrowser',
  'AdvancedMagnify',
  'ImageOverlayViewer',
  'ReferenceLines',
  'ImageSliceSync',
];

const DEFAULT_BUTTON_WIDTH = 42;
const BUTTON_GAP_PX = 4;
const DEFAULT_BUFFER_TO_MORE_COUNT = 0;

function shallowArrayEqual(a: string[], b: string[]) {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

export function useResponsiveToolbarOverflow({
  toolbarButtons,
  enabled,
  minVisible = 8,
  reservedRightPx = 0,
  bufferToMoreCount = DEFAULT_BUFFER_TO_MORE_COUNT,
  maxVisibleButtons = Number.POSITIVE_INFINITY,
}: {
  toolbarButtons: any[];
  enabled: boolean;
  minVisible?: number;
  reservedRightPx?: number;
  bufferToMoreCount?: number;
  maxVisibleButtons?: number;
}) {
  const appConfig = (window as any)?.config ?? {};
  const productConfig = appConfig.imagingPlatform ?? {};
  const toolbarConfig = productConfig.toolbar ?? {};
  const debug = (toolbarConfig.debug ?? appConfig.toolbarOverflowDebug) === true;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const widthCacheRef = useRef<Map<string, number>>(new Map());
  const [containerWidth, setContainerWidth] = useState(0);
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const [overflowIds, setOverflowIds] = useState<string[]>([]);

  const buttonIds = useMemo(() => toolbarButtons.map(button => button.id), [toolbarButtons]);

  const registerItemRef = useCallback(
    (id: string) => (element: HTMLElement | null) => {
      if (!element) {
        itemRefs.current.delete(id);
        return;
      }

      itemRefs.current.set(id, element);
      const measuredWidth = Math.ceil(element.getBoundingClientRect().width);
      if (measuredWidth > 0) {
        widthCacheRef.current.set(id, measuredWidth);
      }
    },
    []
  );

  const getButtonWidth = useCallback((id: string) => {
    return widthCacheRef.current.get(id) || DEFAULT_BUTTON_WIDTH;
  }, []);

  const refreshMeasuredWidths = useCallback(() => {
    itemRefs.current.forEach((element, id) => {
      const width = Math.ceil(element.getBoundingClientRect().width);
      if (width > 0) {
        widthCacheRef.current.set(id, width);
      }
    });
  }, []);

  const calculateLayout = useCallback(() => {
    if (!enabled || buttonIds.length === 0) {
      setVisibleIds(buttonIds);
      setOverflowIds([]);
      return;
    }

    const hasMore = buttonIds.includes(PRIMARY_MORE_ID);
    if (!hasMore || containerWidth <= 0) {
      setVisibleIds(buttonIds);
      setOverflowIds([]);
      return;
    }

    // Always refresh live widths before each layout pass to avoid stale cache issues.
    refreshMeasuredWidths();

    const effectiveContainerWidth = Math.max(0, containerWidth - Math.max(0, reservedRightPx));
    const getIdsWidth = (ids: string[]) => {
      if (!ids.length) {
        return 0;
      }
      const widths = ids.reduce((sum, id) => sum + getButtonWidth(id), 0);
      const gaps = Math.max(0, ids.length - 1) * BUTTON_GAP_PX;
      return widths + gaps;
    };

    const activeIds = new Set(
      toolbarButtons.filter(button => button?.componentProps?.isActive).map(button => button.id)
    );
    const overflowFirstSet = new Set(OVERFLOW_FIRST_IDS);
    const coreIds = buttonIds.filter(id => id !== PRIMARY_MORE_ID);
    const pinnedIds = coreIds.filter(id => PINNED_IDS.has(id));
    const preferredIds = coreIds.filter(
      id => !PINNED_IDS.has(id) && (PREFERRED_VISIBLE_IDS.has(id) || activeIds.has(id))
    );
    const normalIds = coreIds.filter(
      id =>
        !PINNED_IDS.has(id) &&
        !PREFERRED_VISIBLE_IDS.has(id) &&
        !activeIds.has(id) &&
        !overflowFirstSet.has(id)
    );
    const overflowFirstIds = coreIds.filter(
      id =>
        !PINNED_IDS.has(id) &&
        !PREFERRED_VISIBLE_IDS.has(id) &&
        !activeIds.has(id) &&
        overflowFirstSet.has(id)
    );

    const keepOrder = [...pinnedIds, ...preferredIds, ...normalIds, ...overflowFirstIds];
    const visibleCoreIds: string[] = [];
    const hiddenIds: string[] = [];
    const moreHost = [PRIMARY_MORE_ID];
    const canFitWithMore = (ids: string[]) =>
      getIdsWidth([...ids, ...moreHost]) <= effectiveContainerWidth;

    keepOrder.forEach(id => {
      if (canFitWithMore([...visibleCoreIds, id])) {
        visibleCoreIds.push(id);
      } else {
        hiddenIds.push(id);
      }
    });

    const minVisibleCount = Math.max(0, minVisible);
    if (visibleCoreIds.length < minVisibleCount) {
      for (const id of hiddenIds) {
        if (visibleCoreIds.length >= minVisibleCount) {
          break;
        }
        if (canFitWithMore([...visibleCoreIds, id])) {
          visibleCoreIds.push(id);
        }
      }
    }

    // Keep a fixed "buffer to More": if N tools can fit, show N-4 to reduce crowding.
    // Remove from the tail so lower-priority items move first.
    let bufferRemaining = Math.max(0, bufferToMoreCount);
    while (bufferRemaining > 0) {
      const removableIndex = [...visibleCoreIds]
        .reverse()
        .findIndex(id => !PINNED_IDS.has(id) && !activeIds.has(id));

      if (removableIndex === -1 || visibleCoreIds.length <= 1) {
        break;
      }

      const indexFromStart = visibleCoreIds.length - 1 - removableIndex;
      const [removedId] = visibleCoreIds.splice(indexFromStart, 1);
      hiddenIds.unshift(removedId);
      bufferRemaining--;
    }

    // Final hard safety: if layout still overflows due stale measurements,
    // keep removing tail non-critical items until More definitely fits.
    while (!canFitWithMore(visibleCoreIds)) {
      const removableIndex = [...visibleCoreIds]
        .reverse()
        .findIndex(id => !PINNED_IDS.has(id) && !activeIds.has(id));

      if (removableIndex === -1 || visibleCoreIds.length <= 1) {
        break;
      }

      const indexFromStart = visibleCoreIds.length - 1 - removableIndex;
      const [removedId] = visibleCoreIds.splice(indexFromStart, 1);
      hiddenIds.unshift(removedId);
    }

    // Apply hard cap for top-row button count when width allows more.
    // `maxVisibleButtons` counts total visible buttons including More host.
    const maxVisibleCoreCount = Math.max(1, Math.floor(maxVisibleButtons) - 1);
    while (visibleCoreIds.length > maxVisibleCoreCount) {
      const removableIndex = [...visibleCoreIds]
        .reverse()
        .findIndex(id => !PINNED_IDS.has(id) && !activeIds.has(id));

      if (removableIndex === -1 || visibleCoreIds.length <= 1) {
        break;
      }

      const indexFromStart = visibleCoreIds.length - 1 - removableIndex;
      const [removedId] = visibleCoreIds.splice(indexFromStart, 1);
      hiddenIds.unshift(removedId);
    }

    const visibleSet = new Set<string>([...visibleCoreIds, PRIMARY_MORE_ID]);
    const computedVisibleIds = buttonIds.filter(id => visibleSet.has(id));
    const computedOverflowIds = buttonIds.filter(
      id => id !== PRIMARY_MORE_ID && !visibleSet.has(id)
    );

    if (debug) {
      // Debug aid to verify recalculation triggers and final allocation.
      // eslint-disable-next-line no-console
      console.info('[toolbar-overflow] layout', {
        containerWidth,
        reservedRightPx,
        effectiveContainerWidth,
        visibleCount: computedVisibleIds.length,
        overflowCount: computedOverflowIds.length,
      });
    }

    setVisibleIds(prev =>
      shallowArrayEqual(prev, computedVisibleIds) ? prev : computedVisibleIds
    );
    setOverflowIds(prev =>
      shallowArrayEqual(prev, computedOverflowIds) ? prev : computedOverflowIds
    );
  }, [
    buttonIds,
    containerWidth,
    enabled,
    getButtonWidth,
    minVisible,
    reservedRightPx,
    bufferToMoreCount,
    maxVisibleButtons,
    refreshMeasuredWidths,
    debug,
    toolbarButtons,
  ]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    let rafId: number | null = null;
    const updateContainerWidth = (nextWidth: number) => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        setContainerWidth(Math.floor(nextWidth));
      });
    };

    const resizeObserver = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect?.width ?? container.getBoundingClientRect().width ?? 0;
      updateContainerWidth(width);
    });
    resizeObserver.observe(container);

    // Force initial measurement on mount; some environments do not emit an initial RO callback.
    updateContainerWidth(container.getBoundingClientRect().width ?? 0);

    const onWindowResize = () => {
      updateContainerWidth(container.getBoundingClientRect().width ?? 0);
    };
    window.addEventListener('resize', onWindowResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', onWindowResize);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [enabled]);

  useEffect(() => {
    refreshMeasuredWidths();
    calculateLayout();
  }, [toolbarButtons, containerWidth, reservedRightPx, calculateLayout, refreshMeasuredWidths]);

  return {
    containerRef,
    registerItemRef,
    visibleIds: enabled && visibleIds.length ? visibleIds : buttonIds,
    overflowIds: enabled && visibleIds.length ? overflowIds : [],
  };
}
