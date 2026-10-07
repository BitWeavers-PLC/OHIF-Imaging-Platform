import { LengthTool, annotation as csAnnotation, Enums } from '@cornerstonejs/tools';
import { eventTarget, utilities as csUtils } from '@cornerstonejs/core';
import { ctrRatios } from './measureMath';

/**
 * Fork: cardiothoracic ratio. Draw the heart's widest diameter and the chest's inner width on
 * the same image, in either order: the second line of each pair shows the ratio (shorter over
 * longer). Each line is a normal length otherwise.
 */
class CTRTool extends LengthTool {
  static toolName = 'CTR';

  constructor(toolProps = {}) {
    super(toolProps);
    this.configuration.getTextLines = (data, targetId) => {
      const stats = data.cachedStats?.[targetId];
      if (stats?.length == null || isNaN(stats.length)) {
        return undefined;
      }
      const lines = [`${csUtils.roundNumber(stats.length)} ${stats.unit}`];
      if (data.ctr != null) {
        lines.push(`CTR ${data.ctr.toFixed(2)}`);
      }
      return lines;
    };
  }

  _calculateCachedStats(annotation, renderingEngine, enabledElement) {
    const stats = super._calculateCachedStats(annotation, renderingEngine, enabledElement);
    updateCtrRatios(annotation.metadata?.referencedImageId, enabledElement.viewport.element);
    return stats;
  }
}

/** Pairs the CTR lines on one image in drawing order and stores each pair's ratio. */
function updateCtrRatios(imageId: string, element?: HTMLDivElement) {
  const lines = (csAnnotation.state.getAllAnnotations() ?? []).filter(
    line =>
      line.metadata?.toolName === CTRTool.toolName && line.metadata?.referencedImageId === imageId
  );
  const lengths = lines.map(line => Object.values(line.data.cachedStats ?? {})[0]?.length ?? 0);
  ctrRatios(lengths).forEach((ratio, index) => {
    const line = lines[index];
    if (line.data.ctr !== ratio) {
      line.data.ctr = ratio;
      // The Findings panel reads the ratio from the measurement update.
      csAnnotation.state.triggerAnnotationModified(line, element, Enums.ChangeTypes.StatsUpdated);
    }
  });
}

// Deleting a line re-pairs the rest on that image.
eventTarget.addEventListener(Enums.Events.ANNOTATION_REMOVED, (evt: any) => {
  const removed = evt.detail?.annotation;
  if (removed?.metadata?.toolName === CTRTool.toolName) {
    updateCtrRatios(removed.metadata.referencedImageId);
  }
});

export default CTRTool;
