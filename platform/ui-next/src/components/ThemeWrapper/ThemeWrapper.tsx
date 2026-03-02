import React, { useEffect } from 'react';
import '../../tailwind.css';
import '../../assets/styles.css';

const PRESET_CLASS_MAP = {
  meddreamLike: 'theme-meddream',
};

export const ThemeWrapper = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const appConfig = (window as any)?.config ?? {};
    const productConfig = appConfig.imagingPlatform ?? {};
    const preset = productConfig.uiThemePreset || appConfig.uiThemePreset || 'default';
    const themeClass = PRESET_CLASS_MAP[preset];

    Object.values(PRESET_CLASS_MAP).forEach(className => {
      root.classList.remove(className);
      body.classList.remove(className);
    });

    if (themeClass) {
      root.classList.add(themeClass);
      body.classList.add(themeClass);
    }
  }, []);

  return <React.Fragment>{children}</React.Fragment>;
};
