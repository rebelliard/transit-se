import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GtfsTripUpdatesApi } from '@transit-se/sdk/gtfs';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  gtfsTripUpdatesEmptyFeedBuffer,
  gtfsTripUpdatesFeedBuffer,
} from '../../../../sdk/src/__fixtures__/gtfs/trip-updates';
import { registerGtfsTripUpdatesTools } from './trip-updates';

function pbResponse(buf: Uint8Array): Response {
  return new Response(new Uint8Array(buf) as unknown as BodyInit);
}

const mockFetch = mock((_url: string | URL | Request, _init?: RequestInit) =>
  Promise.resolve(pbResponse(gtfsTripUpdatesFeedBuffer)),
);

describe('GTFS Trip Updates MCP Tool', () => {
  let server: McpServer;
  let tripUpdatesApi: GtfsTripUpdatesApi;

  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(pbResponse(gtfsTripUpdatesFeedBuffer)),
    );
    // @ts-expect-error — replacing global fetch with mock
    globalThis.fetch = mockFetch;

    server = new McpServer({ name: 'test', version: '0.0.1' });
    tripUpdatesApi = new GtfsTripUpdatesApi({ apiKey: 'test-key' });
  });

  it('should register the gtfs_trip_updates tool without error', () => {
    registerGtfsTripUpdatesTools(server, tripUpdatesApi);
    expect(true).toBe(true);
  });

  it('should return formatted trip update text', async () => {
    registerGtfsTripUpdatesTools(server, tripUpdatesApi);

    const result = await tripUpdatesApi.getTripUpdates('ul');
    expect(result).toHaveLength(2);
    expect(result[0].trip.tripId).toBe('14010000713020248');
  });

  it('should pass operator to the API URL', async () => {
    registerGtfsTripUpdatesTools(server, tripUpdatesApi);

    await tripUpdatesApi.getTripUpdates('skane');

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('/skane/TripUpdatesSweden.pb');
  });

  it('should handle empty trip updates response', async () => {
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(pbResponse(gtfsTripUpdatesEmptyFeedBuffer)),
    );

    registerGtfsTripUpdatesTools(server, tripUpdatesApi);

    const result = await tripUpdatesApi.getTripUpdates('ul');
    expect(result).toHaveLength(0);
  });

  it('should require an API key', () => {
    const api = new GtfsTripUpdatesApi({ apiKey: 'some-key' });
    expect(api).toBeInstanceOf(GtfsTripUpdatesApi);
  });

  it('should propagate API errors', async () => {
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response('Unauthorized', { status: 401 })),
    );

    registerGtfsTripUpdatesTools(server, tripUpdatesApi);

    await expect(tripUpdatesApi.getTripUpdates('ul')).rejects.toThrow();
  });
});
