/**
 * Transport modes available across Trafiklab APIs.
 */
export type TransportMode = 'BUS' | 'TRAIN' | 'TRAM' | 'METRO' | 'TAXI' | 'BOAT';

/**
 * Geographic coordinates in WGS84 format.
 */
export interface Coordinates {
  lat: number;
  lon: number;
}

/**
 * Operator identifier. Defaults to SL (Stockholm).
 */
export type Operator = 'SL' | (string & {});

/**
 * Alert/service message attached to departures or stops.
 */
export interface Alert {
  id: string;
  header: string;
  details: string;
  severity?: string;
}

/**
 * API usage statistics.
 */
export interface UsageStats {
  totalRequests: number;
  byEndpoint: Record<string, number>;
}
