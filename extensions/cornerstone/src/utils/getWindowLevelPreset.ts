type Preset = { id?: string; window: string | number; level: string | number };

/** Presets may be an array of {id,...} (default) or an object keyed by name (customizations). */
export default function getWindowLevelPreset(
  presets: Preset[] | Record<string, Preset> | undefined,
  presetName?: string,
  presetIndex?: number
): Preset | undefined {
  if (!presets) {
    return;
  }
  const list = Object.values(presets);
  return (
    list.find(preset => preset.id === presetName) ??
    (presetName ? presets[presetName] : undefined) ??
    list[presetIndex]
  );
}
