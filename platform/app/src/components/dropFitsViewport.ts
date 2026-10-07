/** A 3D (volume) view can only show a series that builds into a volume (not a scout). */
export default function dropFitsViewport(viewportType?: string, displaySet?): boolean {
  return (
    !['volume', 'volume3d'].includes(viewportType) || !displaySet || !!displaySet.isReconstructable
  );
}
