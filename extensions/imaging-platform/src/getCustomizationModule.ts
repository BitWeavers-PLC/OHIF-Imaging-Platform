const appConfig = (window as any)?.config ?? {};
const productConfig = appConfig.imagingPlatform ?? {};
const productBrand = productConfig.brand ?? appConfig.brand ?? {};

export default function getCustomizationModule() {
  return [
    {
      name: 'imagingPlatform',
      value: {
        'imagingPlatform.brand.appName': productBrand.appName || 'Imaging Platform',
      },
    },
    {
      name: 'default',
      value: {},
    },
  ];
}
