import type { Coordinates, TransportMode } from '../common';

/**
 * A child stop within a stop group.
 */
interface TrafiklabStop extends Coordinates {
  id: string;
  name: string;
}

/**
 * Area type for stop groups.
 */
type TrafiklabAreaType = 'META_STOP' | 'RIKSHALLPLATS';

/**
 * A group of related stops (rikshållplats or meta-stop).
 */
interface TrafiklabStopGroup {
  id: string;
  name: string;
  area_type: TrafiklabAreaType;
  average_daily_stop_times: number;
  transport_modes: Array<TransportMode>;
  stops: Array<TrafiklabStop>;
}

/**
 * Query metadata in a stop lookup response.
 */
interface TrafiklabStopLookupQuery {
  queryTime: string;
  query: string | null;
}

/**
 * Response from the Stop Lookup API.
 */
export interface TrafiklabStopLookupResponse {
  timestamp: string;
  query: TrafiklabStopLookupQuery;
  stop_groups: Array<TrafiklabStopGroup>;
}
