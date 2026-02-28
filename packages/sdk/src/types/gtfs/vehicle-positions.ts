/**
 * Types for GTFS-Realtime VehiclePositions.
 *
 * These are clean TypeScript types representing decoded protobuf data
 * from the GTFS Sweden 3 VehiclePositions feed. They abstract away the
 * raw protobuf structure into idiomatic TypeScript.
 *
 * @see https://gtfs.org/realtime/reference/#message-vehicleposition
 * @see https://trafiklab.se/api/gtfs-datasets/gtfs-sweden/
 */

import type { GtfsTripScheduleRelationship } from './trip-updates';

/**
 * Current status of a vehicle relative to a stop.
 * @see https://gtfs.org/realtime/reference/#enum-vehiclestopstatus
 */
export type GtfsVehicleStopStatus = 'INCOMING_AT' | 'STOPPED_AT' | 'IN_TRANSIT_TO';

/**
 * Congestion level affecting the vehicle.
 * @see https://gtfs.org/realtime/reference/#enum-congestionlevel
 */
export type GtfsCongestionLevel =
  | 'UNKNOWN_CONGESTION_LEVEL'
  | 'RUNNING_SMOOTHLY'
  | 'STOP_AND_GO'
  | 'CONGESTION'
  | 'SEVERE_CONGESTION';

/**
 * How full the vehicle is.
 * @see https://gtfs.org/realtime/reference/#enum-occupancystatus
 */
export type GtfsOccupancyStatus =
  | 'EMPTY'
  | 'MANY_SEATS_AVAILABLE'
  | 'FEW_SEATS_AVAILABLE'
  | 'STANDING_ROOM_ONLY'
  | 'CRUSHED_STANDING_ROOM_ONLY'
  | 'FULL'
  | 'NOT_ACCEPTING_PASSENGERS'
  | 'NO_DATA_AVAILABLE'
  | 'NOT_BOARDABLE';

/** Geographic position of the vehicle. */
export interface GtfsPosition {
  /** WGS-84 latitude in degrees. */
  latitude: number;
  /** WGS-84 longitude in degrees. */
  longitude: number;
  /** Bearing in degrees (0 = North, 90 = East). */
  bearing?: number;
  /** Odometer reading in meters. */
  odometer?: number;
  /** Speed in meters per second. */
  speed?: number;
}

/** Identifies the trip this vehicle is serving. */
export interface GtfsVehiclePositionTrip {
  tripId?: string;
  routeId?: string;
  directionId?: number;
  startTime?: string;
  startDate?: string;
  scheduleRelationship: GtfsTripScheduleRelationship;
}

/** Identifies the vehicle. */
export interface GtfsVehiclePositionVehicle {
  id?: string;
  label?: string;
  licensePlate?: string;
}

/**
 * A vehicle position from a GTFS-Realtime VehiclePositions feed.
 *
 * Contains the vehicle's geographic location, the trip it's serving,
 * and optional status information like congestion and occupancy.
 */
export interface GtfsVehiclePosition {
  /** Unique identifier for this entity in the feed. */
  id: string;
  /** The trip this vehicle is serving. */
  trip?: GtfsVehiclePositionTrip;
  /** Identifies the vehicle. */
  vehicle?: GtfsVehiclePositionVehicle;
  /** Geographic position of the vehicle. */
  position?: GtfsPosition;
  /** Index of the current stop in the GTFS stop_sequence. */
  currentStopSequence?: number;
  /** GTFS stop_id of the current/next stop. */
  stopId?: string;
  /** Relationship to the current stop. */
  currentStatus?: GtfsVehicleStopStatus;
  /** Moment this position was measured (UNIX timestamp). */
  timestamp?: number;
  /** Congestion level affecting the vehicle. */
  congestionLevel?: GtfsCongestionLevel;
  /** How full the vehicle is. */
  occupancyStatus?: GtfsOccupancyStatus;
  /** Occupancy as a percentage (0–100). */
  occupancyPercentage?: number;
}
