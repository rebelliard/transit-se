import { beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  gtfsTripUpdatesEmptyFeedBuffer,
  gtfsTripUpdatesEmptyResponse,
  gtfsTripUpdatesFeedBuffer,
  gtfsTripUpdatesResponse,
  gtfsTripUpdatesSkippedStopFeedBuffer,
} from '../../__fixtures__/gtfs/trip-updates';
import { ApiResponseError } from '../../errors';
import { GtfsTripUpdatesApi } from './trip-updates';

function pbResponse(buf: Uint8Array): Response {
  return new Response(new Uint8Array(buf) as unknown as BodyInit);
}

const mockFetch = mock((_url: string | URL | Request, _init?: RequestInit) =>
  Promise.resolve(pbResponse(gtfsTripUpdatesFeedBuffer)),
);

describe('GtfsTripUpdatesApi', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
      Promise.resolve(pbResponse(gtfsTripUpdatesFeedBuffer)),
    );
    // @ts-expect-error — replacing global fetch with mock
    globalThis.fetch = mockFetch;
  });

  describe('constructor', () => {
    it('should require an API key', () => {
      const api = new GtfsTripUpdatesApi({ apiKey: 'test-key' });
      expect(api).toBeInstanceOf(GtfsTripUpdatesApi);
    });

    it('should allow overriding the base URL', () => {
      const api = new GtfsTripUpdatesApi({
        apiKey: 'test-key',
        baseUrl: 'https://custom.test',
      });
      expect(api).toBeInstanceOf(GtfsTripUpdatesApi);
    });
  });

  describe('getTripUpdates', () => {
    it('should call the correct URL for an operator', async () => {
      const api = new GtfsTripUpdatesApi({ apiKey: 'test-key' });
      await api.getTripUpdates('ul');

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('/ul/TripUpdatesSweden.pb');
      expect(url).toContain('key=test-key');
    });

    it('should parse trip updates from protobuf feed', async () => {
      const api = new GtfsTripUpdatesApi({ apiKey: 'test-key' });
      const result = await api.getTripUpdates('ul');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(gtfsTripUpdatesResponse[0].id);
      expect(result[0].trip.tripId).toBe(gtfsTripUpdatesResponse[0].trip.tripId);
      expect(result[0].trip.routeId).toBe(gtfsTripUpdatesResponse[0].trip.routeId);
    });

    it('should map trip schedule relationship enums', async () => {
      const api = new GtfsTripUpdatesApi({ apiKey: 'test-key' });
      const result = await api.getTripUpdates('ul');

      expect(result[0].trip.scheduleRelationship).toBe('SCHEDULED');
      expect(result[1].trip.scheduleRelationship).toBe('CANCELED');
    });

    it('should parse trip descriptor fields', async () => {
      const api = new GtfsTripUpdatesApi({ apiKey: 'test-key' });
      const result = await api.getTripUpdates('ul');

      expect(result[0].trip.directionId).toBe(0);
      expect(result[0].trip.startTime).toBe('14:45:00');
      expect(result[0].trip.startDate).toBe('20260301');
    });

    it('should parse vehicle descriptor', async () => {
      const api = new GtfsTripUpdatesApi({ apiKey: 'test-key' });
      const result = await api.getTripUpdates('ul');

      expect(result[0].vehicle).toBeDefined();
      expect(result[0].vehicle!.id).toBe('9031008000500546');
      expect(result[0].vehicle!.label).toBe('Pendeltåg 43');
      expect(result[1].vehicle).toBeUndefined();
    });

    it('should parse stop time updates with arrival and departure', async () => {
      const api = new GtfsTripUpdatesApi({ apiKey: 'test-key' });
      const result = await api.getTripUpdates('ul');

      expect(result[0].stopTimeUpdates).toHaveLength(2);
      expect(result[0].stopTimeUpdates[0].stopSequence).toBe(32);
      expect(result[0].stopTimeUpdates[0].stopId).toBe('9022050013110001');
      expect(result[0].stopTimeUpdates[0].arrival?.delay).toBe(412);
      expect(result[0].stopTimeUpdates[0].arrival?.time).toBe(1772374012);
      expect(result[0].stopTimeUpdates[0].arrival?.uncertainty).toBe(60);
      expect(result[0].stopTimeUpdates[0].departure?.delay).toBe(412);
    });

    it('should map stop schedule relationship enums', async () => {
      const api = new GtfsTripUpdatesApi({ apiKey: 'test-key' });
      const result = await api.getTripUpdates('ul');

      expect(result[0].stopTimeUpdates[0].scheduleRelationship).toBe('SCHEDULED');
    });

    it('should handle skipped stops', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(pbResponse(gtfsTripUpdatesSkippedStopFeedBuffer)),
      );

      const api = new GtfsTripUpdatesApi({ apiKey: 'test-key' });
      const result = await api.getTripUpdates('ul');

      expect(result[0].stopTimeUpdates[0].scheduleRelationship).toBe('SKIPPED');
      expect(result[0].stopTimeUpdates[0].arrival).toBeUndefined();
      expect(result[0].stopTimeUpdates[1].scheduleRelationship).toBe('SCHEDULED');
    });

    it('should parse trip-level delay and timestamp', async () => {
      const api = new GtfsTripUpdatesApi({ apiKey: 'test-key' });
      const result = await api.getTripUpdates('ul');

      expect(result[0].delay).toBe(412);
      expect(result[0].timestamp).toBe(1772374495);
    });

    it('should return empty array when no trip updates', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(pbResponse(gtfsTripUpdatesEmptyFeedBuffer)),
      );

      const api = new GtfsTripUpdatesApi({ apiKey: 'test-key' });
      const result = await api.getTripUpdates('ul');

      expect(result).toEqual(gtfsTripUpdatesEmptyResponse);
    });
  });

  describe('error handling', () => {
    it('should throw ApiResponseError on non-OK response', async () => {
      mockFetch.mockImplementation((_url: string | URL | Request, _init?: RequestInit) =>
        Promise.resolve(new Response('Unauthorized', { status: 401 })),
      );

      const api = new GtfsTripUpdatesApi({ apiKey: 'bad-key' });
      await expect(api.getTripUpdates('ul')).rejects.toThrow(ApiResponseError);
    });
  });

  describe('usage tracking', () => {
    it('should track requests per operator', async () => {
      const api = new GtfsTripUpdatesApi({ apiKey: 'test-key' });
      await api.getTripUpdates('ul');
      await api.getTripUpdates('skane');
      await api.getTripUpdates('ul');

      const usage = api.getUsage();
      expect(usage.totalRequests).toBe(3);
      expect(usage.byEndpoint['/ul/TripUpdatesSweden.pb']).toBe(2);
      expect(usage.byEndpoint['/skane/TripUpdatesSweden.pb']).toBe(1);
    });
  });
});
