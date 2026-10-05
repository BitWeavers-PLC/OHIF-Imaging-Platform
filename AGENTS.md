# AGENTS.md: AxialScope viewer (OHIF fork)

Rules for anyone (human or agent) changing this repo. This is a fork of OHIF v3.13 (Cornerstone3D 4.17), shipped as the **AxialScope** diagnostic viewer inside the Imaging Platform. The platform backend and frontends live in the sibling repo `../imaging-platform` (see its `AGENTS.md`).

## 1. Non-negotiables
- **Never reveal OHIF to users.** No "OHIF" in visible text, titles, tooltips, dialogs, file names served to the browser, DICOM we write, or production source maps. Use the brand from `window.config.brand.appName` (default `AxialScope`). Internal package names (`@ohif/...`) may stay in code.
- **Viewer-only scope.** Do not edit `../imaging-platform` (backend, Traefik, frontends) from work in this repo. If a feature needs the backend, say so and stop at the viewer boundary.
- **The PACS route is read-only.** `/pacs/api` allows GET/HEAD only. Anything that stores to PACS (SR, KOS, secondary capture, SEG save) will fail. Keep such UI hidden behind `imagingPlatform.viewer.allowSRSave` or a similar flag.
- **Record every core patch.** Any change outside `extensions/imaging-platform`, `modes/imaging-platform` and config files gets a row in `docs/fork-maintenance/PATCH_REGISTRY.md` in the same change. Follow `docs/fork-maintenance/UPGRADE_PLAYBOOK.md` for upstream syncs.
- **Do not revert unrelated work** in a dirty tree. Ask before adding new production dependencies; prefer what is already installed (e.g. `lucide-react`, `react-dnd`, ui-next components).

## 2. What actually runs
- **Route:** the platform opens `/pacs/viewer/viewer?StudyInstanceUIDs=<uid>`. `/viewer` is **`modes/longitudinal`**, which spreads **`modes/basic`**. So toolbar, tool groups and hanging-protocol defaults are changed in `modes/basic/src/`, and the left panel in `modes/longitudinal/src/index.ts`.
  - `modes/imaging-platform` is not in `platform/app/pluginConfig.json` and does not run.
- **Config:** `platform/app/public/config/default.js` (`APP_CONFIG`, `PUBLIC_URL=/pacs/viewer`). Fork settings live under `window.config.imagingPlatform`.
- **Overlay extension:** `extensions/imaging-platform` is registered at startup via `pluginConfig.json` (no `"default": false`). It owns:
  - `src/icons.tsx`: the icon set, swapped in by name in `preRegistration`
  - `src/panels/SeriesStrip.tsx` plus `src/getPanelModule.tsx`: the left series strip
  - `src/getCustomizationModule.ts`: fork customizations, e.g. the onboarding tour disabled
- **Measurement tracking:** runs in `simplified` mode (`measurementTrackingMode`).

