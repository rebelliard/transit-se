import { beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  arrivalsResponse,
  departuresCanceledResponse,
  departuresResponse,
} from '../../__fixtures__/trafiklab/timetables';
import { ApiKeyMissingError, ApiResponseError } from '../../errors';
import { TrafiklabTimetablesApi } from './timetables';

const mockFetch = mock((_url: string | URL | Request, _init?: RequestInit) =>
  Promise.resolve(new Response(JSON.stringify(departuresResponse), { status: 200 })),
);

describe('TrafiklabTimetablesApi', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response(JSON.stringify(departuresResponse), { status: 200 })),
    );
    // @ts-expect-error — replacing global fetch with mock
    globalThis.fetch = mockFetch;
  });

  describe('constructor', () => {
    it('should throw ApiKeyMissingError if no API key is provided', () => {
      expect(() => new TrafiklabTimetablesApi({} as { apiKey: string })).toThrow(
        ApiKeyMissingError,
      );
    });

    it('should create instance with a valid API key', () => {
      const api = new TrafiklabTimetablesApi({ apiKey: 'test-key' });
      expect(api).toBeInstanceOf(TrafiklabTimetablesApi);
    });
  });

  describe('getDepartures', () => {
    it('should call correct URL without time parameter', async () => {
      const api = new TrafiklabTimetablesApi({ apiKey: 'test-key' });
      await api.getDepartures('740000001');

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.pathname).toBe('/v1/departures/740000001');
      expect(url.searchParams.get('key')).toBe('test-key');
    });

    it('should call correct URL with time parameter', async () => {
      const api = new TrafiklabTimetablesApi({ apiKey: 'test-key' });
      await api.getDepartures('740000001', '2025-04-01T16:00');

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.pathname).toBe('/v1/departures/740000001/2025-04-01T16:00');
    });

    it('should parse departure response with route info', async () => {
      const api = new TrafiklabTimetablesApi({ apiKey: 'test-key' });
      const result = await api.getDepartures('740000001');

      expect(result.departures).toHaveLength(2);
      const dep = result.departures[0];
      expect(dep.route.designation).toBe('19');
      expect(dep.route.transport_mode).toBe('METRO');
      expect(dep.route.name).toBe('Gröna linjen');
      expect(dep.route.direction).toBe('Hagsätra');
      expect(dep.route.origin.name).toBe('Hässelby strand');
      expect(dep.route.destination.name).toBe('Hagsätra');
    });

    it('should parse realtime delay data', async () => {
      const api = new TrafiklabTimetablesApi({ apiKey: 'test-key' });
      const result = await api.getDepartures('740000001');

      const withDelay = result.departures[0];
      expect(withDelay.delay).toBe(90);
      expect(withDelay.is_realtime).toBe(true);

      const noDelay = result.departures[1];
      expect(noDelay.delay).toBe(0);
      expect(noDelay.is_realtime).toBe(false);
    });

    it('should parse platform information', async () => {
      const api = new TrafiklabTimetablesApi({ apiKey: 'test-key' });
      const result = await api.getDepartures('740000001');

      expect(result.departures[0].scheduled_platform?.designation).toBe('1');
      expect(result.departures[0].realtime_platform?.designation).toBe('1');
      // Second departure has no realtime platform
      expect(result.departures[1].realtime_platform).toBeNull();
    });

    it('should parse trip identifiers', async () => {
      const api = new TrafiklabTimetablesApi({ apiKey: 'test-key' });
      const result = await api.getDepartures('740000001');

      expect(result.departures[0].trip.trip_id).toBe('trip-12345');
      expect(result.departures[0].trip.start_date).toBe('2025-04-01');
      expect(result.departures[0].trip.technical_number).toBe(42);
    });

    it('should return stops metadata', async () => {
      const api = new TrafiklabTimetablesApi({ apiKey: 'test-key' });
      const result = await api.getDepartures('740000001');

      expect(result.stops).toHaveLength(1);
      expect(result.stops[0].transport_modes).toContain('METRO');
    });

    it('should handle canceled departures', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(departuresCanceledResponse), { status: 200 })),
      );

      const api = new TrafiklabTimetablesApi({ apiKey: 'test-key' });
      const result = await api.getDepartures('740000001');

      expect(result.departures[0].canceled).toBe(true);
      expect(result.departures[0].alerts).toHaveLength(1);
      expect(result.departures[0].alerts[0].header).toBe('Trip canceled');
    });

    it('should return stop-level alerts', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(departuresCanceledResponse), { status: 200 })),
      );

      const api = new TrafiklabTimetablesApi({ apiKey: 'test-key' });
      const result = await api.getDepartures('740000001');

      expect(result.stops[0].alerts).toHaveLength(1);
      expect(result.stops[0].alerts[0].severity).toBe('WARNING');
    });
  });

  describe('getArrivals', () => {
    it('should call correct URL without time', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(arrivalsResponse), { status: 200 })),
      );

      const api = new TrafiklabTimetablesApi({ apiKey: 'test-key' });
      await api.getArrivals('740000001');

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.pathname).toBe('/v1/arrivals/740000001');
    });

    it('should call correct URL with time', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(arrivalsResponse), { status: 200 })),
      );

      const api = new TrafiklabTimetablesApi({ apiKey: 'test-key' });
      await api.getArrivals('740000001', '2025-04-01T14:30');

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.pathname).toBe('/v1/arrivals/740000001/2025-04-01T14:30');
    });

    it('should parse arrival response', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(arrivalsResponse), { status: 200 })),
      );

      const api = new TrafiklabTimetablesApi({ apiKey: 'test-key' });
      const result = await api.getArrivals('740000001');

      expect(result.arrivals).toHaveLength(1);
      expect(result.arrivals[0].route.designation).toBe('13');
      expect(result.arrivals[0].delay).toBe(0);
      expect(result.arrivals[0].is_realtime).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw ApiResponseError on 404', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response('Not Found', { status: 404 })),
      );

      const api = new TrafiklabTimetablesApi({ apiKey: 'test-key' });
      await expect(api.getDepartures('invalid')).rejects.toThrow(ApiResponseError);
    });

    it('should throw ApiResponseError on 401', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response('Unauthorized', { status: 401 })),
      );

      const api = new TrafiklabTimetablesApi({ apiKey: 'bad-key' });
      await expect(api.getDepartures('740000001')).rejects.toThrow(ApiResponseError);
    });

    it('should include status code in error', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response('Server Error', { status: 500 })),
      );

      const api = new TrafiklabTimetablesApi({ apiKey: 'test-key' });
      try {
        await api.getDepartures('740000001');
        expect(true).toBe(false);
      } catch (error) {
        expect((error as ApiResponseError).statusCode).toBe(500);
      }
    });
  });

  describe('usage tracking', () => {
    it('should track departures and arrivals separately', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(departuresResponse), { status: 200 })),
      );

      const api = new TrafiklabTimetablesApi({ apiKey: 'test-key' });
      await api.getDepartures('740000001');
      await api.getDepartures('740000002');

      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(arrivalsResponse), { status: 200 })),
      );
      await api.getArrivals('740000001');

      const usage = api.getUsage();
      expect(usage.totalRequests).toBe(3);
      expect(usage.byEndpoint['/departures/740000001']).toBe(1);
      expect(usage.byEndpoint['/departures/740000002']).toBe(1);
      expect(usage.byEndpoint['/arrivals/740000001']).toBe(1);
    });
  });
});
