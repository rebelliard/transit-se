/**
 * Types for GTFS-Realtime TripUpdates.
 *
 * These are clean TypeScript types representing decoded protobuf data
 * from the GTFS Sweden 3 TripUpdates feed. They abstract away the
 * raw protobuf structure into idiomatic TypeScript.
 *
 * @see https://gtfs.org/realtime/reference/#message-tripupdate
 * @see https://trafiklab.se/api/gtfs-datasets/gtfs-sweden/
 */

/**
 * GTFS-RT TripDescriptor schedule relationship values.
 * Describes the relationship between a trip and the static schedule.
 * @see https://gtfs.org/realtime/reference/#enum-schedulerelationship-1
 */
export type GtfsTripScheduleRelationship =
  | 'SCHEDULED'
  | 'ADDED'
  | 'UNSCHEDULED'
  | 'CANCELED'
  | 'REPLACEMENT'
  | 'DUPLICATED';

/**
 * GTFS-RT StopTimeUpdate schedule relationship values.
 * Describes the relationship between a stop time and the static schedule.
 * @see https://gtfs.org/realtime/reference/#enum-schedulerelationship
 */
export type GtfsStopScheduleRelationship = 'SCHEDULED' | 'SKIPPED' | 'NO_DATA' | 'UNSCHEDULED';

/**
 * A predicted arrival or departure event at a stop.
 * Contains the predicted time, delay, and uncertainty.
 */
export interface GtfsStopTimeEvent {
  /** Predicted delay in seconds (positive = late, negative = early). */
  delay?: number;
  /** Predicted absolute time as UNIX timestamp (seconds since epoch). */
  time?: number;
  /** Uncertainty of the prediction in seconds. 0 = exact. */
  uncertainty?: number;
}

/**
 * A real-time update for a single stop along a trip.
 * Contains predicted arrival/departure times and schedule relationship.
 */
export interface GtfsStopTimeUpdate {
  /** Stop sequence position in the trip (from GTFS static). */
  stopSequence?: number;
  /** GTFS stop_id for this stop. */
  stopId?: string;
  /** Predicted arrival time at this stop. */
  arrival?: GtfsStopTimeEvent;
  /** Predicted departure time from this stop. */
  departure?: GtfsStopTimeEvent;
  /** Relationship to the static schedule for this stop. */
  scheduleRelationship: GtfsStopScheduleRelationship;
}

/** Identifies the trip this update applies to. */
export interface GtfsTripDescriptor {
  tripId?: string;
  routeId?: string;
  directionId?: number;
  startTime?: string;
  startDate?: string;
  scheduleRelationship: GtfsTripScheduleRelationship;
}

/** Identifies the vehicle serving the trip. */
export interface GtfsVehicleDescriptor {
  id?: string;
  label?: string;
  licensePlate?: string;
}

/**
 * A trip update from a GTFS-Realtime TripUpdates feed.
 *
 * Contains the trip identity, vehicle info, current delay, and
 * per-stop arrival/departure predictions.
 */
export interface GtfsTripUpdate {
  /** Unique identifier for this entity in the feed. */
  id: string;
  /** Identifies the trip this update applies to. */
  trip: GtfsTripDescriptor;
  /** The vehicle serving this trip, if known. */
  vehicle?: GtfsVehicleDescriptor;
  /** Per-stop arrival/departure predictions, sorted by stop_sequence. */
  stopTimeUpdates: Array<GtfsStopTimeUpdate>;
  /** Moment when the vehicle's real-time progress was measured (UNIX timestamp). */
  timestamp?: number;
  /** Current schedule deviation for the trip in seconds. */
  delay?: number;
}
