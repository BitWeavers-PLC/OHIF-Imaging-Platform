import type { viewPreset } from '../types/viewPreset';
const appConfig = (window as any)?.config ?? {};
const productConfig = appConfig.imagingPlatform ?? {};
const defaultViewSetting = productConfig.studyBrowserDefaultView ?? appConfig.studyBrowserDefaultView;
const defaultView = defaultViewSetting === 'list' ? 'list' : 'thumbnails';

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
