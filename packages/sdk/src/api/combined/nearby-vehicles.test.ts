import { fromPartial } from '@total-typescript/shoehorn';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  expectedNearbyVehiclesResult,
  mockStopPoints,
  mockVehiclePositions,
} from '../../__fixtures__/combined/nearby-vehicles';
import { TransitError } from '../../errors';
import type { SLSiteEntry } from '../../types/sl/transport';
import type { GtfsVehiclePositionsApi } from '../gtfs/vehicle-positions';
import type { SLTransportApi } from '../sl/transport';
import { CombinedSLNearbyVehiclesApi } from './nearby-vehicles';

const SOLNA: SLSiteEntry = { id: 9305, name: 'Solna centrum', lat: 59.3587, lon: 17.9976 };

const mockSites: Array<SLSiteEntry> = [SOLNA];

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

describe('CombinedSLNearbyVehiclesApi', () => {
  let api: CombinedSLNearbyVehiclesApi;
  let mocks: ReturnType<typeof createMockApis>;

  beforeEach(() => {
    mocks = createMockApis();
    api = new CombinedSLNearbyVehiclesApi(mocks);
  });

  it('should find vehicles near a site by name', async () => {
    const result = await api.getNearbyVehicles({ siteName: 'Solna centrum' });

    expect(result.location.name).toBe('Solna centrum');
    expect(result.location.siteId).toBe(9305);
    expect(result.radiusKm).toBe(expectedNearbyVehiclesResult.radiusKm);
    expect(result.vehicles).toHaveLength(expectedNearbyVehiclesResult.vehicleCount);
  });

  it('should find vehicles near a site by ID', async () => {
    const result = await api.getNearbyVehicles({ siteId: 9305 });

    expect(result.location.name).toBe('Solna centrum');
    expect(result.vehicles).toHaveLength(expectedNearbyVehiclesResult.vehicleCount);
  });

  it('should find vehicles near a coordinate', async () => {
    const result = await api.getNearbyVehicles({ latitude: 59.3587, longitude: 17.9976 });

    expect(result.location.siteId).toBe(9305);
    expect(result.vehicles.length).toBeGreaterThan(0);
  });

  it('should classify vehicles by transport mode using nearest stop point', async () => {
    const result = await api.getNearbyVehicles({ siteName: 'Solna centrum' });

    const modes = result.vehicles.map((v) => v.transportMode);
    expect(modes).toContain('metro');
    expect(modes).toContain('bus');
    expect(modes).toContain('tram');
  });

  it('should populate activeModes from detected vehicle types', async () => {
    const result = await api.getNearbyVehicles({ siteName: 'Solna centrum' });

    expect(result.activeModes.sort()).toEqual(expectedNearbyVehiclesResult.activeModes.sort());
  });

  it('should sort vehicles by distance (closest first)', async () => {
    const result = await api.getNearbyVehicles({ siteName: 'Solna centrum' });

    for (let i = 1; i < result.vehicles.length; i++) {
      expect(result.vehicles[i].distanceMeters).toBeGreaterThanOrEqual(
        result.vehicles[i - 1].distanceMeters,
      );
    }
  });

  it('should exclude vehicles outside the radius', async () => {
    const result = await api.getNearbyVehicles({ siteName: 'Solna centrum', radiusKm: 1.0 });

    const ids = result.vehicles.map((v) => v.id);
    expect(ids).not.toContain('vp-far-away');
  });

  it('should include nearestStopPoint info on each vehicle', async () => {
    const result = await api.getNearbyVehicles({ siteName: 'Solna centrum' });

    for (const v of result.vehicles) {
      expect(v.nearestStopPoint).toBeDefined();
      expect(v.nearestStopPoint!.name).toBeTruthy();
      expect(v.nearestStopPoint!.distanceMeters).toBeGreaterThanOrEqual(0);
    }
  });

  it('should preserve vehicle metadata (vehicleId, trip, timestamp)', async () => {
    const result = await api.getNearbyVehicles({ siteName: 'Solna centrum' });

    const metro = result.vehicles.find((v) => v.transportMode === 'metro')!;
    expect(metro.vehicleId).toBe('9031001001004617');
    expect(metro.trip?.tripId).toBe('trip-m1');
    expect(metro.timestamp).toBe(1709100900);
  });

  it('should cache stop points across calls', async () => {
    await api.getNearbyVehicles({ siteName: 'Solna centrum' });
    await api.getNearbyVehicles({ siteName: 'Solna centrum' });

    expect(mocks.slTransportApi.getStopPoints).toHaveBeenCalledTimes(1);
  });

  it('should throw TransitError for unknown site name', async () => {
    await expect(
      api.getNearbyVehicles({ siteName: 'Nonexistent Station XYZ' }),
    ).rejects.toBeInstanceOf(TransitError);
  });

  it('should throw TransitError for unknown site ID', async () => {
    await expect(api.getNearbyVehicles({ siteId: 999999 })).rejects.toBeInstanceOf(TransitError);
  });

  it('should throw TransitError when no location params provided', async () => {
    await expect(api.getNearbyVehicles({})).rejects.toBeInstanceOf(TransitError);
  });

  it('should respect custom radius', async () => {
    const small = await api.getNearbyVehicles({ siteName: 'Solna centrum', radiusKm: 0.05 });
    const large = await api.getNearbyVehicles({ siteName: 'Solna centrum', radiusKm: 5.0 });

    expect(large.vehicles.length).toBeGreaterThanOrEqual(small.vehicles.length);
  });

  it('should filter out negative speed values', async () => {
    const result = await api.getNearbyVehicles({ siteName: 'Solna centrum' });

    for (const v of result.vehicles) {
      if (v.position.speed != null) {
        expect(v.position.speed).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('should aggregate usage from sub-APIs', () => {
    const usage = api.getUsage();
    expect(usage).toHaveProperty('totalRequests');
    expect(usage).toHaveProperty('byEndpoint');
  });
});
