import { Enums, imageLoader, metaData, utilities } from '@cornerstonejs/core';
import { vec3 } from 'gl-matrix';
import i18n from '@ohif/i18n';
import { registrationBetween } from './linkViewportsAtCurrentPosition';

const STEP_MM = 5;
const MIN_OVERLAP_MM = 100;
const MIN_SCORE = 0.6;
// One toast for the whole run: "Aligning…" turns into the result instead of stacking on it
// (cached images finish before the first toast has animated away).
const TOAST_ID = 'align-by-anatomy';

/** Per-slice features sampled every STEP_MM along the slice normal, starting at `start` mm. */
export type Profile = { start: number; values: number[][] };

/**
 * Fractions of body (> -500 HU), lung-range (-950..-500 HU) and bone (> 200 HU) pixels.
 * Lung-range only counts between a row's first and last body pixel, so air around the
 * patient is ignored.
 * ponytail: row-span body mask, not a segmentation; bowel gas still counts as "lung".
 */
export function sliceFeatures(image): number[] {
  const pixels = image.getPixelData();
  const scaled = image.preScale?.scaled;
  const slope = scaled ? 1 : (image.slope ?? 1);
  const intercept = scaled ? 0 : (image.intercept ?? 0);
  let body = 0;
  let lung = 0;
  let bone = 0;
  let n = 0;
  for (let row = 0; row < image.rows; row += 4) {
    const hus: number[] = [];
    for (let col = 0; col < image.columns; col += 4) {
      hus.push(pixels[row * image.columns + col] * slope + intercept);
    }
    const first = hus.findIndex(hu => hu > -500);
    let last = hus.length - 1;
    while (last > first && hus[last] <= -500) {
      last--;
    }
    hus.forEach((hu, i) => {
      n++;
      if (hu > 200) {
        bone++;
      }
      if (hu > -500) {
        body++;
      } else if (hu > -950 && i > first && i < last) {
        lung++;
      }
    });
  }
  return [body / n, lung / n, bone / n];
}

const positionOf = (imageId: string, normal: vec3) =>
  vec3.dot(metaData.get('imagePlaneModule', imageId).imagePositionPatient, normal);

function normalOf(imageId: string): vec3 {
  const { rowCosines, columnCosines } = metaData.get('imagePlaneModule', imageId);
  return vec3.cross(vec3.create(), rowCosines, columnCosines);
}

/** Loads only the slice nearest each STEP_MM grid point, not the whole series. */
async function seriesProfile(imageIds: string[], normal: vec3): Promise<Profile> {
  const slices = imageIds
    .map(imageId => ({ imageId, pos: positionOf(imageId, normal) }))
    .sort((a, b) => a.pos - b.pos);
  const start = slices[0].pos;
  const picked: string[] = [];
  for (let pos = start, i = 0; pos <= slices[slices.length - 1].pos; pos += STEP_MM) {
    while (
      i < slices.length - 1 &&
      Math.abs(slices[i + 1].pos - pos) <= Math.abs(slices[i].pos - pos)
    ) {
      i++;
    }
    picked.push(slices[i].imageId);
  }
  const features = new Map<string, number[]>();
  await Promise.all(
    [...new Set(picked)].map(async imageId =>
      features.set(imageId, sliceFeatures(await imageLoader.loadAndCacheImage(imageId)))
    )
  );
  return { start, values: picked.map(imageId => features.get(imageId)) };
}

function pearson(x: number[], y: number[]): number {
  const mean = (v: number[]) => v.reduce((s, a) => s + a, 0) / v.length;
  const mx = mean(x);
  const my = mean(y);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < x.length; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : NaN;
}

/**
 * Slides `b` along `a` and returns the shift (b position − a position, mm) where the
 * profiles correlate best, averaged over the feature channels that vary in the overlap.
 */
export function bestShift(a: Profile, b: Profile): { shiftMm: number; score: number } {
  const minOverlap = Math.min(MIN_OVERLAP_MM / STEP_MM, a.values.length, b.values.length);
  let best = { shiftMm: 0, score: -Infinity };
  for (let lag = -(a.values.length - 1); lag < b.values.length; lag++) {
    const from = Math.max(0, -lag);
    const to = Math.min(a.values.length, b.values.length - lag);
    if (to - from < minOverlap) {
      continue;
    }
    const scores = a.values[0]
      .map((_, channel) =>
        pearson(
          a.values.slice(from, to).map(v => v[channel]),
          b.values.slice(from + lag, to + lag).map(v => v[channel])
        )
      )
      .filter(score => !Number.isNaN(score));
    const score = scores.length ? scores.reduce((s, v) => s + v, 0) / scores.length : -Infinity;
    if (score > best.score) {
      best = { shiftMm: b.start - a.start + lag * STEP_MM, score };
    }
  }
  return best;
}

/**
 * Fork: CT-vs-CT auto-align. The active viewport stays put; every other CT viewport showing
 * axial slices (stack, or MPR in the acquisition plane) is aligned and jumped to it, then
 * slice sync keeps them together. Another frame of reference (prior) is registered by the
 * anatomy match; the same one (pre-contrast and CTA of one exam) already shares positions.
 */
