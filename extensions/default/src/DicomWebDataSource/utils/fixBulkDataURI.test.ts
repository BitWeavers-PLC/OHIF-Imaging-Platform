import { fixBulkDataURI } from './fixBulkDataURI';

const instance = { StudyInstanceUID: '1.2', SeriesInstanceUID: '3.4' };
const path = '/studies/1.2/series/3.4/instances/5.6/bulk/60003000';

describe('fixBulkDataURI', () => {
  it('fetches an absolute URI from another host through the configured root', () => {
    const value = { BulkDataURI: `http://orthanc:8042/pacs/dicom-web${path}` };
    fixBulkDataURI(value, instance, { wadoRoot: '/pacs/dicom-web' });
    expect(value.BulkDataURI).toBe(`/pacs/dicom-web${path}`);
  });

  it('leaves a URI already under the configured root alone', () => {
    const value = { BulkDataURI: `https://pacs.example/dicom-web${path}` };
    fixBulkDataURI(value, instance, { wadoRoot: 'https://pacs.example/dicom-web' });
    expect(value.BulkDataURI).toBe(`https://pacs.example/dicom-web${path}`);
  });

  it('still resolves series-relative URIs', () => {
    const value = { BulkDataURI: 'instances/5.6/bulk/60003000' };
    fixBulkDataURI(value, instance, { wadoRoot: '/dicom-web' });
    expect(value.BulkDataURI).toBe(`/dicom-web${path}`);
  });
});
