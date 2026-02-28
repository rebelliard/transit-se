import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { slDeparturesResponse } from './__fixtures__/sl/transport';
import { stopLookupSearchResponse } from './__fixtures__/trafiklab/stop-lookup';
import { departuresResponse } from './__fixtures__/trafiklab/timetables';
import { SLTransportApi } from './api/sl/transport';
import { TrafiklabStopLookupApi } from './api/trafiklab/stop-lookup';
import { TrafiklabTimetablesApi } from './api/trafiklab/timetables';
import { TransitClient } from './client';
import { ApiKeyMissingError } from './errors';

const mockFetch = mock((_url: string | URL | Request, _init?: RequestInit) =>
  Promise.resolve(new Response(JSON.stringify(stopLookupSearchResponse), { status: 200 })),
);

describe('TransitClient', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response(JSON.stringify(stopLookupSearchResponse), { status: 200 })),
    );
    // @ts-expect-error — replacing global fetch with mock
    globalThis.fetch = mockFetch;
  });

  describe('constructor', () => {
    it('should create all API instances', () => {
      const client = new TransitClient({ apiKey: 'test-key' });

      expect(client.stops).toBeInstanceOf(TrafiklabStopLookupApi);
      expect(client.timetables).toBeInstanceOf(TrafiklabTimetablesApi);
      expect(client.sl).toBeInstanceOf(SLTransportApi);
    });

    it('should default operator to SL', () => {
      const client = new TransitClient({ apiKey: 'test-key' });
      expect(client.operator).toBe('SL');
    });

    it('should accept custom operator', () => {
      const client = new TransitClient({ apiKey: 'test-key', operator: 'UL' });
      expect(client.operator).toBe('UL');
    });

    it('should throw ApiKeyMissingError when API key is empty', () => {
      expect(() => new TransitClient({ apiKey: '' })).toThrow(ApiKeyMissingError);
    });

    it('should throw ApiKeyMissingError when API key is undefined', () => {
      // @ts-expect-error — testing runtime guard for missing key
      expect(() => new TransitClient({})).toThrow(ApiKeyMissingError);
    });
  });

  describe('API access', () => {
    it('should pass API key to stop lookup', async () => {
      const client = new TransitClient({ apiKey: 'my-key' });
      await client.stops.searchByName('test');

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.searchParams.get('key')).toBe('my-key');
    });

    it('should pass API key to timetables', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(departuresResponse), { status: 200 })),
      );

      const client = new TransitClient({ apiKey: 'my-key' });
      await client.timetables.getDepartures('740000001');

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.searchParams.get('key')).toBe('my-key');
    });

    it('should not send API key for SL Transport', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slDeparturesResponse), { status: 200 })),
      );

      const client = new TransitClient({ apiKey: 'my-key' });
      await client.sl.getDepartures(9001);

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.searchParams.has('key')).toBe(false);
    });
  });

  describe('getUsage', () => {
    it('should start with zero usage', () => {
      const client = new TransitClient({ apiKey: 'test-key' });
      const usage = client.getUsage();

      expect(usage.totalRequests).toBe(0);
      expect(Object.keys(usage.byEndpoint)).toHaveLength(0);
    });

    it('should aggregate usage across all APIs', async () => {
      const client = new TransitClient({ apiKey: 'test-key' });

      // Stop lookup
      await client.stops.searchByName('test');

      // Timetables
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(departuresResponse), { status: 200 })),
      );
      await client.timetables.getDepartures('740000001');

      // SL Transport
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slDeparturesResponse), { status: 200 })),
      );
      await client.sl.getDepartures(9001);

      const usage = client.getUsage();
      expect(usage.totalRequests).toBe(3);
      expect(Object.keys(usage.byEndpoint).length).toBe(3);
    });

    it('should return a snapshot (not a reference)', async () => {
      const client = new TransitClient({ apiKey: 'test-key' });
      await client.stops.searchByName('test');

      const usage1 = client.getUsage();
      await client.stops.searchByName('test2');
      const usage2 = client.getUsage();

      expect(usage1.totalRequests).toBe(1);
      expect(usage2.totalRequests).toBe(2);
    });
  });
});
