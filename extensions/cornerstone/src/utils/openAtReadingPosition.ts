import { BaseVolumeViewport } from '@cornerstonejs/core';

// Thicker than this is a MIP view, not an MPR slice.
const MIP_SLAB_MM = 10;
// ct-angio preset: soft tissue over a whole-body slab is almost all white.
const CT_MIP_WINDOW = { windowWidth: 600, windowCenter: 300 };

/** Thick-slab (MIP) views keep their slab; MPR views jump to the reading level. */
export function isMipView(viewport): boolean {
  return (viewport.getSlabThickness?.() ?? 0) > MIP_SLAB_MM;
}

/**
 * Fork: MPR / MIP layouts open at the level being read (RadiAnt), not the middle of the
 * volume, and a CT MIP opens in the angio window. Call before switching layout: it reads the
 * position now and applies it once the new layout's viewports have their volume.
 */
export default async function openAtReadingPosition({ servicesManager, commandsManager }) {
  const { viewportGridService, cornerstoneViewportService } = servicesManager.services;
  const ids = () => [...viewportGridService.getState().viewports.keys()];
  const viewports = () => ids().map(id => cornerstoneViewportService.getCornerstoneViewport(id));
  const before = ids().join();
  const point = viewports()
    .find((_, i) => ids()[i] === viewportGridService.getActiveViewportId())
    ?.getCamera().focalPoint;
  if (!point) {
    return;
  }
  const ready = () =>
    ids().join() !== before &&
    viewports().every(vp => vp instanceof BaseVolumeViewport && vp.getActors().length);
  for (let tries = 0; tries < 80 && !ready(); tries++) {
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  if (!ready()) {
    return; // not a volume layout (or it never loaded): nothing to place
  }
  viewports().forEach((viewport: any) => {
    if (!isMipView(viewport)) {
      viewport.jumpToWorld?.(point);
    } else if (viewport.getImageData()?.metadata?.Modality === 'CT') {
      const { windowWidth, windowCenter } = CT_MIP_WINDOW;
      viewport.setProperties({
        voiRange: { lower: windowCenter - windowWidth / 2, upper: windowCenter + windowWidth / 2 },
      });
      viewport.render();
    }
  });
  // Crosshairs centre on the new planes.
  commandsManager.runCommand('resetCrosshairs', {});
}