export default async function alignByAnatomy({
  servicesManager,
  sourceViewportId,
}: withAppTypes<{ sourceViewportId?: string }>) {
  const {
    viewportGridService,
    displaySetService,
    cornerstoneViewportService,
    syncGroupService,
    uiNotificationService,
  } = servicesManager.services;

  const info = (viewportId: string) => {
    const viewport = cornerstoneViewportService.getCornerstoneViewport(viewportId) as any;
    const displaySet = displaySetService.getDisplaySetByUID(
      viewportGridService.getDisplaySetsUIDsForViewport(viewportId)?.[0]
    );
    const types = [Enums.ViewportType.STACK, Enums.ViewportType.ORTHOGRAPHIC];
    if (!types.includes(viewport?.type) || displaySet?.Modality !== 'CT') {
      return null;
    }
    // Volume viewports only have one in the acquisition plane (not sagittal/coronal).
    const imageId = viewport.getCurrentImageId?.();
    return imageId && { viewportId, viewport, displaySet, imageId };
  };

  const { activeViewportId, viewports } = viewportGridService.getState();
  const sourceId = sourceViewportId ?? activeViewportId;
  const source = info(sourceId);
  if (!source) {
    uiNotificationService.show({
      message: i18n.t('Messages:Auto-align works on an axial CT view'),
      type: 'warning',
    });
    return;
  }
  const normal = normalOf(source.imageId);
  const sourceFoR = source.viewport.getFrameOfReferenceUID();
  const others = [...viewports.keys()]
    .filter(id => id !== sourceId)
    .map(info)
    .filter(Boolean)
    .filter(t => Math.abs(vec3.dot(normalOf(t.imageId), normal)) > 0.99);
  if (!others.length) {
    uiNotificationService.show({
      message: i18n.t('Messages:No other axial CT view to align'),
      type: 'warning',
    });
    return;
  }

  // Offset (target frame − source frame) per frame of reference; the source's own is zero.
  const offsets = new Map<string, vec3>([[sourceFoR, vec3.create()]]);
  // Uncached priors download ~1 image per 5 mm first, which can take seconds.
  const needsMatch = others.some(t => t.viewport.getFrameOfReferenceUID() !== sourceFoR);
  if (needsMatch) {
    uiNotificationService.show({
      id: TOAST_ID,
      message: i18n.t('Messages:Aligning anatomy…'),
      type: 'info',
      // Stays up until the match is done: a slow PACS can take many seconds per image.
      duration: Infinity,
    });
  }
  let weakest = 1;
  try {
    const sourceProfile =
      needsMatch && (await seriesProfile(source.viewport.getImageIds(), normal));
    for (const target of others) {
      const frameOfReferenceUID = target.viewport.getFrameOfReferenceUID();
      if (offsets.has(frameOfReferenceUID)) {
        continue;
      }
      const targetIds = target.viewport.getImageIds();
      const { shiftMm, score } = bestShift(sourceProfile, await seriesProfile(targetIds, normal));
      if (score < MIN_SCORE) {
        uiNotificationService.show({
          message: i18n.t('Messages:No matching anatomy in {{series}}', {
            series: target.displaySet.SeriesDescription || target.displaySet.SeriesNumber,
          }),
          type: 'warning',
        });
        continue;
      }
      weakest = Math.min(weakest, score);
      // Any target slice, moved along the normal to the level matching source position 0.
      const ipp = metaData.get('imagePlaneModule', targetIds[0]).imagePositionPatient;
      const level = positionOf(targetIds[0], normal) - shiftMm;
      offsets.set(frameOfReferenceUID, vec3.scaleAndAdd(vec3.create(), ipp, normal, -level));
    }
  } catch (error) {
    console.error('Auto-align failed', error);
    uiNotificationService.show({
      id: TOAST_ID,
      message: i18n.t('Messages:Auto-align could not load the images'),
      type: 'warning',
      duration: 5000,
    });
    return;
  }

  // Same frame of reference as the source (offset zero) counts as aligned.
  const aligned = [source, ...others].filter(v => offsets.has(v.viewport.getFrameOfReferenceUID()));
  if (aligned.length < 2) {
    uiNotificationService.hide(TOAST_ID); // only "no matching anatomy" to say
    return;
  }
  // The same group the sync button uses. Join it directly: after a compare swap the viewports
  // may each sit in a different group (or none), so "source has sync" is not enough.
  const renderingEngineId = source.viewport.getRenderingEngine().id;
  aligned.forEach(({ viewportId }) =>
    syncGroupService.addViewportToSyncGroup(viewportId, renderingEngineId, {
      type: 'imageSlice',
      id: 'IMAGE_SLICE_SYNC',
      source: true,
      target: true,
    })
  );

  for (const s of aligned) {
    for (const t of aligned) {
      const sFoR = s.viewport.getFrameOfReferenceUID();
      const tFoR = t.viewport.getFrameOfReferenceUID();
      // Same frame too (identity): replaces any offset an earlier F5 link left behind.
      if (s !== t) {
        utilities.spatialRegistrationMetadataProvider.add(
          [t.viewportId, s.viewportId],
          registrationBetween(offsets.get(tFoR) as number[], offsets.get(sFoR) as number[])
        );
      }
    }
  }

  // Let the synchronizer's own nearest-slice logic move the targets to the source.
  syncGroupService
    .getSynchronizer('IMAGE_SLICE_SYNC')
    ?.fireEvent({ viewportId: source.viewportId, renderingEngineId }, {} as Event);

  // Say it was automatic and how sure, so the reader knows to check the level.
  uiNotificationService.show({
    id: TOAST_ID,
    message:
      offsets.size > 1
        ? i18n.t('Messages:Aligned by anatomy (match {{score}}%)', {
            score: Math.round(weakest * 100),
          })
        : i18n.t('Messages:Aligned by position (same scan)'),
    type: 'success',
    duration: 6000,
  });
}
