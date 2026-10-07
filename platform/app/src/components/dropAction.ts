/**
 * What a thumbnail drop should do. Like RadiAnt, a series that cannot build a volume is still
 * shown when dropped on a 3D (volume) view: that view becomes a 2D stack. A series no viewport
 * can draw (e.g. a dose report) is refused with a message.
 */
export default function dropAction(
  viewportType?: string,
  displaySet?
): 'show' | 'showAsStack' | 'unsupported' {
  if (displaySet?.unsupported) {
    return 'unsupported';
  }
  if (
    ['volume', 'volume3d'].includes(viewportType) &&
    displaySet &&
    !displaySet.isReconstructable
  ) {
    return 'showAsStack';
  }
  return 'show';
}
