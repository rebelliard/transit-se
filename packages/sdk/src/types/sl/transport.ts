/**
 * SL Transport API transport mode strings.
 *
 * The /lines and /departures endpoints return UPPERCASE values.
 */
type SLTransportMode = 'METRO' | 'TRAM' | 'TRAIN' | 'BUS' | 'SHIP' | 'FERRY' | 'TAXI';

/**
 * Known values for `group_of_lines` on SL lines and departures.
 * Absent for regular buses, some ships, and taxi.
 */
type SLGroupOfLines =
  | 'Tunnelbanans blå linje'
  | 'Tunnelbanans gröna linje'
  | 'Tunnelbanans röda linje'
  | 'Pendeltåg'
  | 'Spårväg City'
  | 'Tvärbanan'
  | 'Lidingöbanan'
  | 'Nockebybanan'
  | 'Roslagsbanan'
  | 'Saltsjöbanan'
  | 'Blåbuss'
  | 'Närtrafiken'
  | 'Ersättningsbuss'
  | 'Pendelbåt';

/**
 * Validity period for SL resources.
 */
interface ValidityPeriod {
  from: string;
  to?: string;
}

/**
 * Transport authority reference embedded in SL resources.
 */
interface SLTransportAuthorityRef {
  id: number;
  name: string;
}

/**
 * Contractor reference embedded in SL line data.
 */
interface SLContractor {
  id: number;
  name: string;
}

/**
 * Full SL transport authority from /transport-authorities.
 */
export interface SLTransportAuthority {
  id: number;
  gid: number;
  name: string;
  formal_name?: string;
  code: string;
  street?: string;
  postal_code?: number;
  city?: string;
  country?: string;
  valid: ValidityPeriod;
}

/**
 * An SL transit line.
 */
interface SLLine {
  id: number;
  gid: number;
  name: string;
  designation: string;
  transport_mode: SLTransportMode;
  group_of_lines?: SLGroupOfLines;
  transport_authority: SLTransportAuthorityRef;
  contractor?: SLContractor;
  valid: ValidityPeriod;
}

/**
 * Lines grouped by transport mode (from /lines).
 */
export interface SLLinesResponse {
  metro: Array<SLLine>;
  tram: Array<SLLine>;
  train: Array<SLLine>;
  bus: Array<SLLine>;
  ship: Array<SLLine>;
  ferry: Array<SLLine>;
  taxi: Array<SLLine>;
}

/**
 * Minimal site record for static lookups.
 * Contains only the fields needed for name/ID resolution and display.
 */
export interface SLSiteEntry {
  /** Numeric site ID (e.g. 9192 for Slussen). */
  id: number;
  /** Human-readable site name (e.g. "Slussen"). */
  name: string;
  /** Latitude in WGS84. */
  lat: number;
  /** Longitude in WGS84. */
  lon: number;
}

/**
 * An SL site (station/stop area).
 */
export interface SLSite {
  id: number;
  gid: number;
  name: string;
  alias?: Array<string>;
  note?: string;
  abbreviation?: string;
  lat: number;
  lon: number;
  stop_areas?: Array<number>;
  valid: ValidityPeriod;
}

/**
 * Stop area details within a departure.
 */
interface SLStopArea {
  id: number;
  name: string;
  sname?: string;
  type: string;
}

/**
 * Stop point details within a departure.
 */
interface SLStopPoint {
  id: number;
  name: string;
  designation?: string;
}

/**
 * Full stop point from /stop-points.
 */
export interface SLStopPointFull {
  id: number;
  gid: number;
  pattern_point_gid: number;
  name: string;
  sname: string;
  designation?: string;
  local_num: number;
  type: string;
  has_entrance: boolean;
  lat: number;
  lon: number;
  door_orientation: number;
  transport_authority: SLTransportAuthorityRef;
  stop_area: SLStopArea;
  valid: ValidityPeriod;
}

/**
 * Departure-level deviation/disruption.
 */
interface SLDeviation {
  importance_level: number;
  consequence: string;
  message: string;
}

/**
 * Journey metadata for an SL departure.
 */
interface SLJourney {
  id: number;
  state: string;
  prediction_state?: string;
}

/**
 * Line info embedded in an SL departure.
 */
interface SLDepartureLine {
  id: number;
  designation: string;
  transport_authority_id?: number;
  transport_mode: SLTransportMode;
  group_of_lines?: SLGroupOfLines;
}

/**
 * An SL departure entry.
 */
interface SLDeparture {
  direction: string;
  direction_code: number;
  via?: string;
  destination: string;
  state: string;
  scheduled: string;
  expected: string;
  display: string;
  journey: SLJourney;
  stop_area: SLStopArea;
  stop_point: SLStopPoint;
  line: SLDepartureLine;
  deviations: Array<SLDeviation>;
}

/**
 * Stop-level deviation in the departures response.
 */
interface SLStopDeviation {
  id: number;
  importance_level: number;
  message: string;
  scope?: {
    stop_areas?: Array<{ id: number; name: string; type: string }>;
    stop_points?: Array<{ id: number; name: string; designation?: string }>;
    lines?: Array<{
      id: number;
      designation: string;
      transport_authority_id: number;
      transport_mode: SLTransportMode;
      group_of_lines?: string;
    }>;
  };
}

/**
 * Optional filters for the SL departures endpoint.
 */
export interface SLDeparturesOptions {
  /**
   * Forecast window in minutes (default: 60, minimum: 5).
   * Limits how far ahead departures are returned.
   */
  forecast?: number;
  /** Direction code (1 or 2) to filter departures by travel direction. */
  direction?: number;
  /** Line ID to filter departures to a single line. */
  line?: number;
  /** Transport mode filter (e.g. "METRO", "BUS"). */
  transport?: SLTransportMode;
}

/**
 * Response from SL Transport departures endpoint.
 */
export interface SLDeparturesResponse {
  departures: Array<SLDeparture>;
  stop_deviations: Array<SLStopDeviation>;
}
