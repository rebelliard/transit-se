import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import type { GtfsVehiclePosition } from '../../types/gtfs/vehicle-positions';

const { FeedMessage } = GtfsRealtimeBindings.transit_realtime;

// ─── Raw protobuf feeds for mocking fetch ───────────────────────────

const twoVehiclesFeed = FeedMessage.create({
  header: {
    gtfsRealtimeVersion: '2.0',
    incrementality: 0,
    timestamp: 1709100000,
  },
  entity: [
    {
      id: 'vp-1',
      vehicle: {
        trip: {
          tripId: 'trip-abc-123',
          routeId: '801',
          directionId: 0,
          startTime: '08:30:00',
          startDate: '20240228',
          scheduleRelationship: 0,
        },
        vehicle: {
          id: 'vehicle-42',
          label: 'Bus 801',
          licensePlate: 'ABC123',
        },
        position: {
          latitude: 59.8586,
          longitude: 17.6389,
          bearing: 180,
          speed: 12.5,
        },
        currentStopSequence: 5,
        stopId: '740000001',
        currentStatus: 2,
        timestamp: 1709100900,
        congestionLevel: 1,
        occupancyStatus: 2,
        occupancyPercentage: 45,
      },
    },
    {
      id: 'vp-2',
      vehicle: {
        trip: {
          tripId: 'trip-def-456',
          routeId: '3',
          directionId: 1,
          scheduleRelationship: 0,
        },
        vehicle: {
          id: 'vehicle-99',
        },
        position: {
          latitude: 59.3313,
          longitude: 18.0597,
        },
        currentStatus: 1,
        timestamp: 1709100800,
      },
    },
  ],
});

const emptyFeed = FeedMessage.create({
  header: { gtfsRealtimeVersion: '2.0', incrementality: 0, timestamp: 1709100000 },
  entity: [],
});

/** Encoded protobuf: two vehicles on different routes. */
export const gtfsVehiclePositionsFeedBuffer = FeedMessage.encode(twoVehiclesFeed).finish();

/** Encoded protobuf: no vehicle positions. */
export const gtfsVehiclePositionsEmptyFeedBuffer = FeedMessage.encode(emptyFeed).finish();

// ─── Expected clean output ──────────────────────────────────────────

/** Expected output for the two-vehicle feed. */
export const gtfsVehiclePositionsResponse: Array<GtfsVehiclePosition> = [
  {
    id: 'vp-1',
    trip: {
      tripId: 'trip-abc-123',
      routeId: '801',
      directionId: 0,
      startTime: '08:30:00',
      startDate: '20240228',
      scheduleRelationship: 'SCHEDULED',
    },
    vehicle: {
      id: 'vehicle-42',
      label: 'Bus 801',
      licensePlate: 'ABC123',
    },
    position: {
      latitude: 59.8586,
      longitude: 17.6389,
      bearing: 180,
      speed: 12.5,
    },
    currentStopSequence: 5,
    stopId: '740000001',
    currentStatus: 'IN_TRANSIT_TO',
    timestamp: 1709100900,
    congestionLevel: 'RUNNING_SMOOTHLY',
    occupancyStatus: 'FEW_SEATS_AVAILABLE',
    occupancyPercentage: 45,
  },
  {
    id: 'vp-2',
    trip: {
      tripId: 'trip-def-456',
      routeId: '3',
      directionId: 1,
      scheduleRelationship: 'SCHEDULED',
    },
    vehicle: {
      id: 'vehicle-99',
    },
    position: {
      latitude: 59.3313,
      longitude: 18.0597,
    },
    currentStatus: 'STOPPED_AT',
    timestamp: 1709100800,
  },
];

/** Expected output for the empty feed. */
export const gtfsVehiclePositionsEmptyResponse: Array<GtfsVehiclePosition> = [];
