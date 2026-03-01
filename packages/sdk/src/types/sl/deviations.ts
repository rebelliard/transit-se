/**
 * Transport mode values used by the SL Deviations API (uppercase).
 * Note: the SL Transport API uses lowercase equivalents.
 */
export type SLDeviationTransportMode =
  | 'BUS'
  | 'METRO'
  | 'TRAM'
  | 'TRAIN'
  | 'SHIP'
  | 'FERRY'
  | 'TAXI';

/**
 * Publication window for a deviation message.
 */
interface SLDeviationPublish {
  from: string;
  upto: string;
}

/**
 * Priority hints for sorting deviation messages.
 * All three fields are only used for ordering — use `importance_level` first.
 */
interface SLDeviationPriority {
  importance_level: number;
  influence_level: number;
  urgency_level: number;
}

/**
 * A localised variant of a deviation message.
 */
interface SLDeviationMessageVariant {
  header: string;
  details: string;
  /** Human-readable scope description, e.g. "Tunnelbanans röda linje 13, 14" */
  scope_alias: string;
  language: string;
  weblink?: string;
}

/**
 * A stop point within a deviation's affected stop area.
 */
interface SLDeviationStopPoint {
  id: number;
  name: string;
}

/**
 * A stop area (station) affected by a deviation.
 */
interface SLDeviationStopArea {
  id: number;
  name: string;
  type: string;
  transport_authority: number;
  stop_points?: Array<SLDeviationStopPoint>;
}

/**
 * A transit line affected by a deviation.
 */
interface SLDeviationLine {
  id: number;
  transport_authority: number;
  designation: string;
  transport_mode: SLDeviationTransportMode;
  name: string;
  group_of_lines: string;
}

/**
 * The scope of a deviation: which stop areas and/or lines are affected.
 */
interface SLDeviationScope {
  stop_areas?: Array<SLDeviationStopArea>;
  lines?: Array<SLDeviationLine>;
}

/**
 * A category tag on a deviation (e.g. FACILITY/LIFT, FACILITY/ESCALATOR).
 */
interface SLDeviationCategory {
  group: string;
  type: string;
}

/**
 * A single deviation message from the SL Deviations API.
 */
export interface SLDeviationMessage {
  version: number;
  created: string;
  modified?: string;
  deviation_case_id: number;
  publish: SLDeviationPublish;
  priority: SLDeviationPriority;
  message_variants: Array<SLDeviationMessageVariant>;
  scope: SLDeviationScope;
  categories?: Array<SLDeviationCategory>;
}

/**
 * Query parameters accepted by `SLDeviationsApi.getDeviations()`.
 */
export interface SLDeviationsParams {
  /** Include deviations that start in the future. Default: false. */
  future?: boolean;
  /** Filter to specific SL site IDs. */
  siteIds?: Array<number>;
  /** Filter to specific line IDs. */
  lineIds?: Array<number>;
  /** Filter to specific transport modes. */
  transportModes?: Array<SLDeviationTransportMode>;
  /** Filter to a specific transport authority. */
  transportAuthority?: number;
}
