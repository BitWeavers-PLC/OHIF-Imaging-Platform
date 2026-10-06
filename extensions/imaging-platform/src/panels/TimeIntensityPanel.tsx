import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSystem } from '@ohif/core';
import { LineChart, Button } from '@ohif/ui-next';
import i18n from 'i18next';
import {
  meanCurve,
  percentEnhancement,
  phaseAxis,
  phaseSeriesGroup,
  roiVoxelIndices,
  seriesTime,
  type PhaseSeries,
} from '../timeIntensity';

const ROI_TOOLS = ['EllipticalROI', 'RectangleROI', 'CircleROI'];
// Series colours from the theme (SVG stroke attributes can't resolve CSS variables).
const TOKENS = ['--primary', '--success-text', '--warning-text', '--info-text', '--error-text'];
// Theme tokens are either bare "H S% L%" triples or full colours (the status --*-text ones);
// wrapping a full colour in hsl() again made it invalid, which SVG draws as black.
const tokenColor = (token: string) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return /^(hsl|rgb|#)/i.test(value) ? value : `hsl(${value})`;
};

type Curves = { x: number[]; unit: string; series: { label: string; values: number[] }[] };

const toPhaseSeries = (displaySet): PhaseSeries => {
  const first = displaySet.instances?.[0] ?? {};
  return {
    uid: displaySet.displaySetInstanceUID,
    studyUID: displaySet.StudyInstanceUID,
    modality: displaySet.Modality,
    frameOfReferenceUID: first.FrameOfReferenceUID,
    size: `${first.Rows}x${first.Columns}x${displaySet.instances?.length ?? 0}`,
    orientation: (first.ImageOrientationPatient ?? []).map(v => Number(v).toFixed(2)).join(','),
    description: displaySet.SeriesDescription ?? '',
    seriesNumber: Number(displaySet.SeriesNumber),
    time: seriesTime(displaySet.SeriesDescription, first),
  };
};

/**
 * Fork: time–intensity curves of the ROIs (ellipse, rectangle, circle) drawn on a dynamic
 * (multi-phase) series in the active viewport, e.g. DCE breast or prostate MR. The phases may
 * be one series (a dynamic volume) or one series per phase.
 */
