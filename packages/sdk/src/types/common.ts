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
 * API usage statistics.
 */
export interface UsageStats {
  totalRequests: number;
  byEndpoint: Record<string, number>;
}
