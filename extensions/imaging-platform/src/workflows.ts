import i18n from '@ohif/i18n';

/**
 * Workflows (viewer modes) the reader can switch between, by route, in preference order: an
 * automatic switch picks the first one that can show the study. Other installed modes stay
 * reachable only by URL.
 */
const WORKFLOWS: Array<[route: string, label: string]> = [
  ['viewer', 'Standard reading'],
  ['microscopy', 'Slide viewer'],
  ['tmtv', 'PET/CT tumor volume'],
  ['segmentation', 'Segmentation'],
  ['usAnnotation', 'US lung B-lines'],
];

type Mode = { routeName: string; isValidMode?: (args: object) => { valid: boolean } };

/** Workflows whose mode accepts a study with these modalities ("CT\\PT" or "CT/PT"). */
export function validWorkflows(modes: Mode[], modalities: string) {
  const normalised = modalities.replaceAll('/', '\\');
  return WORKFLOWS.flatMap(([route, label]) => {
    const mode = modes.find(m => m.routeName === route);
    // Called as a method: some modes read their own fields through `this`.
    const valid = mode?.isValidMode?.({ modalities: normalised, study: {} })?.valid;
    return valid ? [{ route, label: i18n.t(`Modes:${label}`) }] : [];
  });
}

/** Where to go when the open workflow cannot show the study (e.g. slides in the CT viewer). */
export function workflowToOpen(current: string, valid: Array<{ route: string }>) {
  const known = WORKFLOWS.some(([route]) => route === current);
  if (!known || !valid.length || valid.some(w => w.route === current)) {
    return null;
  }
  return valid[0].route;
}