export default function TimeIntensityPanel() {
  const { servicesManager, extensionManager } = useSystem();
  const { viewportGridService, displaySetService, cornerstoneViewportService } =
    servicesManager.services;
  const [curves, setCurves] = useState<Curves | null>(null);
  const [message, setMessage] = useState('');
  const [percent, setPercent] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout>>();
  // Latest compute run; an older async (one-series-per-phase) result is dropped.
  const runId = useRef(0);
  const computeRef = useRef(() => {});

  const libs = () =>
    extensionManager
      .getModuleEntry('@ohif/extension-cornerstone.utilityModule.common')
      .exports.getCornerstoneLibraries();

  /** ROI outline points in world space; a circle as its four extreme points. */
  const worldPointsFor = viewport => {
    const up = viewport.getCamera().viewUp;
    const normal = viewport.getCamera().viewPlaneNormal;
    const right = [
      up[1] * normal[2] - up[2] * normal[1],
      up[2] * normal[0] - up[0] * normal[2],
      up[0] * normal[1] - up[1] * normal[0],
    ];
    return annotation => {
      const points = annotation.data.handles.points;
      if (annotation.metadata.toolName !== 'CircleROI') {
        return points;
      }
      const [center, edge] = points;
      const r = Math.hypot(...center.map((c, i) => c - edge[i]));
      return [up, right].flatMap(axis =>
        [1, -1].map(s => center.map((c, i) => c + s * r * axis[i]))
      );
    };
  };

  /**
   * Fork: one series per phase. ROI pixels on the slice it is drawn on, read from the slice at
   * the same position in every phase series (one image per phase).
   */
  const computeFromPhaseSeries = async (phases: PhaseSeries[], viewport, run: number) => {
    const { cornerstone, cornerstoneTools } = libs();
    const { metaData, imageLoader, utilities } = cornerstone;
    const worldPoints = worldPointsFor(viewport);
    const rois = cornerstoneTools.annotation.state
      .getAllAnnotations()
      .filter(
        a =>
          ROI_TOOLS.includes(a.metadata.toolName) &&
          a.metadata.referencedImageId &&
          a.metadata.FrameOfReferenceUID === phases[0].frameOfReferenceUID
      );
    if (!rois.length) {
      setCurves(null);
      setMessage(i18n.t('Messages:Draw an ellipse, rectangle or circle ROI on the series.'));
      return;
    }
    setMessage(i18n.t('Messages:Loading the series…'));
    const positionOf = imageId => metaData.get('imagePlaneModule', imageId)?.imagePositionPatient;
    const imageAt = (displaySet, position) =>
      displaySet.instances.reduce(
        (best, instance) => {
          const p = positionOf(instance.imageId);
          const d = p ? Math.hypot(...p.map((v, i) => v - position[i])) : Infinity;
          return d < best.d ? { d, imageId: instance.imageId } : best;
        },
        { d: Infinity, imageId: null }
      ).imageId;
    try {
      const series = await Promise.all(
        rois.map(async (roi, n) => {
          const ref = roi.metadata.referencedImageId;
          const plane = metaData.get('imagePlaneModule', ref);
          const ijk = worldPoints(roi).map(p => [...utilities.worldToImageCoords(ref, p), 0]);
          const shape = roi.metadata.toolName === 'RectangleROI' ? 'rectangle' : 'ellipse';
          const indices = roiVoxelIndices(ijk, [plane.columns, plane.rows, 1], shape);
          const images = await Promise.all(
            phases.map(phase =>
              imageLoader.loadAndCacheImage(
                imageAt(displaySetService.getDisplaySetByUID(phase.uid), plane.imagePositionPatient)
              )
            )
          );
          const read = images.map(image => {
            const pixels = image.getPixelData();
            const scaled = image.preScale?.scaled;
            const slope = scaled ? 1 : (image.slope ?? 1);
            const intercept = scaled ? 0 : (image.intercept ?? 0);
            return (index: number) => pixels[index] * slope + intercept;
          });
          const values = meanCurve(indices, phases.length, (index, phase) =>
            read[phase - 1](index)
          );
          return { label: roi.data.label || `ROI ${n + 1}`, values };
        })
      );
      if (run !== runId.current) {
        return;
      }
      const { x, unit } = phaseAxis(phases.map(phase => phase.time));
      setMessage('');
      setCurves({ x, unit, series });
    } catch (error) {
      if (run === runId.current) {
        setCurves(null);
        setMessage(String(error?.message ?? error));
      }
    }
  };

  const compute = useCallback(() => {
    const { cornerstone, cornerstoneTools } = libs();
    const viewportId = viewportGridService.getActiveViewportId();
    const displaySet = displaySetService.getDisplaySetByUID(
      viewportGridService.getDisplaySetsUIDsForViewport(viewportId)?.[0]
    );
    const run = ++runId.current;
    const viewport = cornerstoneViewportService.getCornerstoneViewport(viewportId) as any;
    if (!displaySet?.isDynamicVolume) {
      // Fork: or one series per phase (e.g. Siemens TWIST "…_TT=99.3s").
      const phases = displaySet?.instances?.length
        ? phaseSeriesGroup(
            toPhaseSeries(displaySet),
            displaySetService
              .getActiveDisplaySets()
              .filter(ds => ds.instances?.length)
              .map(toPhaseSeries)
          )
        : [];
      if (!phases.length || !viewport) {
        setCurves(null);
        setMessage(i18n.t('Messages:Show a dynamic (multi-phase) series in the active viewport.'));
        return;
      }
      computeFromPhaseSeries(phases, viewport, run);
      return;
    }
    const volume = cornerstone.cache.getVolume(viewport?.getVolumeId?.());
    if (!volume?.numDimensionGroups) {
      setCurves(null);
      setMessage(i18n.t('Messages:Loading the series…'));
      return;
    }

    const worldPoints = worldPointsFor(viewport);

    const rois = cornerstoneTools.annotation.state
      .getAllAnnotations()
      .filter(
        a =>
          ROI_TOOLS.includes(a.metadata.toolName) &&
          a.metadata.FrameOfReferenceUID === volume.metadata?.FrameOfReferenceUID
      );
    if (!rois.length) {
      setCurves(null);
      setMessage(i18n.t('Messages:Draw an ellipse, rectangle or circle ROI on the series.'));
      return;
    }

    const phases = volume.numDimensionGroups;
    const { metaData } = cornerstone;
    const times = displaySet.dynamicVolumeInfo.timePoints.map(imageIds => {
      const instance = metaData.get('instance', imageIds[0]) ?? {};
      return instance.TriggerTime != null
        ? Number(instance.TriggerTime) / 1000
        : (instance.AcquisitionTime ?? instance.ContentTime);
    });
    const { x, unit } = phaseAxis(times.slice(0, phases));

    const series = rois.map((roi, n) => {
      const ijk = worldPoints(roi).map(p => volume.imageData.worldToIndex(p));
      const shape = roi.metadata.toolName === 'RectangleROI' ? 'rectangle' : 'ellipse';
      const indices = roiVoxelIndices(ijk, volume.dimensions, shape);
      const values = meanCurve(indices, phases, (index, phase) =>
        volume.voxelManager.getAtIndexAndDimensionGroup(index, phase)
      );
      return { label: roi.data.label || `ROI ${n + 1}`, values };
    });
    // Phases still streaming read as 0: say so and refresh until the series is complete.
    const loading = volume.loadStatus && !volume.loadStatus.loaded;
    setMessage(
      loading ? i18n.t('Messages:Still loading; the curve updates as phases arrive.') : ''
    );
    setCurves({ x, unit, series });
    if (loading) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => computeRef.current(), 2000);
    }
  }, [viewportGridService, displaySetService, cornerstoneViewportService]);

  computeRef.current = compute;

  useEffect(() => {
    const { cornerstone, cornerstoneTools } = libs();
    const { Events } = cornerstoneTools.Enums;
    const events = [
      Events.ANNOTATION_COMPLETED,
      Events.ANNOTATION_MODIFIED,
      Events.ANNOTATION_REMOVED,
    ];
    events.forEach(e => cornerstone.eventTarget.addEventListener(e, compute));
    const { unsubscribe } = viewportGridService.subscribe(
      viewportGridService.EVENTS.ACTIVE_VIEWPORT_ID_CHANGED,
      compute
    );
    compute();
    return () => {
      events.forEach(e => cornerstone.eventTarget.removeEventListener(e, compute));
      unsubscribe();
      clearTimeout(refreshTimer.current);
    };
  }, [compute, viewportGridService]);

  return (
    <div className="text-foreground flex flex-col gap-2 p-2">
      <div className="flex items-center justify-between">
        <span className="text-base">{i18n.t('Messages:Time–intensity curve')}</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="!rounded-sm"
            onClick={() => setPercent(p => !p)}
          >
            {percent ? i18n.t('Messages:Signal') : '%'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="!rounded-sm"
            onClick={compute}
          >
            {i18n.t('Messages:Refresh')}
          </Button>
        </div>
      </div>
      {curves ? (
        <div className="h-[260px]">
          <LineChart
            // The legend only helps to tell several ROIs apart; one ROI gets the full width.
            showLegend={curves.series.length > 1}
            legendWidth={90}
            transparentChartBackground
            axis={{
              x: {
                label: curves.unit ? i18n.t('Messages:Time (s)') : i18n.t('Messages:Phase'),
                indexRef: 0,
                type: 'x',
              },
              y: {
                label: percent ? i18n.t('Messages:Enhancement (%)') : i18n.t('Messages:Signal'),
                indexRef: 1,
                type: 'y',
              },
            }}
            series={curves.series.map(({ label, values }, i) => ({
              label,
              color: tokenColor(TOKENS[i % TOKENS.length]),
              points: (percent ? percentEnhancement(values) : values).map((y, p) => [
                curves.x[p],
                y,
              ]),
            }))}
          />
        </div>
      ) : null}
      {message && <p className="text-muted-foreground text-sm">{message}</p>}
    </div>
  );
}
