import { beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  gtfsVehiclePositionsEmptyFeedBuffer,
  gtfsVehiclePositionsEmptyResponse,
  gtfsVehiclePositionsFeedBuffer,
  gtfsVehiclePositionsResponse,
} from '../../__fixtures__/gtfs/vehicle-positions';
import { ApiResponseError } from '../../errors';
import { GtfsVehiclePositionsApi } from './vehicle-positions';

function pbResponse(buf: Uint8Array): Response {
  return new Response(new Uint8Array(buf) as unknown as BodyInit);
}

const mockFetch = mock((_url: string | URL | Request, _init?: RequestInit) =>
  Promise.resolve(pbResponse(gtfsVehiclePositionsFeedBuffer)),
);

describe('GtfsVehiclePositionsApi', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(pbResponse(gtfsVehiclePositionsFeedBuffer)),
    );
    // @ts-expect-error — replacing global fetch with mock
    globalThis.fetch = mockFetch;
  });

  describe('constructor', () => {
    it('should require an API key', () => {
      const api = new GtfsVehiclePositionsApi({ apiKey: 'test-key' });
      expect(api).toBeInstanceOf(GtfsVehiclePositionsApi);
    });

    it('should allow overriding the base URL', () => {
      const api = new GtfsVehiclePositionsApi({
        apiKey: 'test-key',
        baseUrl: 'https://custom.test',
      });
      expect(api).toBeInstanceOf(GtfsVehiclePositionsApi);
    });
  });

  describe('getVehiclePositions', () => {
    it('should call the correct URL for an operator', async () => {
      const api = new GtfsVehiclePositionsApi({ apiKey: 'test-key' });
      await api.getVehiclePositions('ul');

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('/ul/VehiclePositionsSweden.pb');
      expect(url).toContain('key=test-key');
    });

    it('should parse vehicle positions from protobuf feed', async () => {
      const api = new GtfsVehiclePositionsApi({ apiKey: 'test-key' });
      const result = await api.getVehiclePositions('ul');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(gtfsVehiclePositionsResponse[0].id);
      expect(result[0].trip?.tripId).toBe(gtfsVehiclePositionsResponse[0].trip?.tripId);
    });

    it('should parse position coordinates', async () => {
      const api = new GtfsVehiclePositionsApi({ apiKey: 'test-key' });
      const result = await api.getVehiclePositions('ul');

      expect(result[0].position).toBeDefined();
      expect(result[0].position!.latitude).toBeCloseTo(59.33179, 4);
      expect(result[0].position!.longitude).toBeCloseTo(18.02621, 4);
      expect(result[0].position!.bearing).toBe(90);
      expect(result[0].position!.speed).toBeCloseTo(10.6, 1);
    });

    it('should parse vehicle descriptor', async () => {
      const api = new GtfsVehiclePositionsApi({ apiKey: 'test-key' });
      const result = await api.getVehiclePositions('ul');

      expect(result[0].vehicle).toBeDefined();
      expect(result[0].vehicle!.id).toBe('9031001001004806');
      expect(result[0].vehicle!.label).toBe('Pendeltåg 43');
      expect(result[0].vehicle!.licensePlate).toBe('SL4806');
    });

    it('should parse trip descriptor', async () => {
      const api = new GtfsVehiclePositionsApi({ apiKey: 'test-key' });
      const result = await api.getVehiclePositions('ul');

      expect(result[0].trip?.routeId).toBe('9011001004300000');
      expect(result[0].trip?.directionId).toBe(0);
      expect(result[0].trip?.startTime).toBe('14:45:00');
      expect(result[0].trip?.startDate).toBe('20260301');
      expect(result[0].trip?.scheduleRelationship).toBe('SCHEDULED');
    });

    it('should map vehicle stop status enums', async () => {
      const api = new GtfsVehiclePositionsApi({ apiKey: 'test-key' });
      const result = await api.getVehiclePositions('ul');

      expect(result[0].currentStatus).toBe('IN_TRANSIT_TO');
      expect(result[1].currentStatus).toBe('STOPPED_AT');
    });

    it('should map congestion level', async () => {
      const api = new GtfsVehiclePositionsApi({ apiKey: 'test-key' });
      const result = await api.getVehiclePositions('ul');

      expect(result[0].congestionLevel).toBe('RUNNING_SMOOTHLY');
      expect(result[1].congestionLevel).toBeUndefined();
    });

    it('should map occupancy status', async () => {
      const api = new GtfsVehiclePositionsApi({ apiKey: 'test-key' });
      const result = await api.getVehiclePositions('ul');

      expect(result[0].occupancyStatus).toBe('FEW_SEATS_AVAILABLE');
      expect(result[0].occupancyPercentage).toBe(45);
      expect(result[1].occupancyStatus).toBeUndefined();
    });

    it('should parse current stop sequence and stop ID', async () => {
      const api = new GtfsVehiclePositionsApi({ apiKey: 'test-key' });
      const result = await api.getVehiclePositions('ul');

      expect(result[0].currentStopSequence).toBe(12);
      expect(result[0].stopId).toBe('9022050013110001');
    });

    it('should parse timestamp', async () => {
      const api = new GtfsVehiclePositionsApi({ apiKey: 'test-key' });
      const result = await api.getVehiclePositions('ul');

      expect(result[0].timestamp).toBe(1772374517);
      expect(result[1].timestamp).toBe(1772374517);
    });

    it('should return empty array when no vehicle positions', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(pbResponse(gtfsVehiclePositionsEmptyFeedBuffer)),
      );

      const api = new GtfsVehiclePositionsApi({ apiKey: 'test-key' });
      const result = await api.getVehiclePositions('ul');

      expect(result).toEqual(gtfsVehiclePositionsEmptyResponse);
    });

    it('should handle minimal vehicle position (position only)', async () => {
      const api = new GtfsVehiclePositionsApi({ apiKey: 'test-key' });
      const result = await api.getVehiclePositions('ul');

      expect(result[1].position).toBeDefined();
      expect(result[1].position!.bearing).toBeUndefined();
      expect(result[1].position!.speed).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should throw ApiResponseError on non-OK response', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response('Unauthorized', { status: 401 })),
      );

      const api = new GtfsVehiclePositionsApi({ apiKey: 'bad-key' });
      await expect(api.getVehiclePositions('ul')).rejects.toThrow(ApiResponseError);
    });
  });

  describe('usage tracking', () => {
    it('should track requests per operator', async () => {
      const api = new GtfsVehiclePositionsApi({ apiKey: 'test-key' });
      await api.getVehiclePositions('ul');
      await api.getVehiclePositions('skane');
      await api.getVehiclePositions('ul');

      const usage = api.getUsage();
      expect(usage.totalRequests).toBe(3);
      expect(usage.byEndpoint['/ul/VehiclePositionsSweden.pb']).toBe(2);
      expect(usage.byEndpoint['/skane/VehiclePositionsSweden.pb']).toBe(1);
    });
  });
});
