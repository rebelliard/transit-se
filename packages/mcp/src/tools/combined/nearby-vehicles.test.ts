import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { fromPartial } from '@total-typescript/shoehorn';
import type { GtfsVehiclePositionsApi } from '@transit-se/sdk/gtfs';
import type { SLSiteEntry, SLTransportApi } from '@transit-se/sdk/sl';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  mockStopPoints,
  mockVehiclePositions,
} from '../../../../sdk/src/__fixtures__/combined/nearby-vehicles';
import { CombinedSLNearbyVehiclesApi } from '../../../../sdk/src/api/combined/nearby-vehicles';
import { formatCombinedSLNearbyVehicles } from '../../formatting';
import { registerCombinedSLNearbyVehiclesTools } from './nearby-vehicles';

const T_CENTRALEN: SLSiteEntry = {
  id: 9001,
  name: 'T-Centralen',
  lat: 59.3314,
  lon: 18.0604,
};
const mockSites: Array<SLSiteEntry> = [T_CENTRALEN];

function createMockApis() {
  return {
    vehiclePositionsApi: fromPartial<GtfsVehiclePositionsApi>({
      getVehiclePositions: mock(() => Promise.resolve(mockVehiclePositions)),
      getUsage: () => ({ totalRequests: 0, byEndpoint: {} }),
    }),
    slTransportApi: fromPartial<SLTransportApi>({
      getStopPoints: mock(() => Promise.resolve(mockStopPoints)),
      getSiteById: mock((id: number) => Promise.resolve(mockSites.find((s) => s.id === id))),
      getSiteByName: mock((name: string) =>
        Promise.resolve(mockSites.find((s) => s.name.toLowerCase() === name.toLowerCase())),
      ),
      searchSitesByName: mock((query: string) =>
        Promise.resolve(
          mockSites.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())),
        ),
      ),
      getCachedSites: mock(() => Promise.resolve(mockSites)),
      getUsage: () => ({ totalRequests: 0, byEndpoint: {} }),
    }),
  };
}

describe('Combined SL Nearby Vehicles MCP Tool', () => {
  let server: McpServer;
  let api: CombinedSLNearbyVehiclesApi;

  beforeEach(() => {
    const mocks = createMockApis();
    api = new CombinedSLNearbyVehiclesApi(mocks);
    server = new McpServer({ name: 'test', version: '0.0.1' });
  });

  it('should register the combined_nearby_vehicles tool without error', () => {
    registerCombinedSLNearbyVehiclesTools(server, api);
    expect(true).toBe(true);
  });

  it('should return nearby vehicles with transport modes', async () => {
    registerCombinedSLNearbyVehiclesTools(server, api);

    const result = await api.getNearbyVehicles({ siteName: 'T-Centralen' });
    expect(result.vehicles.length).toBeGreaterThan(0);
    expect(result.activeModes.length).toBeGreaterThan(0);
  });

  it('should format output as readable text', async () => {
    const result = await api.getNearbyVehicles({ siteName: 'T-Centralen' });
    const text = formatCombinedSLNearbyVehicles(result);

    expect(text).toContain('T-Centralen');
    expect(text).toContain('METRO');
    expect(text).toContain('BUS');
  });

  it('should format empty results gracefully', () => {
    const text = formatCombinedSLNearbyVehicles({
      location: { name: 'Nowhere', siteId: 1, latitude: 0, longitude: 0 },
      radiusKm: 1.0,
      vehicles: [],
      activeModes: [],
      timestamp: 0,
    });

    expect(text).toContain('No vehicles found');
  });

  it('should accept site_id parameter', async () => {
    registerCombinedSLNearbyVehiclesTools(server, api);

    const result = await api.getNearbyVehicles({ siteId: 9001 });
    expect(result.location.siteId).toBe(9001);
  });

  it('should accept lat/lon parameters', async () => {
    registerCombinedSLNearbyVehiclesTools(server, api);

    const result = await api.getNearbyVehicles({ latitude: 59.3314, longitude: 18.0604 });
    expect(result.vehicles.length).toBeGreaterThan(0);
  });
});
