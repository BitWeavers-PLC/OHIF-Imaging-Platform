/**
 * Fork: MR subtraction (post − pre contrast), slice by slice as a derived stack.
 * Pure helpers are exported for tests; `subtract` does the Cornerstone work.
 */

type Vec3 = number[];

/**
 * Pairs every post slice with the pre slice at the same position, or null when the two series
 * don't line up (different slice count, or a slice further apart than `tolerance` mm).
 */
export function pairSlicesByPosition(
  postPositions: Vec3[],
  prePositions: Vec3[],
  tolerance = 0.5
): number[] | null {
  if (!postPositions.length || postPositions.length !== prePositions.length) {
    return null;
  }
  const pairs = postPositions.map(post => {
    let best = -1;
    let bestDistance = Infinity;
    prePositions.forEach((pre, i) => {
      const d = Math.hypot(post[0] - pre[0], post[1] - pre[1], post[2] - pre[2]);
      if (d < bestDistance) {
        bestDistance = d;
        best = i;
      }
    });
    return bestDistance <= tolerance ? best : -1;
  });
  return pairs.includes(-1) ? null : pairs;
}

/** target = post − pre; returns the [min, max] of the result for the default window. */
export function subtractInto(
  target: Float32Array,
  post: ArrayLike<number>,
  pre: ArrayLike<number>
): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < target.length; i++) {
    const value = post[i] - pre[i];
    target[i] = value;
    if (value < min) {
      min = value;
    }
    if (value > max) {
      max = value;
    }
  }
  return [min, max];
}

/**
 * Subtracts `preImageIds` from `postImageIds` (same geometry) into new derived images.
 * Returns the derived imageIds in post order, or null when the series don't line up.
 */
export async function subtract(cornerstone, postImageIds: string[], preImageIds: string[]) {
  const { imageLoader, metaData, utilities } = cornerstone;
  const position = imageId => metaData.get('imagePlaneModule', imageId)?.imagePositionPatient;
  const pairs = pairSlicesByPosition(postImageIds.map(position), preImageIds.map(position));
  if (!pairs) {
    return null;
  }
  const uid = utilities.uuidv4();
  return Promise.all(
    postImageIds.map(async (postImageId, i) => {
      const [post, pre] = await Promise.all([
        imageLoader.loadAndCacheImage(postImageId),
        imageLoader.loadAndCacheImage(preImageIds[pairs[i]]),
      ]);
      const derived = imageLoader.createAndCacheDerivedImage(postImageId, {
        imageId: `derived:subtraction-${uid}-${i}`,
        targetBuffer: { type: 'Float32Array' },
        instanceNumber: i + 1,
      });
      const [min, max] = subtractInto(
        derived.getPixelData(),
        post.getPixelData(),
        pre.getPixelData()
      );
      Object.assign(derived, {
        minPixelValue: min,
        maxPixelValue: max,
        windowCenter: (max + min) / 2,
        windowWidth: Math.max(max - min, 1),
      });
      return derived.imageId;
    })
  );
}
