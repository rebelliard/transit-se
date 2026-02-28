/**
 * Types for the Combined SL Nearby Vehicles API.
 *
 * Combines GTFS-RT vehicle positions with SL stop point data
 * to produce enriched, location-filtered vehicle results that
 * include transport mode classification.
 */

import type {
  GtfsCongestionLevel,
  GtfsOccupancyStatus,
  GtfsVehicleStopStatus,
} from '../gtfs/vehicle-positions';

/**
 * Transport modes detected by matching vehicles to nearby stop points.
 */
export type CombinedSLTransportMode =
  | 'metro'
  | 'tram'
  | 'train'
  | 'bus'
  | 'ship'
  | 'ferry'
  | 'unknown';

/** Geographic position of a vehicle with optional kinematics. */
export interface CombinedSLVehiclePosition {
  latitude: number;
  longitude: number;
  /** Bearing in degrees (0 = North, 90 = East). */
  bearing?: number;
  /** Speed in meters per second. */
  speed?: number;
}

/** Trip descriptor associated with a vehicle. */
export interface CombinedSLVehicleTrip {
  tripId?: string;
  routeId?: string;
  directionId?: number;
  startTime?: string;
  startDate?: string;
}

/** The nearest SL stop point matched to a vehicle. */
export interface CombinedSLNearestStopPoint {
  name: string;
  designation?: string;
  /** Raw SL stop area type (e.g. `"METROSTN"`, `"BUSTERM"`). */
  type: string;
  /** Distance from the vehicle to this stop point in meters. */
  distanceMeters: number;
}

/**
 * A vehicle with its position, distance from the search location,
 * and inferred transport mode.
 */
export interface CombinedSLNearbyVehicle {
  /** Feed entity ID. */
  id: string;
  /** GTFS vehicle ID. */
  vehicleId?: string;
  /** Human-readable vehicle label. */
  vehicleLabel?: string;
  /** Inferred transport mode based on nearest SL stop point. */
  transportMode: CombinedSLTransportMode;
  /** GPS position. */
  position: CombinedSLVehiclePosition;
  /** Distance from the search location in meters. */
  distanceMeters: number;
  /** Status relative to the current/next stop. */
  currentStatus?: GtfsVehicleStopStatus;
  /** UNIX timestamp when this position was measured. */
  timestamp?: number;
  /** Trip this vehicle is serving. */
  trip?: CombinedSLVehicleTrip;
  /** The stop point used to classify this vehicle. */
  nearestStopPoint?: CombinedSLNearestStopPoint;
  congestionLevel?: GtfsCongestionLevel;
  occupancyStatus?: GtfsOccupancyStatus;
  occupancyPercentage?: number;
}

/** Resolved search location. */
export interface CombinedSLNearbyVehiclesLocation {
  /** Site name (e.g. `"Solna centrum"`). */
  name: string;
  /** SL site ID. */
  siteId: number;
  latitude: number;
  longitude: number;
}

/**
 * Result from {@link CombinedSLNearbyVehiclesApi.getNearbyVehicles}.
 */
export interface CombinedSLNearbyVehiclesResult {
  /** The resolved search center. */
  location: CombinedSLNearbyVehiclesLocation;
  /** Search radius used. */
  radiusKm: number;
  /** Vehicles found, sorted by distance (closest first). */
  vehicles: Array<CombinedSLNearbyVehicle>;
  /** Distinct transport modes detected among the returned vehicles. */
  activeModes: Array<CombinedSLTransportMode>;
  /** UNIX timestamp when this result was generated. */
  timestamp: number;
}

/**
 * Parameters for {@link CombinedSLNearbyVehiclesApi.getNearbyVehicles}.
 *
 * Provide exactly one location input. If multiple are given, precedence is:
 * `siteId` > `siteName` > `latitude` + `longitude`.
 */
export interface CombinedSLNearbyVehiclesParams {
  /** Latitude (e.g. `59.3587`). Must be paired with `longitude`. Nearest SL site is auto-detected. */
  latitude?: number;
  /** Longitude (e.g. `17.9976`). Must be paired with `latitude`. */
  longitude?: number;
  /** SL site name (e.g. `"Solna centrum"`). Resolved via cached site data. */
  siteName?: string;
  /** SL site ID (e.g. `9305`). Highest precedence among location params. */
  siteId?: number;
  /** Search radius in kilometers (0–20). Clamped to this range. @default 1.0 */
  radiusKm?: number;
}
