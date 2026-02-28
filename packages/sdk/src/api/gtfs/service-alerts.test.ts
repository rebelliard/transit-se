import { beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  gtfsServiceAlertsEmptyFeedBuffer,
  gtfsServiceAlertsEmptyResponse,
  gtfsServiceAlertsFeedBuffer,
  gtfsServiceAlertsMultiLangFeedBuffer,
  gtfsServiceAlertsResponse,
} from '../../__fixtures__/gtfs/service-alerts';
import { ApiResponseError } from '../../errors';
import { GtfsServiceAlertsApi } from './service-alerts';

function pbResponse(buf: Uint8Array): Response {
  return new Response(new Uint8Array(buf) as unknown as BodyInit);
}

const mockFetch = mock((_url: string | URL | Request, _init?: RequestInit) =>
  Promise.resolve(pbResponse(gtfsServiceAlertsFeedBuffer)),
);

describe('GtfsServiceAlertsApi', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(pbResponse(gtfsServiceAlertsFeedBuffer)),
    );
    // @ts-expect-error — replacing global fetch with mock
    globalThis.fetch = mockFetch;
  });

  describe('constructor', () => {
    it('should require an API key', () => {
      const api = new GtfsServiceAlertsApi({ apiKey: 'test-key' });
      expect(api).toBeInstanceOf(GtfsServiceAlertsApi);
    });

    it('should allow overriding the base URL', () => {
      const api = new GtfsServiceAlertsApi({
        apiKey: 'test-key',
        baseUrl: 'https://custom.test',
      });
      expect(api).toBeInstanceOf(GtfsServiceAlertsApi);
    });
  });

  describe('getServiceAlerts', () => {
    it('should call the correct URL for an operator', async () => {
      const api = new GtfsServiceAlertsApi({ apiKey: 'test-key' });
      await api.getServiceAlerts('ul');

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('/ul/ServiceAlertsSweden.pb');
      expect(url).toContain('key=test-key');
    });

    it('should parse alerts from protobuf feed', async () => {
      const api = new GtfsServiceAlertsApi({ apiKey: 'test-key' });
      const result = await api.getServiceAlerts('ul');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(gtfsServiceAlertsResponse[0].id);
      expect(result[0].headerText).toBe(gtfsServiceAlertsResponse[0].headerText);
      expect(result[0].descriptionText).toBe(gtfsServiceAlertsResponse[0].descriptionText);
    });

    it('should map cause and effect enums', async () => {
      const api = new GtfsServiceAlertsApi({ apiKey: 'test-key' });
      const result = await api.getServiceAlerts('ul');

      expect(result[0].cause).toBe('MAINTENANCE');
      expect(result[0].effect).toBe('REDUCED_SERVICE');
      expect(result[1].cause).toBe('WEATHER');
      expect(result[1].effect).toBe('SIGNIFICANT_DELAYS');
    });

    it('should parse active periods', async () => {
      const api = new GtfsServiceAlertsApi({ apiKey: 'test-key' });
      const result = await api.getServiceAlerts('ul');

      expect(result[0].activePeriods).toHaveLength(1);
      expect(result[0].activePeriods[0].start).toBe(1709100000);
      expect(result[0].activePeriods[0].end).toBe(1709200000);
      expect(result[1].activePeriods[0].end).toBeUndefined();
    });

    it('should parse informed entities', async () => {
      const api = new GtfsServiceAlertsApi({ apiKey: 'test-key' });
      const result = await api.getServiceAlerts('ul');

      expect(result[0].informedEntities).toHaveLength(1);
      expect(result[0].informedEntities[0].routeId).toBe('1');
      expect(result[0].informedEntities[0].stopId).toBe('740000001');
      expect(result[1].informedEntities[0].agencyId).toBe('UL');
    });

    it('should parse URL when present', async () => {
      const api = new GtfsServiceAlertsApi({ apiKey: 'test-key' });
      const result = await api.getServiceAlerts('ul');

      expect(result[0].url).toBeUndefined();
      expect(result[1].url).toBe('https://ul.se/disruptions/123');
    });

    it('should prefer Swedish translations', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(pbResponse(gtfsServiceAlertsMultiLangFeedBuffer)),
      );

      const api = new GtfsServiceAlertsApi({ apiKey: 'test-key' });
      const result = await api.getServiceAlerts('ul');

      expect(result[0].headerText).toBe('Omlagd körväg linje 3');
      expect(result[0].descriptionText).toBe('Linje 3 kör via Storgatan pga vägarbete.');
    });

    it('should return empty array when no alerts', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(pbResponse(gtfsServiceAlertsEmptyFeedBuffer)),
      );

      const api = new GtfsServiceAlertsApi({ apiKey: 'test-key' });
      const result = await api.getServiceAlerts('ul');

      expect(result).toEqual(gtfsServiceAlertsEmptyResponse);
    });
  });

  describe('error handling', () => {
    it('should throw ApiResponseError on non-OK response', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response('Unauthorized', { status: 401 })),
      );

      const api = new GtfsServiceAlertsApi({ apiKey: 'bad-key' });
      await expect(api.getServiceAlerts('ul')).rejects.toThrow(ApiResponseError);
    });
  });

  describe('usage tracking', () => {
    it('should track requests per operator', async () => {
      const api = new GtfsServiceAlertsApi({ apiKey: 'test-key' });
      await api.getServiceAlerts('ul');
      await api.getServiceAlerts('skane');
      await api.getServiceAlerts('ul');

      const usage = api.getUsage();
      expect(usage.totalRequests).toBe(3);
      expect(usage.byEndpoint['/ul/ServiceAlertsSweden.pb']).toBe(2);
      expect(usage.byEndpoint['/skane/ServiceAlertsSweden.pb']).toBe(1);
    });
  });
});
