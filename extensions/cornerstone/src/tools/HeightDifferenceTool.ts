import { LengthTool, annotation as csAnnotation, Enums } from '@cornerstonejs/tools';
import { utilities as csUtils } from '@cornerstonejs/core';
import { verticalOffset } from './measureMath';

/**
 * Fork: Height difference. Drawn like Length, but reports only the up-down offset between the
 * two points as the image is shown (e.g. pelvic tilt, leg-length difference on a standing film).
 */
class HeightDifferenceTool extends LengthTool {
  static toolName = 'HeightDifference';

  constructor(toolProps = {}) {
    super(toolProps);
    this.configuration.getTextLines = (data, targetId) => {
      const length = data.cachedStats?.[targetId]?.length;
      return length == null || isNaN(length) ? undefined : [`↕ ${csUtils.roundNumber(length)} mm`];
    };
  }

  _calculateCachedStats(annotation, _renderingEngine, enabledElement) {
    const { viewport } = enabledElement;
    const { data } = annotation;
    const [from, to] = data.handles.points;
    // ponytail: world mm; ignores a user calibration on images without pixel spacing.
    const height = verticalOffset(from, to, viewport.getCamera().viewUp);
    for (const targetId of Object.keys(data.cachedStats)) {
      data.cachedStats[targetId] = {
        length: height,
        unit: 'mm',
        statsArray: [
          { name: 'height', value: height, unit: 'mm', type: Enums.MeasurementType?.Linear },
        ],
      };
    }
    if (annotation.invalidated) {
      annotation.invalidated = false;
      csAnnotation.state.triggerAnnotationModified(
        annotation,
        viewport.element,
        Enums.ChangeTypes.StatsUpdated
      );
    }
    return data.cachedStats;
  }
}

export default HeightDifferenceTool;
