# Patch Registry

Track every non-upstream patch that remains in core packages.

## Purpose
- Keep fork diffs explicit and reviewable.
- Reduce upgrade surprises.
- Prevent accidental growth of core patches.

## Current Temporary Core Patch Areas

| Area | Paths | Why it exists now | Removal condition | Owner |
|---|---|---|---|---|
| Toolbar overflow behavior | `extensions/default/src/Toolbar/*` | Product tools-first workflow and responsive overflow behavior | Moved fully into `@ohif/extension-imaging-platform` toolbar wrapper | Imaging Platform team |
| Header alignment and reservation | `platform/ui-next/src/components/Header/Header.tsx` | Viewport-aligned toolbar start and right-slot reservation | Header wrapper moved to overlay extension or upstream hook available | Imaging Platform team |
| Study browser panel fit | `extensions/default/src/ViewerLayout/ResizablePanelsHook.tsx` | Thumbnail-fit side panel behavior | Replaced by mode-level/customization-level layout override | Imaging Platform team |
| Rebrand text/logo surfaces | `platform/app/src/routes/*`, `platform/ui-next/src/components/*` | White-labeling and OHIF reference suppression | Replaced by custom components/customization hooks | Imaging Platform team |
| Theme preset tokens | `platform/ui-next/src/tailwind.css`, `platform/ui/tailwind.config.js` | MedDream-like palette and contrast behavior | Theme fully shipped as overlay style package | Imaging Platform team |
| Diagnostic toolbar and tools | `modes/basic/src/{index.tsx,toolbarButtons.ts,initToolGroups.ts}` | Grouped toolbar; Slab (MIP/MinIP/AvgIP), W/L sync, 3D crop, sharpen/smooth buttons; `mip` and cropping tool groups; mammo and CR/DX protocols auto-selected | Mode lives in `@ohif/mode-imaging-platform` and is loaded by `pluginConfig.json` | Imaging Platform team |
| MIP hanging protocol | `extensions/cornerstone/src/hps/mip.ts`, `extensions/cornerstone/src/getHangingProtocolModule.ts` | 2x2 axial / rotating full-volume MIP / coronal / sagittal layout | Moved to overlay extension hanging-protocol module | Imaging Platform team |
| Slab, filter, copy-findings commands | `extensions/cornerstone/src/commandsModule.ts`, `extensions/cornerstone/src/utils/{setViewportSlab,measurementsToFindings,getWindowLevelPreset}.ts` | Runtime slab projections, GPU sharpen/smooth, clipboard findings table; W/L preset hotkeys look up by id (upstream index fallback picked the wrong preset) | Upstream provides equivalents, or commands move to overlay extension | Imaging Platform team |
| Keep active series on MPR/MIP/3D toggle | `extensions/default/src/commandsModule.ts` (`setHangingProtocol` reset branch) | Upstream re-matched on toggle and reformatted the first volume (PET instead of the CT on screen) | Fixed upstream | Imaging Platform team |
| Compare with prior | `extensions/default/src/commandsModule.ts` (`compareWithStudy`), `extensions/default/src/customizations/studyBrowserCustomization.ts` | Study-browser menu opens `@ohif/hpCompare` in place | Backend priors endpoint plus launch URL | Imaging Platform team |
| Prior matching by name | `extensions/default/src/Panels/getStudiesForPatientByMRN.js` | Shared PACS: PatientID alone can match another facility's patient | Backend tenancy-aware priors endpoint | Imaging Platform team |
| CR/DX two-view protocol | `extensions/default/src/hangingprotocols/hpDxTwoView.ts`, `extensions/default/src/getHangingProtocolModule.js` | Radiographs with 2+ series open side-by-side | Moved to overlay extension | Imaging Platform team |
| Viewport overlay, CT presets, hotkeys | `extensions/cornerstone/src/customizations/viewportOverlayCustomization.tsx`, `.../WindowLevelActionMenu/defaultWindowLevelPresets.ts`, `platform/core/src/defaults/hotkeyBindings.ts` | Patient, slice thickness and location in corners; mediastinum/abdomen/stroke/subdural presets on keys 6-9 | Supplied via customization in overlay extension | Imaging Platform team |
| Read-only PACS SR gate | `extensions/cornerstone/src/components/StudyMeasurementsActions.tsx`, `platform/app/public/config/default.js` (`imagingPlatform.viewer.allowSRSave`) | `/pacs/api` is GET/HEAD only, so "Create SR" always failed | A STOW route exists; set the flag to true | Imaging Platform team |
| Slab thickness slider | `extensions/cornerstone/src/Viewport/Overlays/{ViewportSlabControl.tsx,CornerstoneOverlays.tsx}` | Draggable thickness bar and MIP/MinIP/AvgIP/Off selector on projection views, as in other diagnostic viewers | Upstream ships an equivalent overlay, or it moves to the overlay extension | Imaging Platform team |
| MedDream theme by default | `platform/ui-next/src/components/ThemeWrapper/ThemeWrapper.tsx`, `platform/ui-next/src/assets/styles.css`, `LayoutSelector.tsx`, `Onboarding.css`, `Icons/Sources/{LoadingSpinner,CheckBoxChecked,CheckBoxUnChecked}.tsx` | Red preset applies with any config; hardcoded OHIF blues replaced by theme tokens | Theme shipped as overlay style package | Imaging Platform team |
| Square tool buttons | `platform/ui-next/src/components/ToolButton/{ToolButton,ToolButtonList}.tsx` | Conventional square-cornered toolbar buttons | Upstream exposes button shape via customization | Imaging Platform team |
| Line icon set (overlay, no core patch) | `extensions/imaging-platform/src/icons.tsx`, `platform/app/pluginConfig.json` | Replaces OHIF icons by name at startup (lucide + custom radiology glyphs) | n/a (lives in overlay extension) | Imaging Platform team |
| Series strip (pluggable study browser view) | `extensions/default/src/Panels/StudyBrowser/PanelStudyBrowser.tsx` (`StudyBrowserComponent` prop), `extensions/measurement-tracking/src/panels/PanelStudyBrowserTracking/*`, `extensions/imaging-platform/src/{panels/SeriesStrip.tsx,getPanelModule.tsx}`, `modes/longitudinal/src/index.ts` | Left panel rendered by our own view; OHIF data/drag/tracking logic reused | Upstream exposes a study-browser view customization | Imaging Platform team |
| De-branding | `extensions/cornerstone/src/init.tsx` (CPU modal text, dev-only globals), `extensions/default/src/DicomWebDataSource/index.ts` (ImplementationVersionName), `extensions/cornerstone-dicom-seg/src/commandsModule.ts` (algorithm name), `.webpack/webpack.base.js` (no prod source maps), `platform/app/public/{manifest.json,html-templates/index.html}`, removed `ohif-logo*.svg`, tour off via overlay customization | Viewer should not reveal the underlying framework | Keep permanently | Imaging Platform team |
| Protocol id fixes | `modes/basic/src/toolbarButtons.ts`, `extensions/default/src/Toolbar/ToolbarLayoutSelector.tsx` | 3D button and fallback layout list pointed at non-existent protocol ids | Fixed upstream | Imaging Platform team |

## Record Format for New Patches
- **Patch ID**: short slug
- **Path(s)**:
- **Reason**:
- **User-facing impact**:
- **Upstream alternative evaluated**:
- **Exit criteria**:
- **Added in commit**:
- **Owner**:
