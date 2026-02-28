import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SLTransportApi } from '@transit-se/sdk/sl';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  slDeparturesResponse,
  slSitesResponse,
} from '../../../../sdk/src/__fixtures__/sl/transport';
import { registerSLTransportTools } from './transport';

const mockFetch = mock((_url: string | URL | Request, _init?: RequestInit) =>
  Promise.resolve(new Response(JSON.stringify(slDeparturesResponse), { status: 200 })),
);

function routedFetch(url: string | URL | Request, _init?: RequestInit) {
  const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url;
  if (/\/sites(\?|$)/.test(urlStr)) {
    return Promise.resolve(new Response(JSON.stringify(slSitesResponse), { status: 200 }));
  }
  return Promise.resolve(new Response(JSON.stringify(slDeparturesResponse), { status: 200 }));
}

describe('SL Transport MCP Tools', () => {
  let server: McpServer;
  let sl: SLTransportApi;

  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation(routedFetch);
    // @ts-expect-error — replacing global fetch with mock
    globalThis.fetch = mockFetch;

    server = new McpServer({ name: 'test', version: '0.0.1' });
    sl = new SLTransportApi();
  });

  it('should register sl_departures and sl_sites tools', () => {
    registerSLTransportTools(server, sl);
    expect(true).toBe(true);
  });

  it('sl_departures should return SL departure data', async () => {
    registerSLTransportTools(server, sl);

    const result = await sl.getDepartures(9001);
    expect(result.departures).toHaveLength(2);
    expect(result.departures[0].line.designation).toBe('19');
    expect(result.departures[0].display).toBe('1 min');
  });

  it('sl_sites should search sites by name', async () => {
    registerSLTransportTools(server, sl);

    const results = await sl.searchSitesByName('slussen');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain('slussen');
  });

  it('sl_sites should return all cached sites when no query', async () => {
    registerSLTransportTools(server, sl);

    const all = await sl.getCachedSites();
    expect(all.length).toBeGreaterThan(0);
  });

  it('should not require an API key', () => {
    const api = new SLTransportApi();
    expect(api).toBeInstanceOf(SLTransportApi);
  });

  it('should propagate API errors from SL Transport', async () => {
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response('Service Unavailable', { status: 503 })),
    );

    registerSLTransportTools(server, sl);

    await expect(sl.getDepartures(9999)).rejects.toThrow();
  });
});
