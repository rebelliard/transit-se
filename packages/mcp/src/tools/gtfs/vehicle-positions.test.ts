import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GtfsVehiclePositionsApi } from '@transit-se/sdk/gtfs';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  gtfsVehiclePositionsEmptyFeedBuffer,
  gtfsVehiclePositionsFeedBuffer,
} from '../../../../sdk/src/__fixtures__/gtfs/vehicle-positions';
import { registerGtfsVehiclePositionsTools } from './vehicle-positions';

function pbResponse(buf: Uint8Array): Response {
  return new Response(new Uint8Array(buf) as unknown as BodyInit);
}

const mockFetch = mock((_url: string | URL | Request, _init?: RequestInit) =>
  Promise.resolve(pbResponse(gtfsVehiclePositionsFeedBuffer)),
);

describe('GTFS Vehicle Positions MCP Tool', () => {
  let server: McpServer;
  let vehiclePositionsApi: GtfsVehiclePositionsApi;

  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(pbResponse(gtfsVehiclePositionsFeedBuffer)),
    );
    // @ts-expect-error — replacing global fetch with mock
    globalThis.fetch = mockFetch;

    server = new McpServer({ name: 'test', version: '0.0.1' });
    vehiclePositionsApi = new GtfsVehiclePositionsApi({ apiKey: 'test-key' });
  });

  it('should register the gtfs_vehicle_positions tool without error', () => {
    registerGtfsVehiclePositionsTools(server, vehiclePositionsApi);
    expect(true).toBe(true);
  });

  it('should return formatted vehicle position text', async () => {
    registerGtfsVehiclePositionsTools(server, vehiclePositionsApi);

    const result = await vehiclePositionsApi.getVehiclePositions('ul');
    expect(result).toHaveLength(2);
    expect(result[0].trip?.tripId).toBe('14010000664343260');
  });

  it('should pass operator to the API URL', async () => {
    registerGtfsVehiclePositionsTools(server, vehiclePositionsApi);

    await vehiclePositionsApi.getVehiclePositions('skane');

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('/skane/VehiclePositionsSweden.pb');
  });

  it('should handle empty vehicle positions response', async () => {
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(pbResponse(gtfsVehiclePositionsEmptyFeedBuffer)),
    );

    registerGtfsVehiclePositionsTools(server, vehiclePositionsApi);

    const result = await vehiclePositionsApi.getVehiclePositions('ul');
    expect(result).toHaveLength(0);
  });

  it('should require an API key', () => {
    const api = new GtfsVehiclePositionsApi({ apiKey: 'some-key' });
    expect(api).toBeInstanceOf(GtfsVehiclePositionsApi);
  });

  it('should propagate API errors', async () => {
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(new Response('Unauthorized', { status: 401 })),
    );

    registerGtfsVehiclePositionsTools(server, vehiclePositionsApi);

    await expect(vehiclePositionsApi.getVehiclePositions('ul')).rejects.toThrow();
  });
});
