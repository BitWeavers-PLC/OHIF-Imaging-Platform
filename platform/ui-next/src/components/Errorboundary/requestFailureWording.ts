/**
 * Fork: a failed image-server (DICOMweb) request carries its HTTP status (0 when the server
 * could not be reached). Say that instead of the generic "action could not be completed".
 */
export const requestFailureWording = (error, t: (key: string, options?: object) => string) => {
  if (typeof error?.status !== 'number' || !error.request) {
    return null;
  }
  return {
    title: t('Image data could not be loaded'),
    subtitle: error.status
      ? t('The image server could not send part of this study (error {{status}}).', {
          status: error.status,
        })
      : t('The image server could not be reached. Check the connection and try again.'),
  };
};
