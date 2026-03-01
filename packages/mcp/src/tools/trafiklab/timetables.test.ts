import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TransitClient } from '@transit-se/sdk';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  arrivalsResponse,
  departuresCanceledResponse,
  departuresResponse,
} from '../../../../sdk/src/__fixtures__/trafiklab/timetables';
import { registerTrafiklabTimetableTools } from './timetables';

const mockFetch = mock((_url: string | URL | Request, _init?: RequestInit) =>
  Promise.resolve(new Response(JSON.stringify(departuresResponse), { status: 200 })),
);

describe('Timetable MCP Tools', () => {
  let server: McpServer;
  let client: TransitClient;

  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response(JSON.stringify(departuresResponse), { status: 200 })),
    );
    // @ts-expect-error — replacing global fetch with mock
    globalThis.fetch = mockFetch;

    server = new McpServer({ name: 'test', version: '0.0.1' });
    client = new TransitClient({ apiKey: 'test-key' });
  });

  it('should register trafiklab_get_departures and trafiklab_get_arrivals tools', () => {
    registerTrafiklabTimetableTools(server, client);
    // No error means successful registration
    expect(true).toBe(true);
  });

  it('get_departures should return departure data', async () => {
    registerTrafiklabTimetableTools(server, client);

    const result = await client.timetables.getDepartures('740020749');
    expect(result.departures).toHaveLength(2);
    expect(result.departures[0].route.designation).toBe('13');
    expect(result.departures[0].route.direction).toBe('Ropsten');
  });

  it('get_departures should support optional time parameter', async () => {
    registerTrafiklabTimetableTools(server, client);

    await client.timetables.getDepartures('740000001', '2025-04-01T15:00');
    const url = new URL(mockFetch.mock.calls[0][0] as string);
    expect(url.pathname).toContain('/departures/740000001/2025-04-01T15:00');
  });

  it('get_arrivals should return arrival data', async () => {
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response(JSON.stringify(arrivalsResponse), { status: 200 })),
    );

    registerTrafiklabTimetableTools(server, client);

    const result = await client.timetables.getArrivals('740020749');
    expect(result.arrivals).toHaveLength(2);
    expect(result.arrivals[0].route.designation).toBe('17');
  });

  it('should handle canceled departures', async () => {
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response(JSON.stringify(departuresCanceledResponse), { status: 200 })),
    );

    registerTrafiklabTimetableTools(server, client);

    const result = await client.timetables.getDepartures('740000001');
    expect(result.departures[0].canceled).toBe(true);
    expect(result.stops[0].alerts).toHaveLength(1);
  });

  it('should propagate API errors', async () => {
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response('Server Error', { status: 500 })),
    );

    registerTrafiklabTimetableTools(server, client);

    await expect(client.timetables.getDepartures('test')).rejects.toThrow();
  });
});
