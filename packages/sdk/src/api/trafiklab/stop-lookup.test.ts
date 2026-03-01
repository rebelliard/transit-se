import { beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  stopLookupListResponse,
  stopLookupSearchResponse,
} from '../../__fixtures__/trafiklab/stop-lookup';
import { ApiKeyMissingError, ApiResponseError } from '../../errors';
import { TrafiklabStopLookupApi } from './stop-lookup';

// Mock global fetch
const mockFetch = mock((_url: string | URL | Request, _init?: RequestInit) =>
  Promise.resolve(new Response(JSON.stringify(stopLookupSearchResponse), { status: 200 })),
);

describe('TrafiklabStopLookupApi', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response(JSON.stringify(stopLookupSearchResponse), { status: 200 })),
    );
    // @ts-expect-error — replacing global fetch with mock
    globalThis.fetch = mockFetch;
  });

  describe('constructor', () => {
    it('should throw ApiKeyMissingError if no API key is provided', () => {
      expect(() => new TrafiklabStopLookupApi({} as { apiKey: string })).toThrow(
        ApiKeyMissingError,
      );
    });

    it('should create instance with a valid API key', () => {
      const api = new TrafiklabStopLookupApi({ apiKey: 'test-key' });
      expect(api).toBeInstanceOf(TrafiklabStopLookupApi);
    });

    it('should allow overriding the base URL', () => {
      const api = new TrafiklabStopLookupApi({
        apiKey: 'test-key',
        baseUrl: 'https://custom.api.test/v2/stops',
      });
      expect(api).toBeInstanceOf(TrafiklabStopLookupApi);
    });
  });

  describe('searchByName', () => {
    it('should call the correct URL with search term and API key', async () => {
      const api = new TrafiklabStopLookupApi({ apiKey: 'test-key' });
      await api.searchByName('T-Centralen');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.pathname).toBe('/v1/stops/name/T-Centralen');
      expect(url.searchParams.get('key')).toBe('test-key');
    });

    it('should encode special characters in search term', async () => {
      const api = new TrafiklabStopLookupApi({ apiKey: 'test-key' });
      await api.searchByName('Kungs/trädgården');

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.pathname).toContain('Kungs%2Ftr%C3%A4dg%C3%A5rden');
    });

    it('should return parsed StopLookupResponse with stop groups', async () => {
      const api = new TrafiklabStopLookupApi({ apiKey: 'test-key' });
      const result = await api.searchByName('T-Centralen');

      expect(result.stop_groups).toHaveLength(2);
      expect(result.stop_groups[0].name).toBe('T-Centralen T-bana');
      expect(result.stop_groups[0].area_type).toBe('RIKSHALLPLATS');
      expect(result.stop_groups[0].stops).toHaveLength(1);
      expect(result.stop_groups[0].transport_modes).toContain('METRO');
    });

    it('should return query metadata with the search term', async () => {
      const api = new TrafiklabStopLookupApi({ apiKey: 'test-key' });
      const result = await api.searchByName('T-Centralen');

      expect(result.query.query).toBe('T-Centralen');
      expect(result.timestamp).toBeDefined();
    });

    it('should return stop coordinates in WGS84 format', async () => {
      const api = new TrafiklabStopLookupApi({ apiKey: 'test-key' });
      const result = await api.searchByName('T-Centralen');

      const stop = result.stop_groups[0].stops[0];
      expect(stop.lat).toBeCloseTo(59.3317, 3);
      expect(stop.lon).toBeCloseTo(18.0617, 3);
    });

    it('should include average daily stop times', async () => {
      const api = new TrafiklabStopLookupApi({ apiKey: 'test-key' });
      const result = await api.searchByName('T-Centralen');

      expect(result.stop_groups[0].average_daily_stop_times).toBeGreaterThan(0);
    });
  });

  describe('listAll', () => {
    it('should call the correct URL', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(stopLookupListResponse), { status: 200 })),
      );

      const api = new TrafiklabStopLookupApi({ apiKey: 'test-key' });
      await api.listAll();

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.pathname).toBe('/v1/stops/list');
      expect(url.searchParams.get('key')).toBe('test-key');
    });

    it('should return all stop groups with null query', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(stopLookupListResponse), { status: 200 })),
      );

      const api = new TrafiklabStopLookupApi({ apiKey: 'test-key' });
      const result = await api.listAll();

      expect(result.query.query).toBeNull();
      expect(result.stop_groups.length).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should throw ApiResponseError on 401 unauthorized', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response('Invalid API key', { status: 401 })),
      );

      const api = new TrafiklabStopLookupApi({ apiKey: 'bad-key' });
      await expect(api.searchByName('test')).rejects.toThrow(ApiResponseError);
    });

    it('should throw ApiResponseError on 500 server error', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response('Internal Server Error', { status: 500 })),
      );

      const api = new TrafiklabStopLookupApi({ apiKey: 'test-key' });
      await expect(api.searchByName('test')).rejects.toThrow(ApiResponseError);
    });

    it('should include status code in the error', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response('Not found', { status: 404 })),
      );

      const api = new TrafiklabStopLookupApi({ apiKey: 'test-key' });
      try {
        await api.searchByName('nonexistent');
        expect(true).toBe(false); // Should not reach
      } catch (error) {
        expect(error).toBeInstanceOf(ApiResponseError);
        expect((error as ApiResponseError).statusCode).toBe(404);
      }
    });
  });

  describe('usage tracking', () => {
    it('should track total request counts', async () => {
      const api = new TrafiklabStopLookupApi({ apiKey: 'test-key' });

      await api.searchByName('foo');
      await api.searchByName('bar');
      await api.listAll();

      const usage = api.getUsage();
      expect(usage.totalRequests).toBe(3);
    });

    it('should track per-endpoint request counts', async () => {
      const api = new TrafiklabStopLookupApi({ apiKey: 'test-key' });

      await api.searchByName('foo');
      await api.searchByName('bar');
      await api.listAll();

      const usage = api.getUsage();
      expect(usage.byEndpoint['/name/foo']).toBe(1);
      expect(usage.byEndpoint['/name/bar']).toBe(1);
      expect(usage.byEndpoint['/list']).toBe(1);
    });
  });
});
