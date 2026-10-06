import { metaData } from '@cornerstonejs/core';
import { vec3 } from 'gl-matrix';

type Point = number[];

/** Unit normal of the plane that holds a bidirectional's two axes. */
export function planeNormal([major, minor]: Point[][]): vec3 {
  const a = vec3.sub(vec3.create(), major[1] as vec3, major[0] as vec3);
  const b = vec3.sub(vec3.create(), minor[1] as vec3, minor[0] as vec3);
  return vec3.normalize(vec3.create(), vec3.cross(vec3.create(), a, b));
}

/** The image whose plane holds `point` (nearest along `normal`). */
export function imageAtPoint(
  imageIds: string[],
  point: Point,
  normal: vec3,
  positionOf: (imageId: string) => Point | undefined = imageId =>
    metaData.get('imagePlaneModule', imageId)?.imagePositionPatient
): string | undefined {
  let best: string | undefined;
  let bestDistance = Infinity;
  for (const imageId of imageIds) {
    const position = positionOf(imageId);
    if (!position) {
      continue;
    }
    const distance = Math.abs(
      vec3.dot(vec3.sub(vec3.create(), point as vec3, position as vec3), normal)
    );
    if (distance < bestDistance) {
      bestDistance = distance;
      best = imageId;
    }
  }
  return best;
}

/** Bidirectional stats are a { maxMajor, maxMinor } pair: show it as "L × W", not NaN. */
export function formatBidirectional(value): string | undefined {
  if (value && typeof value === 'object' && 'maxMajor' in value) {
    const [length, width] = [value.maxMajor, value.maxMinor].sort((a, b) => b - a);
    return `${length.toFixed(1)} × ${width.toFixed(1)}`;
  }
  return undefined;
}
