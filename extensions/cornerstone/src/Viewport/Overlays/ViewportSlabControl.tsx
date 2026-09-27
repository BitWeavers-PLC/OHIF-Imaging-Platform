import React, { useEffect, useState } from 'react';
import { Enums, cache } from '@cornerstonejs/core';
import { Slider } from '@ohif/ui-next';
import setViewportSlab, { getFullVolumeSlabThickness } from '../../utils/setViewportSlab';

const { BlendModes } = Enums;
const MODE_BY_BLEND = {
  [BlendModes.MAXIMUM_INTENSITY_BLEND]: 'mip',
  [BlendModes.MINIMUM_INTENSITY_BLEND]: 'minip',
  [BlendModes.AVERAGE_INTENSITY_BLEND]: 'avg',
};
const getVolume = volumeId => cache.getVolume(volumeId);

/** Current projection of an MPR (orthographic) viewport, or null for a normal thin slice. */
export function readSlab(viewport) {
  if (viewport?.type !== Enums.ViewportType.ORTHOGRAPHIC || !viewport.getBlendMode) {
    return null;
  }
  const mode = MODE_BY_BLEND[viewport.getBlendMode()];
  if (!mode) {
    return null;
  }
  const volume = getVolume(viewport.getVolumeId());
  const max = volume ? Math.ceil(getFullVolumeSlabThickness(volume)) : 500;
  return { mode, max, thickness: Math.min(Math.round(viewport.getSlabThickness()), max) };
}

const sameSlab = (a, b) =>
  a === b || (a && b && a.mode === b.mode && a.max === b.max && a.thickness === b.thickness);

/**
 * Fork: draggable slab-thickness bar with a projection selector, shown on MPR views
 * while a MIP / MinIP / AvgIP is active. Follows changes from the Slab menu and
 * crosshair slab handles (both re-render the viewport).
 * ponytail: linear mm scale; switch to log if fine control under 10 mm feels cramped.
 */
export default function ViewportSlabControl({ viewportId, element, servicesManager }) {
  const { cornerstoneViewportService } = servicesManager.services;
  const getViewport = () => cornerstoneViewportService.getCornerstoneViewport(viewportId);
  const [slab, setSlab] = useState(null);

  useEffect(() => {
    if (!element) {
      return;
    }
    const update = () => {
      const next = readSlab(getViewport());
      setSlab(prev => (sameSlab(prev, next) ? prev : next));
    };
    update();
    element.addEventListener(Enums.Events.IMAGE_RENDERED, update);
    return () => element.removeEventListener(Enums.Events.IMAGE_RENDERED, update);
  }, [element, viewportId]);

  if (!slab) {
    return null;
  }

  const viewport = getViewport();
  const label = slab.thickness >= slab.max ? 'Full' : `${slab.thickness} mm`;

  return (
    <div
      className="absolute bottom-24 left-1/2 z-10 flex w-2/3 min-w-[200px] max-w-md -translate-x-1/2 items-center gap-2 rounded bg-black/60 px-2 py-1 text-xs text-white"
      data-cy="viewport-slab-control"
    >
      <select
        aria-label="Projection"
        className="rounded bg-transparent text-white outline-none"
        value={slab.mode}
        onChange={e =>
          setViewportSlab(viewport, e.target.value || undefined, slab.thickness, getVolume)
        }
      >
        <option value="mip">MIP</option>
        <option value="minip">MinIP</option>
        <option value="avg">AvgIP</option>
        <option value="">Off</option>
      </select>
      <Slider
        aria-label="Slab thickness"
        className="flex-1"
        min={1}
        max={slab.max}
        step={1}
        value={[slab.thickness]}
        onValueChange={([thickness]) => {
          viewport.setSlabThickness(thickness);
          viewport.render();
        }}
      />
      <span className="w-12 shrink-0 text-right">{label}</span>
    </div>
  );
}
