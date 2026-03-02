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

## Record Format for New Patches
- **Patch ID**: short slug
- **Path(s)**:
- **Reason**:
- **User-facing impact**:
- **Upstream alternative evaluated**:
- **Exit criteria**:
- **Added in commit**:
- **Owner**:
