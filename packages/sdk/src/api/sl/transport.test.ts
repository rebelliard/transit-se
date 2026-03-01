import { beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  slDeparturesResponse,
  slDeparturesWithDeviationsResponse,
  slLinesResponse,
  slSitesExpandedResponse,
  slSitesResponse,
  slStopPointsResponse,
  slTransportAuthoritiesResponse,
} from '../../__fixtures__/sl/transport';
import { ApiResponseError } from '../../errors';
import { SLTransportApi } from './transport';

const mockFetch = mock((_url: string | URL | Request, _init?: RequestInit) =>
  Promise.resolve(new Response(JSON.stringify(slDeparturesResponse), { status: 200 })),
);

describe('SLTransportApi', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response(JSON.stringify(slDeparturesResponse), { status: 200 })),
    );
    // @ts-expect-error — replacing global fetch with mock
    globalThis.fetch = mockFetch;
  });

  describe('constructor', () => {
    it('should not require an API key', () => {
      expect(() => new SLTransportApi()).not.toThrow();
    });

    it('should default to SL transport authority (id=1)', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slLinesResponse), { status: 200 })),
      );

      const api = new SLTransportApi();
      await api.getLines();

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.searchParams.get('transport_authority_id')).toBe('1');
    });

    it('should allow overriding transport authority ID', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slLinesResponse), { status: 200 })),
      );

      const api = new SLTransportApi({ transportAuthorityId: '8' });
      await api.getLines();

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.searchParams.get('transport_authority_id')).toBe('8');
    });

    it('should allow overriding the base URL', () => {
      const api = new SLTransportApi({ baseUrl: 'https://custom.test/v2' });
      expect(api).toBeInstanceOf(SLTransportApi);
    });
  });

  describe('getSites', () => {
    it('should call correct URL without expand', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slSitesResponse), { status: 200 })),
      );

      const api = new SLTransportApi();
      await api.getSites();

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.pathname).toBe('/v1/sites');
      expect(url.searchParams.has('expand')).toBe(false);
    });

    it('should pass expand=true parameter', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(
          new Response(JSON.stringify(slSitesExpandedResponse), {
            status: 200,
          }),
        ),
      );

      const api = new SLTransportApi();
      await api.getSites(true);

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.searchParams.get('expand')).toBe('true');
    });

    it('should parse site data correctly', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slSitesResponse), { status: 200 })),
      );

      const api = new SLTransportApi();
      const sites = await api.getSites();

      expect(sites).toHaveLength(2);
      expect(sites[0].name).toBe('T-Centralen');
      expect(sites[0].id).toBe(9001);
      expect(sites[0].lat).toBeCloseTo(59.3314, 3);
    });

    it('should include stop_areas when expanded', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(
          new Response(JSON.stringify(slSitesExpandedResponse), {
            status: 200,
          }),
        ),
      );

      const api = new SLTransportApi();
      const sites = await api.getSites(true);

      expect(sites[0].stop_areas).toBeDefined();
      expect(sites[0].stop_areas!.length).toBeGreaterThan(0);
    });
  });

  describe('getDepartures', () => {
    it('should call correct URL with numeric site ID', async () => {
      const api = new SLTransportApi();
      await api.getDepartures(9001);

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.pathname).toBe('/v1/sites/9001/departures');
    });

    it('should pass no query params when options are omitted', async () => {
      const api = new SLTransportApi();
      await api.getDepartures(9001);

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.searchParams.has('forecast')).toBe(false);
      expect(url.searchParams.has('direction')).toBe(false);
      expect(url.searchParams.has('line')).toBe(false);
      expect(url.searchParams.has('transport')).toBe(false);
    });

    it('should pass forecast query param', async () => {
      const api = new SLTransportApi();
      await api.getDepartures(9192, { forecast: 30 });

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.searchParams.get('forecast')).toBe('30');
    });

    it('should pass direction query param', async () => {
      const api = new SLTransportApi();
      await api.getDepartures(9192, { direction: 1 });

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.searchParams.get('direction')).toBe('1');
    });

    it('should pass line query param', async () => {
      const api = new SLTransportApi();
      await api.getDepartures(9192, { line: 19 });

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.searchParams.get('line')).toBe('19');
    });

    it('should pass transport query param', async () => {
      const api = new SLTransportApi();
      await api.getDepartures(9192, { transport: 'METRO' });

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.searchParams.get('transport')).toBe('METRO');
    });

    it('should pass all filter params together', async () => {
      const api = new SLTransportApi();
      await api.getDepartures(9192, {
        forecast: 120,
        direction: 2,
        line: 19,
        transport: 'METRO',
      });

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.searchParams.get('forecast')).toBe('120');
      expect(url.searchParams.get('direction')).toBe('2');
      expect(url.searchParams.get('line')).toBe('19');
      expect(url.searchParams.get('transport')).toBe('METRO');
    });

    it('should parse departure response', async () => {
      const api = new SLTransportApi();
      const result = await api.getDepartures(9001);

      expect(result.departures).toHaveLength(2);
      expect(result.departures[0].line.designation).toBe('11');
      expect(result.departures[0].line.transport_mode).toBe('METRO');
      expect(result.departures[0].display).toBe('3 min');
      expect(result.departures[0].direction).toBe('Kungsträdgården');
    });

    it('should parse journey metadata', async () => {
      const api = new SLTransportApi();
      const result = await api.getDepartures(9001);

      expect(result.departures[0].journey.state).toBe('NORMALPROGRESS');
    });

    it('should parse stop area and stop point', async () => {
      const api = new SLTransportApi();
      const result = await api.getDepartures(9001);

      expect(result.departures[0].stop_area.type).toBe('METROSTN');
      expect(result.departures[0].stop_point.designation).toBe('6');
    });

    it('should handle departures with deviations', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(
          new Response(JSON.stringify(slDeparturesWithDeviationsResponse), {
            status: 200,
          }),
        ),
      );

      const api = new SLTransportApi();
      const result = await api.getDepartures(9001);

      expect(result.departures[0].deviations).toHaveLength(1);
      expect(result.departures[0].deviations[0].consequence).toBe('INFORMATION');
      expect(result.departures[0].state).toBe('ATSTOP');
    });

    it('should parse stop-level deviations', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(
          new Response(JSON.stringify(slDeparturesWithDeviationsResponse), {
            status: 200,
          }),
        ),
      );

      const api = new SLTransportApi();
      const result = await api.getDepartures(9001);

      expect(result.stop_deviations).toHaveLength(1);
      expect(result.stop_deviations[0].importance_level).toBe(2);
    });
  });

  describe('getLines', () => {
    it('should call correct URL with transport_authority_id', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slLinesResponse), { status: 200 })),
      );

      const api = new SLTransportApi();
      await api.getLines();

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.pathname).toBe('/v1/lines');
      expect(url.searchParams.get('transport_authority_id')).toBe('1');
    });

    it('should parse lines grouped by transport mode', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slLinesResponse), { status: 200 })),
      );

      const api = new SLTransportApi();
      const lines = await api.getLines();

      expect(lines.metro).toHaveLength(1);
      expect(lines.metro[0].designation).toBe('19');
      expect(lines.bus).toHaveLength(1);
      expect(lines.train).toHaveLength(1);
      expect(lines.tram).toHaveLength(0);
    });

    it('should parse line contractor and authority', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slLinesResponse), { status: 200 })),
      );

      const api = new SLTransportApi();
      const lines = await api.getLines();

      expect(lines.metro[0].transport_authority.name).toBe('Storstockholms Lokaltrafik');
      expect(lines.metro[0].contractor!.name).toBe('Connecting Stockholm');
    });
  });

  describe('getStopPoints', () => {
    it('should call correct URL', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slStopPointsResponse), { status: 200 })),
      );

      const api = new SLTransportApi();
      await api.getStopPoints();

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.pathname).toBe('/v1/stop-points');
    });

    it('should parse full stop point data', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slStopPointsResponse), { status: 200 })),
      );

      const api = new SLTransportApi();
      const points = await api.getStopPoints();

      expect(points).toHaveLength(1);
      expect(points[0].name).toBe('T-Centralen');
      expect(points[0].has_entrance).toBe(true);
      expect(points[0].door_orientation).toBe(228);
      expect(points[0].stop_area.type).toBe('METROSTN');
    });
  });

  describe('getTransportAuthorities', () => {
    it('should call correct URL', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(
          new Response(JSON.stringify(slTransportAuthoritiesResponse), {
            status: 200,
          }),
        ),
      );

      const api = new SLTransportApi();
      await api.getTransportAuthorities();

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.pathname).toBe('/v1/transport-authorities');
    });

    it('should parse transport authority data', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(
          new Response(JSON.stringify(slTransportAuthoritiesResponse), {
            status: 200,
          }),
        ),
      );

      const api = new SLTransportApi();
      const authorities = await api.getTransportAuthorities();

      expect(authorities).toHaveLength(1);
      expect(authorities[0].name).toBe('Storstockholms Lokaltrafik');
      expect(authorities[0].formal_name).toBe('AB Storstockholms Lokaltrafik');
      expect(authorities[0].code).toBe('SL');
      expect(authorities[0].city).toBe('Stockholm');
    });
  });

  describe('getCachedSites', () => {
    it('should fetch and cache sites on first call', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slSitesResponse), { status: 200 })),
      );

      const api = new SLTransportApi();
      const sites = await api.getCachedSites();

      expect(sites).toHaveLength(2);
      expect(sites[0].id).toBe(9001);
      expect(sites[0].name).toBe('T-Centralen');
      expect(sites[0].lat).toBeCloseTo(59.3314, 3);
      expect(sites[0].lon).toBeCloseTo(18.0604, 3);
    });

    it('should return cached data on subsequent calls', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slSitesResponse), { status: 200 })),
      );

      const api = new SLTransportApi();
      await api.getCachedSites();
      await api.getCachedSites();

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should sort sites by id', async () => {
      const unordered = [slSitesResponse[1], slSitesResponse[0]];
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(unordered), { status: 200 })),
      );

      const api = new SLTransportApi();
      const sites = await api.getCachedSites();

      for (let i = 1; i < sites.length; i++) {
        expect(sites[i].id).toBeGreaterThanOrEqual(sites[i - 1].id);
      }
    });

    it('should retry on fetch failure', async () => {
      let calls = 0;
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) => {
        calls++;
        if (calls === 1) {
          return Promise.resolve(new Response('Server Error', { status: 500 }));
        }
        return Promise.resolve(new Response(JSON.stringify(slSitesResponse), { status: 200 }));
      });

      const api = new SLTransportApi();
      await expect(api.getCachedSites()).rejects.toThrow();

      const sites = await api.getCachedSites();
      expect(sites).toHaveLength(2);
    });
  });

  describe('getSiteById', () => {
    it('should return site for a known ID', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slSitesResponse), { status: 200 })),
      );

      const api = new SLTransportApi();
      const site = await api.getSiteById(9192);

      expect(site).toBeDefined();
      expect(site!.name).toBe('Slussen');
    });

    it('should return undefined for an unknown ID', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slSitesResponse), { status: 200 })),
      );

      const api = new SLTransportApi();
      expect(await api.getSiteById(-1)).toBeUndefined();
    });
  });

  describe('getSiteByName', () => {
    it('should return site for an exact name match', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slSitesResponse), { status: 200 })),
      );

      const api = new SLTransportApi();
      const site = await api.getSiteByName('Slussen');

      expect(site).toBeDefined();
      expect(site!.id).toBe(9192);
    });

    it('should be case-insensitive', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slSitesResponse), { status: 200 })),
      );

      const api = new SLTransportApi();
      const lower = await api.getSiteByName('slussen');
      const upper = await api.getSiteByName('SLUSSEN');

      expect(lower).toBeDefined();
      expect(upper).toBeDefined();
      expect(lower!.id).toBe(upper!.id);
    });

    it('should return undefined for an unknown name', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slSitesResponse), { status: 200 })),
      );

      const api = new SLTransportApi();
      expect(await api.getSiteByName('Nonexistent Station XYZ')).toBeUndefined();
    });
  });

  describe('searchSitesByName', () => {
    it('should return matches for a substring query', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slSitesResponse), { status: 200 })),
      );

      const api = new SLTransportApi();
      const results = await api.searchSitesByName('Cent');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((s) => s.name === 'T-Centralen')).toBe(true);
    });

    it('should be case-insensitive', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slSitesResponse), { status: 200 })),
      );

      const api = new SLTransportApi();
      const lower = await api.searchSitesByName('slussen');
      const upper = await api.searchSitesByName('SLUSSEN');

      expect(lower.length).toBe(upper.length);
    });

    it('should return empty array for no matches', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slSitesResponse), { status: 200 })),
      );

      const api = new SLTransportApi();
      expect(await api.searchSitesByName('ZZZZNONEXISTENT')).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should throw ApiResponseError on non-OK response', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response('Server Error', { status: 500 })),
      );

      const api = new SLTransportApi();
      await expect(api.getDepartures(9001)).rejects.toThrow(ApiResponseError);
    });
  });

  describe('usage tracking', () => {
    it('should track requests across all endpoints', async () => {
      const api = new SLTransportApi();

      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slSitesResponse), { status: 200 })),
      );
      await api.getSites();

      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slDeparturesResponse), { status: 200 })),
      );
      await api.getDepartures(9001);
      await api.getDepartures(9192);

      const usage = api.getUsage();
      expect(usage.totalRequests).toBe(3);
      expect(usage.byEndpoint['/sites']).toBe(1);
      expect(usage.byEndpoint['/sites/9001/departures']).toBe(1);
      expect(usage.byEndpoint['/sites/9192/departures']).toBe(1);
    });
  });
});
