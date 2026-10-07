import { utilities } from '@cornerstonejs/core';

/**
 * Fork: RadiAnt-style live pixel value. The stored value under a canvas point, rescaled to
 * modality units (HU for CT) when the viewport's pixels are not pre-scaled; null off the image.
 */
export function pixelValueAt(viewport, canvasPoint: [number, number]) {
  const data = viewport?.getImageData?.();
  if (!data?.voxelManager) {
    return null;
  }
  const ijk = utilities.transformWorldToIndex(data.imageData, viewport.canvasToWorld(canvasPoint));
  if (!utilities.indexWithinDimensions(ijk, data.dimensions)) {
    return null;
  }
  let value = data.voxelManager.getAtIJKPoint(ijk);
  if (value == null) {
    return null; // e.g. an MPR slice that has not loaded yet
  }
  const { preScale } = data;
  if (preScale && !preScale.scaled && typeof value === 'number') {
    const { rescaleSlope = 1, rescaleIntercept = 0 } = preScale.scalingParameters ?? {};
    value = value * rescaleSlope + rescaleIntercept;
  }
  // PET pixels pre-scaled to SUV (body weight) read as SUV, as the ROI statistics do.
  const suv = !!(preScale?.scaled && preScale.scalingParameters?.suvbw);
  return { value, modality: data.metadata?.Modality, suv };
}

export function formatPixelValue({
  value,
  modality,
  suv = false,
}: {
  value;
  modality?: string;
  suv?: boolean;
}): string {
  if (Array.isArray(value) || ArrayBuffer.isView(value)) {
    return Array.from(value as ArrayLike<number>).join(', '); // RGB
  }
  const rounded = Number.isInteger(value) ? value : Number(value.toFixed(2));
  if (modality === 'CT') {
    return `${Math.round(value)} HU`;
  }
  return suv ? `${rounded} SUV` : `${rounded}`;
}
