import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import type { GtfsVehiclePosition } from '../../types/gtfs/vehicle-positions';

const { FeedMessage } = GtfsRealtimeBindings.transit_realtime;

// ─── Raw protobuf feeds for mocking fetch ───────────────────────────

const twoVehiclesFeed = FeedMessage.create({
  header: {
    gtfsRealtimeVersion: '2.0',
    incrementality: 0,
    timestamp: 1772374000,
  },
  entity: [
    {
      id: '48061772374517773',
      vehicle: {
        trip: {
          tripId: '14010000664343260',
          routeId: '9011001004300000',
          directionId: 0,
          startTime: '14:45:00',
          startDate: '20260301',
          scheduleRelationship: 0,
        },
        vehicle: {
          id: '9031001001004806',
          label: 'Pendeltåg 43',
          licensePlate: 'SL4806',
        },
        position: {
          latitude: 59.33179,
          longitude: 18.02621,
          bearing: 90,
          speed: 10.6,
        },
        currentStopSequence: 12,
        stopId: '9022050013110001',
        currentStatus: 2,
        timestamp: 1772374517,
        congestionLevel: 1,
        occupancyStatus: 2,
        occupancyPercentage: 45,
      },
    },
    {
      id: '371362377',
      vehicle: {
        trip: {
          tripId: '14010100711492126',
          routeId: '9011005006100000',
          directionId: 1,
          scheduleRelationship: 0,
        },
        vehicle: {
          id: '9031005920505666',
        },
        position: {
          latitude: 58.41698,
          longitude: 15.62424,
        },
        currentStatus: 1,
        timestamp: 1772374517,
      },
    },
  ],
});

const emptyFeed = FeedMessage.create({
  header: { gtfsRealtimeVersion: '2.0', incrementality: 0, timestamp: 1772374000 },
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
    id: '48061772374517773',
    trip: {
      tripId: '14010000664343260',
      routeId: '9011001004300000',
      directionId: 0,
      startTime: '14:45:00',
      startDate: '20260301',
      scheduleRelationship: 'SCHEDULED',
    },
    vehicle: {
      id: '9031001001004806',
      label: 'Pendeltåg 43',
      licensePlate: 'SL4806',
    },
    position: {
      latitude: 59.33179,
      longitude: 18.02621,
      bearing: 90,
      speed: 10.6,
    },
    currentStopSequence: 12,
    stopId: '9022050013110001',
    currentStatus: 'IN_TRANSIT_TO',
    timestamp: 1772374517,
    congestionLevel: 'RUNNING_SMOOTHLY',
    occupancyStatus: 'FEW_SEATS_AVAILABLE',
    occupancyPercentage: 45,
  },
  {
    id: '371362377',
    trip: {
      tripId: '14010100711492126',
      routeId: '9011005006100000',
      directionId: 1,
      scheduleRelationship: 'SCHEDULED',
    },
    vehicle: {
      id: '9031005920505666',
    },
    position: {
      latitude: 58.41698,
      longitude: 15.62424,
    },
    currentStatus: 'STOPPED_AT',
    timestamp: 1772374517,
  },
];

/** Expected output for the empty feed. */
export const gtfsVehiclePositionsEmptyResponse: Array<GtfsVehiclePosition> = [];
