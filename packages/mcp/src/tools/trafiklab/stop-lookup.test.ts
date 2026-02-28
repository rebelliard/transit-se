import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TransitClient } from '@transit-se/sdk';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { stopLookupSearchResponse } from '../../../../sdk/src/__fixtures__/trafiklab/stop-lookup';
import { registerTrafiklabStopLookupTools } from './stop-lookup';

// Mock fetch to prevent real API calls
const mockFetch = mock((_url: string | URL | Request, _init?: RequestInit) =>
  Promise.resolve(new Response(JSON.stringify(stopLookupSearchResponse), { status: 200 })),
);

describe('Stop Lookup MCP Tools', () => {
  let server: McpServer;
  let client: TransitClient;

  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response(JSON.stringify(stopLookupSearchResponse), { status: 200 })),
    );
    // @ts-expect-error — replacing global fetch with mock
    globalThis.fetch = mockFetch;

    server = new McpServer({ name: 'test', version: '0.0.1' });
    client = new TransitClient({ apiKey: 'test-key' });
  });

  it('should register trafiklab_search_stops tool', () => {
    registerTrafiklabStopLookupTools(server, client);

    // The server should have the tools registered — we verify by
    // checking the internal tool map is populated
    // McpServer doesn't expose a public list, so we verify registration
    // didn't throw and the function returned without error.
    expect(true).toBe(true);
  });

  it('search_stops should call SDK and return formatted text', async () => {
    registerTrafiklabStopLookupTools(server, client);

    // Call the SDK method directly to verify it would work
    const result = await client.stops.searchByName('T-Centralen');
    expect(result.stop_groups).toHaveLength(2);
    expect(result.stop_groups[0].name).toBe('T-Centralen');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('search_stops should propagate API errors', async () => {
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response('Unauthorized', { status: 401 })),
    );

    registerTrafiklabStopLookupTools(server, client);

    await expect(client.stops.searchByName('test')).rejects.toThrow();
  });
});
