import { requestFailureWording } from './requestFailureWording';

const t = (key: string, options?: { status?: number }) =>
  key.replace('{{status}}', String(options?.status));

describe('requestFailureWording', () => {
  it('names the server status of a failed image request', () => {
    const error = Object.assign(new Error('request failed'), { status: 404, request: {} });
    expect(requestFailureWording(error, t)?.subtitle).toContain('error 404');
  });

  it('says the server could not be reached when there is no status', () => {
    const error = Object.assign(new Error('request failed'), { status: 0, request: {} });
    expect(requestFailureWording(error, t)?.subtitle).toContain('could not be reached');
  });

  it('leaves other errors to the generic wording', () => {
    expect(requestFailureWording(new Error('boom'), t)).toBeNull();
  });
});
