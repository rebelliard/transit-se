import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import type { GtfsTripUpdate } from '../../types/gtfs/trip-updates';

const { FeedMessage } = GtfsRealtimeBindings.transit_realtime;

// ─── Raw protobuf feeds for mocking fetch ───────────────────────────

const delayedTripFeed = FeedMessage.create({
  header: {
    gtfsRealtimeVersion: '2.0',
    incrementality: 0,
    timestamp: 1772374000,
  },
  entity: [
    {
      id: '14010517687256993',
      tripUpdate: {
        trip: {
          tripId: '14010000713020248',
          routeId: '9011001004300000',
          directionId: 0,
          startTime: '14:45:00',
          startDate: '20260301',
          scheduleRelationship: 0,
        },
        vehicle: {
          id: '9031008000500546',
          label: 'Pendeltåg 43',
        },
        stopTimeUpdate: [
          {
            stopSequence: 32,
            stopId: '9022050013110001',
            arrival: { delay: 412, time: 1772374012, uncertainty: 60 },
            departure: { delay: 412, time: 1772374012, uncertainty: 60 },
            scheduleRelationship: 0,
          },
          {
            stopSequence: 33,
            stopId: '9022050013100001',
            arrival: { delay: 541, time: 1772374441 },
            departure: { delay: 592, time: 1772374492 },
            scheduleRelationship: 0,
          },
        ],
        timestamp: 1772374495,
        delay: 412,
      },
    },
    {
      id: '14050001911285220',
      tripUpdate: {
        trip: {
          tripId: '14010000702187461',
          routeId: '9011001001800000',
          directionId: 1,
          startTime: '15:11:12',
          startDate: '20260301',
          scheduleRelationship: 3,
        },
        stopTimeUpdate: [],
        timestamp: 1772374412,
      },
    },
  ],
});

const skippedStopFeed = FeedMessage.create({
  header: {
    gtfsRealtimeVersion: '2.0',
    incrementality: 0,
    timestamp: 1772374000,
  },
  entity: [
    {
      id: '14010517652571469',
      tripUpdate: {
        trip: {
          tripId: '14010100711492126',
          routeId: '9011001015100000',
          scheduleRelationship: 0,
        },
        stopTimeUpdate: [
          {
            stopSequence: 79,
            stopId: '9022050010409001',
            scheduleRelationship: 1,
          },
          {
            stopSequence: 80,
            stopId: '9022050011518001',
            arrival: { delay: 0, time: 1772374653 },
            departure: { delay: 0, time: 1772374660 },
            scheduleRelationship: 0,
          },
        ],
        timestamp: 1772374418,
      },
    },
  ],
});

const emptyFeed = FeedMessage.create({
  header: { gtfsRealtimeVersion: '2.0', incrementality: 0, timestamp: 1772374000 },
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
    id: '14010517687256993',
    trip: {
      tripId: '14010000713020248',
      routeId: '9011001004300000',
      directionId: 0,
      startTime: '14:45:00',
      startDate: '20260301',
      scheduleRelationship: 'SCHEDULED',
    },
    vehicle: {
      id: '9031008000500546',
      label: 'Pendeltåg 43',
    },
    stopTimeUpdates: [
      {
        stopSequence: 32,
        stopId: '9022050013110001',
        arrival: { delay: 412, time: 1772374012, uncertainty: 60 },
        departure: { delay: 412, time: 1772374012, uncertainty: 60 },
        scheduleRelationship: 'SCHEDULED',
      },
      {
        stopSequence: 33,
        stopId: '9022050013100001',
        arrival: { delay: 541, time: 1772374441 },
        departure: { delay: 592, time: 1772374492 },
        scheduleRelationship: 'SCHEDULED',
      },
    ],
    timestamp: 1772374495,
    delay: 412,
  },
  {
    id: '14050001911285220',
    trip: {
      tripId: '14010000702187461',
      routeId: '9011001001800000',
      directionId: 1,
      startTime: '15:11:12',
      startDate: '20260301',
      scheduleRelationship: 'CANCELED',
    },
    stopTimeUpdates: [],
    timestamp: 1772374412,
  },
];

/** Expected output for the empty feed. */
export const gtfsTripUpdatesEmptyResponse: Array<GtfsTripUpdate> = [];
