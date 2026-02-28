import { beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  slDeviationElevator,
  slDeviationsEmptyResponse,
  slDeviationsResponse,
} from '../../__fixtures__/sl/deviations';
import { ApiResponseError } from '../../errors';
import { SLDeviationsApi } from './deviations';

const mockFetch = mock((_url: string | URL | Request, _init?: RequestInit) =>
  Promise.resolve(new Response(JSON.stringify(slDeviationsResponse), { status: 200 })),
);

describe('SLDeviationsApi', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response(JSON.stringify(slDeviationsResponse), { status: 200 })),
    );
    // @ts-expect-error — replacing global fetch with mock
    globalThis.fetch = mockFetch;
  });

  describe('constructor', () => {
    it('should not require an API key', () => {
      expect(() => new SLDeviationsApi()).not.toThrow();
    });

    it('should allow overriding the base URL', () => {
      const api = new SLDeviationsApi({ baseUrl: 'https://custom.test/v2' });
      expect(api).toBeInstanceOf(SLDeviationsApi);
    });
  });

  describe('getDeviations', () => {
    it('should call the correct URL with no params', async () => {
      const api = new SLDeviationsApi();
      await api.getDeviations();

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.pathname).toBe('/v1/messages');
      expect(url.search).toBe('');
    });

    it('should set future=true when requested', async () => {
      const api = new SLDeviationsApi();
      await api.getDeviations({ future: true });

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.searchParams.get('future')).toBe('true');
    });

    it('should set future=false explicitly', async () => {
      const api = new SLDeviationsApi();
      await api.getDeviations({ future: false });

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.searchParams.get('future')).toBe('false');
    });

    it('should append multiple transport_mode params', async () => {
      const api = new SLDeviationsApi();
      await api.getDeviations({ transportModes: ['METRO', 'TRAM'] });

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.searchParams.getAll('transport_mode')).toEqual(['METRO', 'TRAM']);
    });

    it('should append multiple site params', async () => {
      const api = new SLDeviationsApi();
      await api.getDeviations({ siteIds: [1051, 2711] });

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.searchParams.getAll('site')).toEqual(['1051', '2711']);
    });

    it('should append multiple line params', async () => {
      const api = new SLDeviationsApi();
      await api.getDeviations({ lineIds: [13, 14] });

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.searchParams.getAll('line')).toEqual(['13', '14']);
    });

    it('should set transport_authority param', async () => {
      const api = new SLDeviationsApi();
      await api.getDeviations({ transportAuthority: 1 });

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.searchParams.get('transport_authority')).toBe('1');
    });

    it('should combine multiple filter params', async () => {
      const api = new SLDeviationsApi();
      await api.getDeviations({ future: true, transportModes: ['METRO'], lineIds: [13] });

      const url = new URL(mockFetch.mock.calls[0][0] as string);
      expect(url.searchParams.get('future')).toBe('true');
      expect(url.searchParams.getAll('transport_mode')).toEqual(['METRO']);
      expect(url.searchParams.getAll('line')).toEqual(['13']);
    });

    it('should parse deviation array response', async () => {
      const api = new SLDeviationsApi();
      const result = await api.getDeviations();

      expect(result).toHaveLength(2);
      expect(result[0].deviation_case_id).toBe(10444305);
      expect(result[0].message_variants[0].header).toBe('Avstängd hiss vid Skärholmen');
    });

    it('should parse scope stop areas and lines', async () => {
      const api = new SLDeviationsApi();
      const result = await api.getDeviations();

      const first = result[0];
      expect(first.scope.stop_areas).toHaveLength(1);
      expect(first.scope.stop_areas![0].name).toBe('Skärholmen');
      expect(first.scope.lines).toHaveLength(1);
      expect(first.scope.lines![0].designation).toBe('13');
      expect(first.scope.lines![0].transport_mode).toBe('METRO');
    });

    it('should parse priority fields', async () => {
      const api = new SLDeviationsApi();
      const result = await api.getDeviations();

      expect(result[0].priority.importance_level).toBe(2);
      expect(result[0].priority.influence_level).toBe(3);
      expect(result[0].priority.urgency_level).toBe(1);
    });

    it('should parse categories when present', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify([slDeviationElevator]), { status: 200 })),
      );

      const api = new SLDeviationsApi();
      const result = await api.getDeviations();

      expect(result[0].categories).toHaveLength(1);
      expect(result[0].categories![0].group).toBe('FACILITY');
      expect(result[0].categories![0].type).toBe('LIFT');
    });

    it('should return empty array when no deviations', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(slDeviationsEmptyResponse), { status: 200 })),
      );

      const api = new SLDeviationsApi();
      const result = await api.getDeviations();

      expect(result).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should throw ApiResponseError on non-OK response', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response('Service Unavailable', { status: 503 })),
      );

      const api = new SLDeviationsApi();
      await expect(api.getDeviations()).rejects.toThrow(ApiResponseError);
    });
  });

  describe('usage tracking', () => {
    it('should track requests to the messages endpoint', async () => {
      const api = new SLDeviationsApi();
      await api.getDeviations();
      await api.getDeviations({ transportModes: ['METRO'] });

      const usage = api.getUsage();
      expect(usage.totalRequests).toBe(2);
      expect(usage.byEndpoint['/messages']).toBe(2);
    });
  });
});
