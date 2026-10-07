import { Enums } from '@cornerstonejs/core';

/** PET in a 2D view reads black on white (black = uptake), as nuclear medicine reads it. */
export function shouldInvert(viewportType: string, modality?: string) {
  return viewportType === Enums.ViewportType.STACK && modality === 'PT';
}

/**
 * Fork: a PET series shown in a 2D (stack) view opens inverted. Applied when the series is
 * shown, so the reader's own toggle (I) holds while scrolling. The PET/CT workflow and fusion
 * set their own colour maps on volume views and are left alone.
 */
export default function registerInvertPetStacks({ servicesManager }: withAppTypes) {
  const { cornerstoneViewportService } = servicesManager.services;
  cornerstoneViewportService.subscribe(
    cornerstoneViewportService.EVENTS.VIEWPORT_DATA_CHANGED,
    ({ viewportId }) => {
      const viewport = cornerstoneViewportService.getCornerstoneViewport(viewportId) as any;
      const modality = viewport?.getImageData?.()?.metadata?.Modality;
      if (viewport && shouldInvert(viewport.type, modality)) {
        viewport.setProperties({ invert: true });
        viewport.render();
      }
    }
  );
}
