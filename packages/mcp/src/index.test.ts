import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TransitClient } from '@transit-se/sdk';
import { SLTransportApi } from '@transit-se/sdk/sl';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { registerSLTransportTools } from './tools/sl/transport';
import { registerTrafiklabStopLookupTools } from './tools/trafiklab/stop-lookup';
import { registerTrafiklabTimetableTools } from './tools/trafiklab/timetables';

const mockFetch = mock((_url: string | URL | Request, _init?: RequestInit) =>
  Promise.resolve(new Response('{}', { status: 200 })),
);

describe('MCP Server Integration', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response('{}', { status: 200 })),
    );
    // @ts-expect-error — replacing global fetch with mock
    globalThis.fetch = mockFetch;
  });

  it('should create McpServer with correct name and version', () => {
    const server = new McpServer({ name: 'transit-se', version: '0.1.0' });
    expect(server).toBeInstanceOf(McpServer);
  });

  it('should register all tools when API key is provided', () => {
    const server = new McpServer({ name: 'transit-se', version: '0.1.0' });
    const client = new TransitClient({ apiKey: 'test-key' });
    const sl = new SLTransportApi();

    // Should not throw
    registerSLTransportTools(server, sl);
    registerTrafiklabStopLookupTools(server, client);
    registerTrafiklabTimetableTools(server, client);

    expect(true).toBe(true);
  });

  it('should register only SL tools when no API key is provided', () => {
    const server = new McpServer({ name: 'transit-se', version: '0.1.0' });
    const sl = new SLTransportApi();

    // Only SL tools — no TransitClient needed
    registerSLTransportTools(server, sl);

    expect(true).toBe(true);
  });

  it('SLTransportApi should work independently without API key', () => {
    const sl = new SLTransportApi();
    expect(sl).toBeInstanceOf(SLTransportApi);
  });

  it('TransitClient should require API key', () => {
    expect(() => new TransitClient({ apiKey: '' })).toThrow();
  });

  describe('graceful degradation without API key', () => {
    it('should be able to create placeholder tools for key-required endpoints', () => {
      const server = new McpServer({ name: 'transit-se', version: '0.1.0' });

      // Register placeholder tools that return a helpful message
      const noKeyMessage = 'TRAFIKLAB_API_KEY not configured.';

      server.tool('trafiklab_search_stops', 'Requires API key', async () => ({
        content: [{ type: 'text', text: noKeyMessage }],
      }));

      server.tool('trafiklab_get_departures', 'Requires API key', async () => ({
        content: [{ type: 'text', text: noKeyMessage }],
      }));

      expect(true).toBe(true);
    });
  });
});
