export default async config => {
  const useDynamicConfig = config.dangerouslyUseDynamicConfig;
  const debug = config?.toolbarOverflowDebug;

  // Check if dangerouslyUseDynamicConfig enabled
  if (useDynamicConfig?.enabled) {
    // If enabled then get configUrl query-string
    let query = new URLSearchParams(window.location.search);
    let configUrl = query.get('configUrl');

    if (configUrl) {
      // validate regex
      const regex = useDynamicConfig.regex;

      if (configUrl.match(regex)) {
        if (debug) {
          console.info('[toolbar-overflow] loading dynamic config from:', configUrl);
        }
        const response = await fetch(configUrl);
        return response.json();
      } else {
        if (debug) {
          console.warn('[toolbar-overflow] rejected configUrl by regex:', configUrl);
        }
        return null;
      }
    }
  }
  return null;
};
