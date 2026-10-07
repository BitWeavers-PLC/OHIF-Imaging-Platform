import { EllipticalROITool, utilities } from '@cornerstonejs/tools';

/**
 * Cornerstone 4.17 computes the ellipse area from world (mm) sizes but still divides them by
 * the index-to-mm scale, so the pixel spacing is applied twice: area = true × spacing[0]².
 * Length, rectangle and circle measure in index space and are right. On CT (≈1 mm pixels)
 * areas read ~5 % low; on PET (4.7 mm pixels) 22× too high.
 * Corrects each freshly computed area once (stale stats keep their flag).
 * ponytail: remove when Cornerstone fixes EllipticalROITool's area (check on upgrade).
 */
export function fixEllipseAreas(cachedStats: Record<string, any>, columnSpacing: number) {
  if (!(columnSpacing > 0)) {
    return;
  }
  Object.values(cachedStats ?? {}).forEach(stats => {
    if (typeof stats?.area === 'number' && !stats.areaSpacingFixed) {
      stats.area /= columnSpacing * columnSpacing;
      stats.areaSpacingFixed = true;
    }
  });
}

/** Fork: EllipticalROITool with the area fix above. Keeps the 'EllipticalROI' tool name. */
export default class EllipticalROIAreaFixTool extends EllipticalROITool {
  constructor(...args) {
    super(...args);
    const self = this as any;
    const calculate = self._calculateCachedStats;
    self._calculateCachedStats = (annotation, viewport, ...rest) => {
      const result = calculate(annotation, viewport, ...rest);
      fixEllipseAreas(annotation.data.cachedStats, viewport.getImageData?.()?.spacing?.[0]);
      return result;
    };
    // The tool also keeps a throttled copy (used while drawing) made from the original.
    self._throttledCalculateCachedStats = utilities.throttle(self._calculateCachedStats, 100, {
      trailing: true,
    });
  }
}
