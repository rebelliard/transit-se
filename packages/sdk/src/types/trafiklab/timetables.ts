import type { Coordinates, TransportMode } from '../common';

/**
 * An alert/disruption message from the Trafiklab Timetables API.
 */
interface TrafiklabAlert {
  type: string;
  title: string;
  text: string;
}

/**
 * A stop in the top-level `stops` array of a timetables response.
 * Includes transport modes and alerts.
 */
interface TrafiklabTimetableStop extends Coordinates {
  id: string;
  name: string;
  transport_modes: Array<TransportMode>;
  alerts: Array<TrafiklabAlert>;
}

/**
 * A stop reference inside a departure or arrival entry.
 * Simpler than `TrafiklabTimetableStop` — no modes or alerts.
 */
interface TrafiklabCallStop extends Coordinates {
  id: string;
  name: string;
}

/**
 * Origin or destination reference for a route.
 */
interface TrafiklabRouteEndpoint {
  id: string;
  name: string;
}

/**
 * Route information for a departure or arrival.
 */
interface TrafiklabRoute {
  name: string | null;
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
interface TrafiklabTripInfo {
  trip_id: string;
  start_date: string;
  technical_number: number;
}

/**
 * Platform information.
 */
interface TrafiklabPlatform {
  id: string;
  designation: string;
}

/**
 * Agency/operator information for a departure or arrival.
 */
interface TrafiklabAgency {
  id: string;
  name: string;
  operator: string;
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
  agency?: TrafiklabAgency;
  stop: TrafiklabCallStop;
  scheduled_platform: TrafiklabPlatform | null;
  realtime_platform: TrafiklabPlatform | null;
  alerts: Array<TrafiklabAlert>;
  is_realtime: boolean;
}

/**
 * Query metadata in a timetables response.
 */
interface TrafiklabTimetablesQuery {
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
