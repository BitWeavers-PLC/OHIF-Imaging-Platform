/**
 * Fork: normalised attributes for the CT/MR hanging protocols (hpCrossSectional.ts).
 * validate.js `containsI` throws on a missing value, so labels are always lower-case strings.
 */

type Plane = 'axial' | 'coronal' | 'sagittal' | undefined;

/** Plane of an ImageOrientationPatient (row + column direction cosines), by its normal. */
export function getImagePlane(iop?: number[] | string): Plane {
  const v = (Array.isArray(iop) ? iop : String(iop ?? '').split('\\')).map(Number);
  if (v.length < 6 || v.some(Number.isNaN)) {
    return undefined;
  }
  const [a, b, c, d, e, f] = v;
  const normal = [b * f - c * e, c * d - a * f, a * e - b * d].map(Math.abs);
  const max = Math.max(...normal);
  return max === normal[2] ? 'axial' : max === normal[1] ? 'coronal' : 'sagittal';
}

const firstInstance = displaySet => displaySet?.instances?.[0] ?? displaySet?.images?.[0];

/** SeriesDescription + ProtocolName + SequenceName, lower case ('' when absent). */
export function seriesLabel(displaySet): string {
  const instance = firstInstance(displaySet) ?? {};
  return [
    displaySet?.SeriesDescription ?? instance.SeriesDescription,
    instance.ProtocolName,
    instance.SequenceName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/** StudyDescription + every series label of that study, lower case. */
export function studyLabel(study, options): string {
  const series = (options?.displaySets ?? []).filter(
    ds => !study?.StudyInstanceUID || ds.StudyInstanceUID === study.StudyInstanceUID
  );
  return [study?.StudyDescription, ...series.map(seriesLabel)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

const LOCALIZER_WORDS = [
  'scout',
  'topogram',
  'localizer',
  'localiser',
  'surview',
  'survey',
  'dose',
  'report',
];

/** Scouts, localizers, dose sheets and other few-image series nobody reads first. */
export function isLocalizer(displaySet): boolean {
  const label = seriesLabel(displaySet);
  const imageType = String(firstInstance(displaySet)?.ImageType ?? '').toLowerCase();
  return (
    (displaySet?.numImageFrames ?? 0) < 10 ||
    imageType.includes('localizer') ||
    LOCALIZER_WORDS.some(word => label.includes(word))
  );
}

/** The study has a real image volume (not only scouts/single images), for multi-pane CT. */
export function hasReadableVolume(study, options): boolean {
  return (options?.displaySets ?? []).some(
    ds =>
      (!study?.StudyInstanceUID || ds.StudyInstanceUID === study.StudyInstanceUID) &&
      ds.isReconstructable &&
      !isLocalizer(ds)
  );
}

/** A prior's series named like one of the current study's (for hpCompare). */
export function sameSeriesAsCurrent(displaySet, options): boolean {
  const current = options?.studies?.[0]?.StudyInstanceUID;
  const label = seriesLabel(displaySet);
  return (
    !!label &&
    (options?.displaySets ?? []).some(
      ds => ds.StudyInstanceUID === current && seriesLabel(ds) === label
    )
  );
}

export default function registerCrossSectionalAttributes(hangingProtocolService) {
  hangingProtocolService.addCustomAttribute('ImagePlane', 'Image plane', ds =>
    getImagePlane(firstInstance(ds)?.ImageOrientationPatient)
  );
  hangingProtocolService.addCustomAttribute(
    'seriesLabel',
    'Series label (lower case)',
    seriesLabel
  );
  hangingProtocolService.addCustomAttribute('studyLabel', 'Study label (lower case)', studyLabel);
  hangingProtocolService.addCustomAttribute('isLocalizer', 'Scout/localizer/dose', isLocalizer);
  hangingProtocolService.addCustomAttribute(
    'hasReadableVolume',
    'Study has a reconstructable, non-scout series',
    hasReadableVolume
  );
  hangingProtocolService.addCustomAttribute(
    'sameSeriesAsCurrent',
    'Series also in the current study',
    sameSeriesAsCurrent
  );
}