## 3. Where a change should go (first match wins)
1. Config key in `default.js`, under `imagingPlatform.*`.
2. Customization or registration in `extensions/imaging-platform`: icons, panels, `customizationService` values, commands.
3. `modes/basic` / `modes/longitudinal`: toolbar buttons and sections, tool groups, layout props, `extensionDependencies`.
4. A small, documented hook in core (e.g. an optional prop, as `PanelStudyBrowser`'s `StudyBrowserComponent` does). Keep upstream behaviour the default.
5. Direct core rewrite: only when unavoidable, and registered as a patch.

## 4. UI, theme and branding rules
- **Colours come from theme tokens only:** `bg-primary`, `text-foreground`, `border-border`, `hsl(var(--primary))`, etc.
  - The MedDream-style red preset is `.theme-meddream` in `platform/ui-next/src/tailwind.css` and is the default (`ThemeWrapper.tsx`).
  - Never hardcode OHIF blues (`#348CFD`, `#5ACCE6`, `#041C4A`, …).
- **Icons:** conventional thin line icons (1.5 stroke, 24 viewBox, `currentColor`).
  - Add or override them in `extensions/imaging-platform/src/icons.tsx` by the exact kebab name the UI uses (many OHIF aliases close over the source, so override the alias name, not just the bare key).
  - Radiology-specific glyphs go in the same file as small inline SVGs.
  - Every `icon:` used in `modes/basic/src/toolbarButtons.ts` must resolve (the test checks this).
- **Shapes:** buttons have square-ish corners (`!rounded-sm`). No pill or rounded OHIF styling on new UI.
- **Left panel:** is `SeriesStrip`. Keep its data logic in `PanelStudyBrowser` and change only the view. Drag uses `useDrag({ type: 'displayset', item: { type: 'displayset', displaySetInstanceUID } })`, and tiles keep `id="thumbnail-<uid>"`.
- **New visible strings:** use `i18n.t('Namespace:English text')` and add the key to `platform/i18n/src/locales/en-US/<Namespace>.json` (other locales fall back to en-US). Never write "OHIF" in them.
- **Leak surfaces to check:**
  - Keep production source maps off (`.webpack/webpack.base.js`).
  - Keep debug globals dev-only (`extensions/cornerstone/src/init.tsx`).
  - Don't add OHIF artwork to `platform/app/public`.
  - The manifest and `index.html` must say AxialScope.

## 5. Viewer feature rules
- **Toolbar:**
  - Button `id`s must be unique. Every id listed in a toolbar section must exist in `toolbarButtons` (tested).
  - Group related tools into `ohif.toolButtonList` sections so the row stays short.
  - Lists and `Layout` have no `commands`, so add them to `PINNED_IDS` in `extensions/default/src/Toolbar/useResponsiveToolbarOverflow.ts`, otherwise they vanish when they overflow.
- **Hanging protocol ids:** use the real `id` from the protocol file (`only3D`, `primaryAxial`, `@ohif/hpCompare`, …). A wrong id fails silently with "could not be applied".
- **Enable/disable:** use existing evaluators (`evaluate.viewport.supported`, `evaluate.cornerstoneTool`, `evaluate.displaySetIsReconstructable`, …). Don't invent new ones unless needed.
- **Volume / MPR:** use the helpers in `extensions/cornerstone/src/utils/`: `setViewportSlab` (MIP/MinIP/AvgIP + thickness), `getFullVolumeSlabThickness`, `getCornerstoneBlendMode`. Slab UI is `Viewport/Overlays/ViewportSlabControl.tsx`.
- **Keep the series being viewed:** toggling MPR/MIP/3D must reuse the active series (fork fix in `extensions/default/src/commandsModule.ts` `setHangingProtocol`). Don't reintroduce a fresh re-match.
- **Priors:** must match PatientID **and** patient name (`getStudiesForPatientByMRN.js`), because the PACS is shared across facilities. Real tenancy-safe priors need a backend endpoint.
- **Cornerstone mouse bindings:** a tool with `mouseClickCallback` (e.g. MIPJumpToClick) fires on *any* click, ignoring modifiers. Use a modifier-bound tool for drag actions (the MIP view uses middle or Ctrl+drag for W/L).
- **Mouse and keys follow RadiAnt:** 2D mouse map is `radiantActiveTools` in `modes/basic/src/initToolGroups.ts`; the keymap is `extensions/imaging-platform/src/radiantHotkeys.ts` (one key combo per definition; aliases need distinct `commandOptions`). Don't list `StackScroll` as passive: passive runs after active and strips its left-button binding.
- **Overlays:** components in `Viewport/Overlays` are siblings of the cornerstone element, so pointer interaction there does not trigger tools. Keep new on-image controls there, clear of the corner text rows.

## 6. Tests
- Every non-trivial change leaves at least one runnable Jest test next to the code. Keep them small, with no new frameworks.
- **Test file names:** jest only matches `*.test.js` / `*.test.ts`, not `.test.tsx`. Babel in the extension packages won't parse JSX in `.js` tests, so use `React.createElement`.
- **i18n is not initialised under Jest:** labels and tooltips are `undefined`. Assert on ids, commands and bindings, not text.
- **Mock heavy modules:** `jest.mock('@ohif/ui-next', …)` (load only `Icons` if needed), `jest.mock('react-dnd', () => ({ useDrag: () => [{}, () => {}] }))`, and a stub `cache` from `@cornerstonejs/core`.
- **New extension or package with tests:** needs a `jest.config.js` (copy `extensions/default/jest.config.js`) and `src/__mocks__/fileMock.js`.
- **Before finishing:** `npx jest` (all suites green), `npx prettier --check <changed files>` and `npx eslint <changed files>`.

## 7. Commands
```bash
# install (also creates workspace links such as node_modules/@ohif/extension-imaging-platform)
bun install

# dev server against OHIF's public de-identified demo archive (no local PACS needed)
yarn --cwd platform/app cross-env NODE_ENV=development APP_CONFIG=config/netlify.js webpack serve --config .webpack/webpack.pwa.js
# open http://localhost:3000/pacs/viewer/viewer?StudyInstanceUIDs=1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463

# unit tests
npx jest

# production build (what Docker runs via `bun run build` -> lerna build:viewer)
yarn --cwd platform/app run build:viewer   # QUICK_BUILD=true skips minification (faster, 15 MB bundle)
```
- **Build commands:** plain `yarn run build` in `platform/app` is a *development* build, which leaks HMR code and path-named chunks. Always verify with `build:viewer`. Clear `platform/app/dist` before a manual deploy, because webpack does not clean it.
- **Dev-server restarts:** restart after changing `pluginConfig.json` or adding a package, because plugin imports are generated at startup. If a new workspace package can't be resolved, run the install again.

## 8. Verifying in a browser
- **Match the real flow:** check UI changes in the running viewer, not just tests. Load the CT series by double-clicking "CT IMAGES" in the strip, then use MPR / MIP / Slab.
- **Dev globals** (`window.services`, `window.commandsManager`) exist only in development and are handy for inspecting state.
- **Automation quirks:**
  - Synthetic instant drags register as clicks.
  - Synthetic Shift may not reach Cornerstone's key tracker.
  - A hidden pane has zero size, so views render blank.
  - Dispatch multi-step mouse events, or check the state through the services.

## 9. Known limits (don't "fix" silently; they need a decision)
- **Blocked outside the viewer:**
  - DICOMweb has no per-user auth; Traefik injects fixed credentials, which is a backend/Traefik fix.
  - QIDO responses are cached `immutable`.
  - Saving SR, KOS or segmentations needs a STOW route.
- **Compare with prior:** current and prior link at the positions they open on; to re-align, scroll both to the same anatomy and toggle sync (F5) off and on. CT-vs-CT comparisons instead align by anatomy when they open, keeping the link-at-open offset if the match is weak; Auto-align (CT) on the toolbar or Shift+F5 re-runs it from the active viewport, and a toast shows the match %. Reference lines don't cross studies (different frame of reference).
- **Segmentation:** editable in the main viewer (labelmap and contour panels reuse the segmentation mode's buttons and tools). Download works; the PACS Export items stay hidden while `allowSRSave` is false.
- **DCE curves** need the phases in one series (split by TemporalPositionIdentifier/TriggerTime); one series per phase isn't supported.
- **Not built:** curved planar reformation (Cornerstone has no support).
- **Visible framework traces:** the `/viewer?StudyInstanceUIDs=` URL shape is OHIF's, and `@ohif/*` package names remain in the minified bundle. Changing either needs backend URL changes or package renames.
