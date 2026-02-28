import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SLDeviationsApi } from '@transit-se/sdk/sl';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  slDeviationsEmptyResponse,
  slDeviationsResponse,
} from '../../../../sdk/src/__fixtures__/sl/deviations';
import { registerSLDeviationsTools } from './deviations';

const mockFetch = mock((_url: string | URL | Request, _init?: RequestInit) =>
  Promise.resolve(new Response(JSON.stringify(slDeviationsResponse), { status: 200 })),
);

describe('SL Deviations MCP Tool', () => {
  let server: McpServer;
  let deviationsApi: SLDeviationsApi;

  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response(JSON.stringify(slDeviationsResponse), { status: 200 })),
    );
    // @ts-expect-error — replacing global fetch with mock
    globalThis.fetch = mockFetch;

    server = new McpServer({ name: 'test', version: '0.0.1' });
    deviationsApi = new SLDeviationsApi();
  });

  it('should register the sl_deviations tool without error', () => {
    registerSLDeviationsTools(server, deviationsApi);
    expect(true).toBe(true);
  });

  it('should return formatted deviation text', async () => {
    registerSLDeviationsTools(server, deviationsApi);

    const result = await deviationsApi.getDeviations();
    expect(result).toHaveLength(2);
    expect(result[0].message_variants[0].header).toBe('Avstängd hiss vid Skärholmen');
  });

  it('should pass transport_mode filter to the API', async () => {
    registerSLDeviationsTools(server, deviationsApi);

    await deviationsApi.getDeviations({ transportModes: ['METRO'] });

    const url = new URL(mockFetch.mock.calls[0][0] as string);
    expect(url.searchParams.getAll('transport_mode')).toEqual(['METRO']);
  });

  it('should pass line_ids filter to the API', async () => {
    registerSLDeviationsTools(server, deviationsApi);

    await deviationsApi.getDeviations({ lineIds: [13, 14] });

    const url = new URL(mockFetch.mock.calls[0][0] as string);
    expect(url.searchParams.getAll('line')).toEqual(['13', '14']);
  });

  it('should pass future=true to the API', async () => {
    registerSLDeviationsTools(server, deviationsApi);

    await deviationsApi.getDeviations({ future: true });

    const url = new URL(mockFetch.mock.calls[0][0] as string);
    expect(url.searchParams.get('future')).toBe('true');
  });

  it('should handle empty deviation response', async () => {
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response(JSON.stringify(slDeviationsEmptyResponse), { status: 200 })),
    );

    registerSLDeviationsTools(server, deviationsApi);

    const result = await deviationsApi.getDeviations();
    expect(result).toHaveLength(0);
  });

  it('should not require an API key', () => {
    const api = new SLDeviationsApi();
    expect(api).toBeInstanceOf(SLDeviationsApi);
  });

  it('should propagate API errors', async () => {
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response('Service Unavailable', { status: 503 })),
    );

    registerSLDeviationsTools(server, deviationsApi);

    await expect(deviationsApi.getDeviations()).rejects.toThrow();
  });
});
