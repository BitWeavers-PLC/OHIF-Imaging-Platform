import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSystem } from '@ohif/core';
import { LineChart, Button } from '@ohif/ui-next';
import i18n from 'i18next';
import { meanCurve, percentEnhancement, phaseAxis, roiVoxelIndices } from '../timeIntensity';

const ROI_TOOLS = ['EllipticalROI', 'RectangleROI', 'CircleROI'];
// Series colours from the theme (SVG stroke attributes can't resolve CSS variables).
const TOKENS = ['--primary', '--success-text', '--warning-text', '--info-text', '--error-text'];
const tokenColor = (token: string) =>
  `hsl(${getComputedStyle(document.documentElement).getPropertyValue(token).trim()})`;

type Curves = { x: number[]; unit: string; series: { label: string; values: number[] }[] };

/**
 * Fork: time–intensity curves of the ROIs (ellipse, rectangle, circle) drawn on a dynamic
 * (multi-phase) series in the active viewport, e.g. DCE breast or prostate MR.
 */
export default function TimeIntensityPanel() {
  const { servicesManager, extensionManager } = useSystem();
  const { viewportGridService, displaySetService, cornerstoneViewportService } =
    servicesManager.services;
  const [curves, setCurves] = useState<Curves | null>(null);
  const [message, setMessage] = useState('');
  const [percent, setPercent] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout>>();
  const computeRef = useRef(() => {});

  const libs = () =>
    extensionManager
      .getModuleEntry('@ohif/extension-cornerstone.utilityModule.common')
      .exports.getCornerstoneLibraries();

  const compute = useCallback(() => {
    const { cornerstone, cornerstoneTools } = libs();
    const viewportId = viewportGridService.getActiveViewportId();
    const displaySet = displaySetService.getDisplaySetByUID(
      viewportGridService.getDisplaySetsUIDsForViewport(viewportId)?.[0]
    );
    if (!displaySet?.isDynamicVolume) {
      setCurves(null);
      setMessage(i18n.t('Messages:Show a dynamic (multi-phase) series in the active viewport.'));
      return;
    }
    const viewport = cornerstoneViewportService.getCornerstoneViewport(viewportId) as any;
    const volume = cornerstone.cache.getVolume(viewport?.getVolumeId?.());
    if (!volume?.numDimensionGroups) {
      setCurves(null);
      setMessage(i18n.t('Messages:Loading the series…'));
      return;
    }

    const { up, normal } = {
      up: viewport.getCamera().viewUp,
      normal: viewport.getCamera().viewPlaneNormal,
    };
    const right = [
      up[1] * normal[2] - up[2] * normal[1],
      up[2] * normal[0] - up[0] * normal[2],
      up[0] * normal[1] - up[1] * normal[0],
    ];
    const worldPoints = annotation => {
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
            showLegend
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
