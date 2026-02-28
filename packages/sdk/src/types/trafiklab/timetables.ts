import type { Alert, Coordinates, TransportMode } from '../common';

/**
 * A stop in the timetables response.
 */
export interface TrafiklabTimetableStop extends Coordinates {
  id: string;
  name: string;
  transport_modes: Array<TransportMode>;
  alerts: Array<Alert>;
}

/**
 * Origin or destination reference for a route.
 */
export interface TrafiklabRouteEndpoint {
  id: string;
  name: string;
}

/**
 * Route information for a departure or arrival.
 */
export interface TrafiklabRoute {
  name: string;
  designation: string;
  transport_mode: TransportMode;
  transport_mode_code: number;
  direction: string;
  origin: TrafiklabRouteEndpoint;
  destination: TrafiklabRouteEndpoint;
}

/**
 * Trip identifier for a departure or arrival.
 */
export interface TrafiklabTripInfo {
  trip_id: string;
  start_date: string;
  technical_number: number;
}

/**
 * Platform information.
 */
export interface TrafiklabPlatform {
  id: string;
  designation: string;
}

/**
 * A single departure or arrival entry.
 */
export interface TrafiklabCallAtLocation {
  scheduled: string;
  realtime: string;
  delay: number;
  canceled: boolean;
  route: TrafiklabRoute;
  trip: TrafiklabTripInfo;
  stop: TrafiklabTimetableStop;
  scheduled_platform: TrafiklabPlatform | null;
  realtime_platform: TrafiklabPlatform | null;
  alerts: Array<Alert>;
  is_realtime: boolean;
}

/**
 * Query metadata in a timetables response.
 */
export interface TrafiklabTimetablesQuery {
  queryTime: string;
  query: string;
}

/**
 * Response from the Timetables departures endpoint.
 */
export interface TrafiklabDeparturesResponse {
  timestamp: string;
  query: TrafiklabTimetablesQuery;
  stops: Array<TrafiklabTimetableStop>;
  departures: Array<TrafiklabCallAtLocation>;
}

/**
 * Response from the Timetables arrivals endpoint.
 */
export interface TrafiklabArrivalsResponse {
  timestamp: string;
  query: TrafiklabTimetablesQuery;
  stops: Array<TrafiklabTimetableStop>;
  arrivals: Array<TrafiklabCallAtLocation>;
}
