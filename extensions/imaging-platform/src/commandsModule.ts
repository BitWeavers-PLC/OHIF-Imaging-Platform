import i18n from 'i18next';
import SubtractionDialog from './SubtractionDialog';
import { subtract } from './subtraction';

/** Viewer commands of this fork: RadiAnt keymap helpers (radiantHotkeys.ts), MR subtraction. */
export default function getCommandsModule({ servicesManager, commandsManager, extensionManager }) {
  const {
    viewportGridService,
    cineService,
    displaySetService,
    cornerstoneViewportService,
    uiModalService,
    uiNotificationService,
  } = servicesManager.services;

  const getActiveViewport = () =>
    cornerstoneViewportService.getCornerstoneViewport(viewportGridService.getActiveViewportId());

  const actions = {
    // RadiAnt Space: play/stop the active viewport (OHIF toggleCine only shows the player).
    toggleCinePlay: () => {
      const id = viewportGridService.getActiveViewportId();
      const element = getActiveViewport()?.element;
      if (!element) {
        return;
      }
      const { isCineEnabled, cines } = cineService.getState();
      const cine = cines?.[id];
      const isPlaying = !cine?.isPlaying;
      if (!isCineEnabled) {
        cineService.setIsCineEnabled(true);
      }
      cineService.setCine({ id, isPlaying });
      // CineProvider mutates its state in place, so the player doesn't react; drive the clip here.
      isPlaying
        ? cineService.playClip(element, { framesPerSecond: cine?.frameRate ?? 24, viewportId: id })
        : cineService.stopClip(element, { viewportId: id });
    },

    // RadiAnt Home/End: first/last series in the active viewport.
    showEdgeSeries: ({ last }) => {
      const { activeViewportId, viewports } = viewportGridService.getState();
      const shown = viewports.get(activeViewportId)?.displaySetInstanceUIDs ?? [];
      const all = displaySetService.activeDisplaySets;
      const current = all.findIndex(ds => shown.includes(ds.displaySetInstanceUID));
      const direction = (last ? all.length - 1 : 0) - current;
      if (current >= 0 && direction) {
        commandsManager.runCommand('updateViewportDisplaySet', { direction });
      }
    },

    // RadiAnt Ctrl+Arrows.
    panActiveViewport: ({ dx = 0, dy = 0 }) => {
      const viewport = getActiveViewport();
      if (!viewport) {
        return;
      }
      const [x, y] = viewport.getPan();
      viewport.setPan([x + dx, y + dy]);
      viewport.render();
    },

    // RadiAnt 0: back to the image's own window.
    resetWindowLevel: () => {
      const viewport = getActiveViewport() as any;
      if (!viewport) {
        return;
      }
      const { invert } = viewport.getProperties();
      viewport.resetProperties();
      // resetProperties also clears invert; keep what the reader chose.
      viewport.setProperties({ invert });
      viewport.render();
    },

    // RadiAnt 1: full dynamic range of the displayed data.
    fullDynamicRange: () => {
      const viewport = getActiveViewport();
      const range = viewport?.getImageData()?.imageData?.getPointData().getScalars().getRange();
      if (!range) {
        return;
      }
      viewport.setProperties({ voiRange: { lower: range[0], upper: range[1] } });
      viewport.render();
    },

    /**
     * MR subtraction: post (active viewport) − pre (another series with the same slices, or
     * phase 1 of a dynamic series). The result is a new series in the strip, shown in place.
     */
    subtractSeries: () => {
      const viewportId = viewportGridService.getActiveViewportId();
      const post = displaySetService.getDisplaySetByUID(
        viewportGridService.getDisplaySetsUIDsForViewport(viewportId)?.[0]
      );
      if (!post) {
        return;
      }
      const [dataSource] = extensionManager.getActiveDataSource();
      const imageIdsOf = ds => ds.imageIds ?? dataSource.getImageIdsForDisplaySet(ds);

      const run = async (postIds: string[], preIds: string[], description: string) => {
        uiNotificationService.show({
          title: i18n.t('Messages:Subtraction'),
          message: i18n.t('Messages:Computing…'),
          type: 'info',
          duration: 2000,
        });
        const { cornerstone } = extensionManager
          .getModuleEntry('@ohif/extension-cornerstone.utilityModule.common')
          .exports.getCornerstoneLibraries();
        const imageIds = await subtract(cornerstone, postIds, preIds);
        if (!imageIds) {
          uiNotificationService.show({
            title: i18n.t('Messages:Subtraction'),
            message: i18n.t("Messages:The two series don't line up slice for slice."),
            type: 'warning',
          });
          return;
        }
        const uid = cornerstone.utilities.uuidv4();
        const postImages = post.images ?? [];
        const images = imageIds.map((imageId, i) => ({
          ...(postImages[i] ?? postImages[0]),
          imageId,
          SeriesDescription: description,
        }));
        const displaySet = {
          ...post,
          displaySetInstanceUID: uid,
          SeriesInstanceUID: `${post.SeriesInstanceUID}.sub.${uid}`,
          SeriesDescription: description,
          SeriesNumber: (post.SeriesNumber ?? 0) + 10000,
          images,
          instances: images,
          instance: images[0],
          imageIds,
          numImageFrames: images.length,
          isDynamicVolume: false,
          dynamicVolumeInfo: undefined,
          isDerived: true,
          madeInClient: true,
          getThumbnailSrc: undefined,
        };
        displaySetService.addDisplaySets(displaySet);
        commandsManager.runCommand('setDisplaySetsForViewports', {
          viewportsToUpdate: [{ viewportId, displaySetInstanceUIDs: [uid] }],
        });
      };

      const name = ds => ds.SeriesDescription || `#${ds.SeriesNumber ?? ''}`;
      const choices = post.isDynamicVolume
        ? post.dynamicVolumeInfo.timePoints.slice(1).map((phase, i) => ({
            label: `${i18n.t('Messages:Phase')} ${i + 2} − ${i18n.t('Messages:Phase')} 1`,
            onSelect: () =>
              run(phase, post.dynamicVolumeInfo.timePoints[0], `SUB ${name(post)} ${i + 2}−1`),
          }))
        : displaySetService
            .getActiveDisplaySets()
            .filter(
              ds =>
                ds !== post &&
                ds.StudyInstanceUID === post.StudyInstanceUID &&
                ds.Modality === post.Modality &&
                ds.numImageFrames === post.numImageFrames &&
                !ds.isDynamicVolume
            )
            .map(pre => ({
              label: `${name(post)} − ${name(pre)}`,
              onSelect: () =>
                run(imageIdsOf(post), imageIdsOf(pre), `SUB ${name(post)} − ${name(pre)}`),
            }));

      uiModalService.show({
        title: i18n.t('Messages:Subtraction'),
        content: SubtractionDialog,
        contentProps: { choices },
      });
    },

    // RadiAnt F.
    toggleFullscreen: () =>
      document.fullscreenElement
        ? document.exitFullscreen()
        : document.documentElement.requestFullscreen(),
  };

  return {
    actions,
    definitions: Object.fromEntries(
      Object.entries(actions).map(([name, commandFn]) => [name, { commandFn }])
    ),
    defaultContext: 'DEFAULT',
  };
}
