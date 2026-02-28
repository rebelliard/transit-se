import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import type { GtfsTripUpdate } from '../../types/gtfs/trip-updates';

const { FeedMessage } = GtfsRealtimeBindings.transit_realtime;

// ─── Raw protobuf feeds for mocking fetch ───────────────────────────

const delayedTripFeed = FeedMessage.create({
  header: {
    gtfsRealtimeVersion: '2.0',
    incrementality: 0,
    timestamp: 1709100000,
  },
  entity: [
    {
      id: 'trip-update-1',
      tripUpdate: {
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
        },
        stopTimeUpdate: [
          {
            stopSequence: 1,
            stopId: '740000001',
            arrival: { delay: 120, time: 1709101200, uncertainty: 30 },
            departure: { delay: 150, time: 1709101350, uncertainty: 30 },
            scheduleRelationship: 0,
          },
          {
            stopSequence: 2,
            stopId: '740000002',
            arrival: { delay: 180, time: 1709102400, uncertainty: 60 },
            departure: { delay: 180, time: 1709102580, uncertainty: 60 },
            scheduleRelationship: 0,
          },
        ],
        timestamp: 1709100900,
        delay: 120,
      },
    },
    {
      id: 'trip-update-2',
      tripUpdate: {
        trip: {
          tripId: 'trip-def-456',
          routeId: '3',
          directionId: 1,
          startTime: '09:00:00',
          startDate: '20240228',
          scheduleRelationship: 3,
        },
        stopTimeUpdate: [],
        timestamp: 1709100900,
      },
    },
  ],
});

const skippedStopFeed = FeedMessage.create({
  header: {
    gtfsRealtimeVersion: '2.0',
    incrementality: 0,
    timestamp: 1709100000,
  },
  entity: [
    {
      id: 'trip-update-skip',
      tripUpdate: {
        trip: {
          tripId: 'trip-skip-1',
          routeId: '19',
          scheduleRelationship: 0,
        },
        stopTimeUpdate: [
          {
            stopSequence: 3,
            stopId: '740000010',
            scheduleRelationship: 1,
          },
          {
            stopSequence: 4,
            stopId: '740000011',
            arrival: { delay: 0, time: 1709103000 },
            departure: { delay: 0, time: 1709103060 },
            scheduleRelationship: 0,
          },
        ],
        timestamp: 1709100600,
      },
    },
  ],
});

const emptyFeed = FeedMessage.create({
  header: { gtfsRealtimeVersion: '2.0', incrementality: 0, timestamp: 1709100000 },
  entity: [],
});

/** Encoded protobuf: one delayed trip + one canceled trip. */
export const gtfsTripUpdatesFeedBuffer = FeedMessage.encode(delayedTripFeed).finish();

/** Encoded protobuf: one trip with a skipped stop. */
export const gtfsTripUpdatesSkippedStopFeedBuffer = FeedMessage.encode(skippedStopFeed).finish();

/** Encoded protobuf: no trip updates. */
export const gtfsTripUpdatesEmptyFeedBuffer = FeedMessage.encode(emptyFeed).finish();

// ─── Expected clean output ──────────────────────────────────────────

/** Expected output for the delayed + canceled feed. */
export const gtfsTripUpdatesResponse: Array<GtfsTripUpdate> = [
  {
    id: 'trip-update-1',
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
    },
    stopTimeUpdates: [
      {
        stopSequence: 1,
        stopId: '740000001',
        arrival: { delay: 120, time: 1709101200, uncertainty: 30 },
        departure: { delay: 150, time: 1709101350, uncertainty: 30 },
        scheduleRelationship: 'SCHEDULED',
      },
      {
        stopSequence: 2,
        stopId: '740000002',
        arrival: { delay: 180, time: 1709102400, uncertainty: 60 },
        departure: { delay: 180, time: 1709102580, uncertainty: 60 },
        scheduleRelationship: 'SCHEDULED',
      },
    ],
    timestamp: 1709100900,
    delay: 120,
  },
  {
    id: 'trip-update-2',
    trip: {
      tripId: 'trip-def-456',
      routeId: '3',
      directionId: 1,
      startTime: '09:00:00',
      startDate: '20240228',
      scheduleRelationship: 'CANCELED',
    },
    stopTimeUpdates: [],
    timestamp: 1709100900,
  },
];

/** Expected output for the empty feed. */
export const gtfsTripUpdatesEmptyResponse: Array<GtfsTripUpdate> = [];
