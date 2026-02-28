/**
 * Types for GTFS-Realtime ServiceAlerts.
 *
 * These are clean TypeScript types representing decoded protobuf data
 * from the GTFS Sweden 3 ServiceAlerts feed. They abstract away the
 * raw protobuf structure into idiomatic TypeScript.
 *
 * @see https://gtfs.org/realtime/reference/#message-alert
 * @see https://trafiklab.se/api/gtfs-datasets/gtfs-sweden/
 */

/**
 * Canonical list of operator abbreviations used in GTFS Sweden 3 feed URLs.
 * Only operators with real-time data support are included.
 */
export const GTFS_OPERATORS = [
  'sl',
  'ul',
  'otraf',
  'jlt',
  'krono',
  'klt',
  'gotland',
  'blekinge',
  'skane',
  'halland',
  'varm',
  'orebro',
  'vastmanland',
  'dt',
  'xt',
  'dintur',
] as const;

/** Known operator abbreviation, with branded string fallback for unknown operators. */
export type GtfsOperator = (typeof GTFS_OPERATORS)[number] | (string & {});

/** Human-readable names for known GTFS operators. */
export const GTFS_OPERATOR_NAMES: Record<string, string> = {
  sl: 'SL (Stockholm)',
  ul: 'UL (Uppsala)',
  otraf: 'Östgötatrafiken',
  jlt: 'JLT (Jönköping)',
  krono: 'Kronoberg',
  klt: 'KLT (Kalmar)',
  gotland: 'Gotland',
  blekinge: 'Blekingetrafiken',
  skane: 'Skånetrafiken',
  halland: 'Hallandstrafiken',
  varm: 'Värmlandstrafik',
  orebro: 'Örebro',
  vastmanland: 'Västmanland',
  dt: 'Dalatrafik',
  xt: 'X-trafik (Gävleborg)',
  dintur: 'Din Tur (Västernorrland)',
};

/**
 * GTFS-RT Alert cause values.
 * @see https://gtfs.org/realtime/reference/#enum-cause
 */
export type GtfsAlertCause =
  | 'UNKNOWN_CAUSE'
  | 'OTHER_CAUSE'
  | 'TECHNICAL_PROBLEM'
  | 'STRIKE'
  | 'DEMONSTRATION'
  | 'ACCIDENT'
  | 'HOLIDAY'
  | 'WEATHER'
  | 'MAINTENANCE'
  | 'CONSTRUCTION'
  | 'POLICE_ACTIVITY'
  | 'MEDICAL_EMERGENCY';

/**
 * GTFS-RT Alert effect values.
 * @see https://gtfs.org/realtime/reference/#enum-effect
 */
export type GtfsAlertEffect =
  | 'NO_SERVICE'
  | 'REDUCED_SERVICE'
  | 'SIGNIFICANT_DELAYS'
  | 'DETOUR'
  | 'ADDITIONAL_SERVICE'
  | 'MODIFIED_SERVICE'
  | 'OTHER_EFFECT'
  | 'UNKNOWN_EFFECT'
  | 'STOP_MOVED'
  | 'NO_EFFECT'
  | 'ACCESSIBILITY_ISSUE';

/**
 * A time range during which a service alert is active.
 * Values are UNIX timestamps (seconds since epoch).
 */
export interface GtfsAlertActivePeriod {
  start?: number;
  end?: number;
}

/** A GTFS trip descriptor within an informed entity. */
export interface GtfsAlertTrip {
  tripId?: string;
  routeId?: string;
  directionId?: number;
  startTime?: string;
  startDate?: string;
}

/**
 * Describes what transit entity is affected by an alert.
 * At least one field will be populated.
 */
export interface GtfsInformedEntity {
  agencyId?: string;
  routeId?: string;
  routeType?: number;
  stopId?: string;
  trip?: GtfsAlertTrip;
}

/**
 * A service alert from a GTFS-Realtime ServiceAlerts feed.
 *
 * Contains human-readable text describing a disruption plus
 * structured metadata about what entities are affected.
 */
export interface GtfsServiceAlert {
  /** Unique identifier for this alert entity in the feed. */
  id: string;
  /** Why the alert was issued. */
  cause: GtfsAlertCause;
  /** What effect the alert has on service. */
  effect: GtfsAlertEffect;
  /** Short summary of the alert (typically Swedish). */
  headerText?: string;
  /** Detailed description of the alert (typically Swedish). */
  descriptionText?: string;
  /** Optional URL with more information. */
  url?: string;
  /** Time ranges when the alert is active. */
  activePeriods: Array<GtfsAlertActivePeriod>;
  /** Transit entities (routes, stops, trips) affected by the alert. */
  informedEntities: Array<GtfsInformedEntity>;
}
