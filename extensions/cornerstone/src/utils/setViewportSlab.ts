import { Enums } from '@cornerstonejs/core';
import getCornerstoneBlendMode from './getCornerstoneBlendMode';

type Volume = { dimensions: number[]; spacing: number[] };

/** Diagonal of the volume in mm: a slab this thick covers the whole volume. */
export function getFullVolumeSlabThickness({ dimensions, spacing }: Volume): number {
  return Math.sqrt(
    Math.pow(dimensions[0] * spacing[0], 2) +
      Math.pow(dimensions[1] * spacing[1], 2) +
      Math.pow(dimensions[2] * spacing[2], 2)
  );
}

/**
 * Applies a MIP / MinIP / AvgIP slab to a volume viewport.
 * blendMode: 'mip' | 'minip' | 'avg'; falsy resets to a normal (composite) thin slice.
 * slabThickness: mm, or 'fullVolume'.
 */
export default function setViewportSlab(
  viewport,
  blendMode?: string,
  slabThickness?: number | 'fullVolume',
  getVolume?: (volumeId: string) => Volume
) {
  if (!blendMode) {
    viewport.setBlendMode(Enums.BlendModes.COMPOSITE);
    viewport.resetSlabThickness();
    viewport.render();
    return;
  }

  const thickness =
    slabThickness === 'fullVolume'
      ? getFullVolumeSlabThickness(getVolume(viewport.getVolumeId()))
      : slabThickness;

  viewport.setBlendMode(getCornerstoneBlendMode(blendMode));
  if (thickness) {
    viewport.setSlabThickness(thickness);
  }
  viewport.render();
}
