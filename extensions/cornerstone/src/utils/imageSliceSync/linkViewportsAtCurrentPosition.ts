import { getEnabledElementByViewportId, metaData, utilities } from '@cornerstonejs/core';
import { mat4, vec3 } from 'gl-matrix';

type Position = { viewportId: string; ipp: number[]; frameOfReferenceUID: string };

/** Translation that maps a source slice position onto the target's (target − source). */
export function registrationBetween(targetIpp: number[], sourceIpp: number[]): mat4 {
  return mat4.fromTranslation(
    mat4.create(),
    vec3.subtract(vec3.create(), targetIpp as vec3, sourceIpp as vec3)
  );
}

/**
 * Fork: RadiAnt-style "link at current position" for series from different studies (priors).
 * Viewports with another frame of reference are registered by the offset between the images
 * they show now, so slice sync keeps that anatomy aligned. Replaces Cornerstone's
 * calculateViewportsSpatialRegistration, which passes a slice index where it needs an imageId
 * (4.17) and so never registers anything.
 */
export default function linkViewportsAtCurrentPosition(viewportIds: string[]): void {
  const positions: Position[] = viewportIds
    .map(viewportId => {
      const viewport = getEnabledElementByViewportId(viewportId)?.viewport as any;
      const imageId = viewport?.getCurrentImageId?.();
      const ipp = imageId && metaData.get('imagePlaneModule', imageId)?.imagePositionPatient;
      return ipp && { viewportId, ipp, frameOfReferenceUID: viewport.getFrameOfReferenceUID() };
    })
    .filter(Boolean);

  for (const source of positions) {
    for (const target of positions) {
      if (source !== target && source.frameOfReferenceUID !== target.frameOfReferenceUID) {
        utilities.spatialRegistrationMetadataProvider.add(
          [target.viewportId, source.viewportId],
          registrationBetween(target.ipp, source.ipp)
        );
      }
    }
  }
}
