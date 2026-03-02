import type { viewPreset } from '../types/viewPreset';
const defaultView = window?.config?.studyBrowserDefaultView === 'list' ? 'list' : 'thumbnails';

const defaultViewPresets = [
  {
    id: 'list',
    iconName: 'ListView',
    selected: defaultView === 'list',
  },
  {
    id: 'thumbnails',
    iconName: 'ThumbnailView',
    selected: defaultView === 'thumbnails',
  },
] as viewPreset[];

export { defaultViewPresets };
