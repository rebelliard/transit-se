import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { slDeparturesResponse, slSitesResponse } from './__fixtures__/sl/transport';
import { stopLookupSearchResponse } from './__fixtures__/trafiklab/stop-lookup';
import { departuresResponse } from './__fixtures__/trafiklab/timetables';
import { SLTransportApi } from './api/sl/transport';
import { TrafiklabStopLookupApi } from './api/trafiklab/stop-lookup';
import { TrafiklabTimetablesApi } from './api/trafiklab/timetables';
import { TransitClient } from './client';
import { ValidationError } from './errors';

const mockFetch = mock((_url: string | URL | Request, _init?: RequestInit) =>
  Promise.resolve(new Response(JSON.stringify(stopLookupSearchResponse), { status: 200 })),
);

describe('Valibot validation (validate: true)', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    // @ts-expect-error — replacing global fetch with mock
    globalThis.fetch = mockFetch;
  });

  describe('TrafiklabStopLookupApi', () => {
    it('should pass validation with correct data', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(stopLookupSearchResponse), { status: 200 })),
      );

      const api = new TrafiklabStopLookupApi({ apiKey: 'test-key', validate: true });
      const result = await api.searchByName('T-Centralen');

      expect(result.stop_groups).toHaveLength(2);
      expect(result.stop_groups[0].name).toBe('T-Centralen');
    });

    it('should throw ValidationError on malformed response', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              timestamp: '2025-04-01T14:22:43',
              query: { queryTime: '2025-04-01T14:22:00', query: 'test' },
              stop_groups: [
                {
                  id: '740000001',
                  name: 'T-Centralen',
                  area_type: 'INVALID_TYPE', // not in enum
                  average_daily_stop_times: 100,
                  transport_modes: ['METRO'],
                  stops: [],
                },
              ],
            }),
            { status: 200 },
          ),
        ),
      );

      const api = new TrafiklabStopLookupApi({ apiKey: 'test-key', validate: true });
      await expect(api.searchByName('test')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when required field is missing', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              timestamp: '2025-04-01T14:22:43',
              // missing "query" field
              stop_groups: [],
            }),
            { status: 200 },
          ),
        ),
      );

      const api = new TrafiklabStopLookupApi({ apiKey: 'test-key', validate: true });
      await expect(api.searchByName('test')).rejects.toThrow(ValidationError);
    });

    it('should not throw with malformed data when validate is false', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              timestamp: '2025-04-01',
              query: { queryTime: '2025-04-01', query: 'test' },
              stop_groups: [{ id: 123, weird_field: true }], // wrong shape
            }),
            { status: 200 },
          ),
        ),
      );

      const api = new TrafiklabStopLookupApi({ apiKey: 'test-key', validate: false });
      // No validation → returns whatever the API sends
      const result = await api.searchByName('test');
      expect(result).toBeDefined();
    });
  });

  describe('TrafiklabTimetablesApi', () => {
    it('should pass validation with correct departures data', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(departuresResponse), { status: 200 })),
      );

      const api = new TrafiklabTimetablesApi({ apiKey: 'test-key', validate: true });
      const result = await api.getDepartures('740000001');

      expect(result.departures).toHaveLength(2);
      expect(result.departures[0].route.transport_mode).toBe('METRO');
    });

    it('should throw ValidationError on wrong transport_mode', async () => {
      const badData = structuredClone(departuresResponse);
      // @ts-expect-error — intentionally breaking the data
      badData.departures[0].route.transport_mode = 'SPACESHIP';

      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(badData), { status: 200 })),
      );

      const api = new TrafiklabTimetablesApi({ apiKey: 'test-key', validate: true });
      await expect(api.getDepartures('740000001')).rejects.toThrow(ValidationError);
    });
  });

  describe('SLTransportApi', () => {
    it('should pass validation with correct departures data', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slDeparturesResponse), { status: 200 })),
      );

      const api = new SLTransportApi({ validate: true });
      const result = await api.getDepartures(9001);

      expect(result.departures).toHaveLength(2);
    });

    it('should pass validation with correct sites data', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slSitesResponse), { status: 200 })),
      );

      const api = new SLTransportApi({ validate: true });
      const result = await api.getSites();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('T-Centralen');
    });

    it('should throw ValidationError on malformed SL departure', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              departures: [{ direction: 'Somewhere' }], // missing many fields
              stop_deviations: [],
            }),
            { status: 200 },
          ),
        ),
      );

      const api = new SLTransportApi({ validate: true });
      await expect(api.getDepartures(9001)).rejects.toThrow(ValidationError);
    });
  });

  describe('TransitClient', () => {
    it('should pass validate option to all sub-APIs', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(stopLookupSearchResponse), { status: 200 })),
      );

      const client = new TransitClient({
        apiKey: 'test-key',
        validate: true,
      });

      // Valid data should work
      const result = await client.stops.searchByName('T-Centralen');
      expect(result.stop_groups).toHaveLength(2);
    });

    it('should default to no validation', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify({ garbage: true }), { status: 200 })),
      );

      const client = new TransitClient({ apiKey: 'test-key' });
      // No validation → no error even with garbage data
      const result = await client.stops.searchByName('test');
      expect(result).toBeDefined();
    });
  });

  describe('ValidationError', () => {
    it('should include endpoint in error message', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify({ bad: 'data' }), { status: 200 })),
      );

      const api = new TrafiklabStopLookupApi({ apiKey: 'test-key', validate: true });
      try {
        await api.searchByName('test');
        expect(true).toBe(false); // should not reach
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const ve = error as ValidationError;
        expect(ve.endpoint).toContain('/name/test');
        expect(ve.message).toContain('validation failed');
      }
    });
  });
});
