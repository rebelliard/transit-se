import type { transit_realtime } from 'gtfs-realtime-bindings';
import type {
  GtfsAlertCause,
  GtfsAlertEffect,
  GtfsInformedEntity,
  GtfsOperator,
  GtfsServiceAlert,
} from '../../types/gtfs/service-alerts';
import { GtfsBaseApi, type GtfsBaseApiOptions } from './base';

type IAlert = transit_realtime.IAlert;
type ITranslatedString = transit_realtime.ITranslatedString;
type ITranslation = transit_realtime.TranslatedString.ITranslation;
type IEntitySelector = transit_realtime.IEntitySelector;
type ITripDescriptor = transit_realtime.ITripDescriptor;

const CAUSE_MAP: Record<number, GtfsAlertCause> = {
  1: 'UNKNOWN_CAUSE',
  2: 'OTHER_CAUSE',
  3: 'TECHNICAL_PROBLEM',
  4: 'STRIKE',
  5: 'DEMONSTRATION',
  6: 'ACCIDENT',
  7: 'HOLIDAY',
  8: 'WEATHER',
  9: 'MAINTENANCE',
  10: 'CONSTRUCTION',
  11: 'POLICE_ACTIVITY',
  12: 'MEDICAL_EMERGENCY',
};

const EFFECT_MAP: Record<number, GtfsAlertEffect> = {
  1: 'NO_SERVICE',
  2: 'REDUCED_SERVICE',
  3: 'SIGNIFICANT_DELAYS',
  4: 'DETOUR',
  5: 'ADDITIONAL_SERVICE',
  6: 'MODIFIED_SERVICE',
  7: 'OTHER_EFFECT',
  8: 'UNKNOWN_EFFECT',
  9: 'STOP_MOVED',
  10: 'NO_EFFECT',
  11: 'ACCESSIBILITY_ISSUE',
};

/**
 * Client for GTFS Sweden 3 ServiceAlerts feeds.
 *
 * Fetches protobuf-encoded service alerts from Trafiklab's GTFS-RT feeds
 * and decodes them into clean TypeScript objects. Covers all Swedish
 * transit operators with real-time data support (UL, Skånetrafiken,
 * Östgötatrafiken, etc.).
 *
 * Requires a GTFS Sweden 3 API key from Trafiklab.
 *
 * For Stockholm (SL) disruptions, prefer {@link SLDeviationsApi} which
 * provides richer data without requiring an API key.
 *
 * @see https://trafiklab.se/api/gtfs-datasets/gtfs-sweden/
 */
export class GtfsServiceAlertsApi extends GtfsBaseApi {
  constructor(options: GtfsBaseApiOptions) {
    super(options);
  }

  /**
   * Get active service alerts for a Swedish transit operator.
   *
   * @param operator - Operator abbreviation (e.g. `'ul'` for Uppsala, `'skane'` for Skåne).
   *                   See {@link GtfsOperator} for all supported values.
   * @returns Array of decoded service alerts
   */
  async getServiceAlerts(operator: GtfsOperator): Promise<Array<GtfsServiceAlert>> {
    const feed = await this.fetchFeed(`/${operator}/ServiceAlertsSweden.pb`);

    return feed.entity
      .filter((e) => e.alert != null)
      .map((e) => this.transformAlert(e.id, e.alert!));
  }

  private transformAlert(id: string, alert: IAlert): GtfsServiceAlert {
    return {
      id,
      cause: CAUSE_MAP[alert.cause ?? -1] ?? 'UNKNOWN_CAUSE',
      effect: EFFECT_MAP[alert.effect ?? -1] ?? 'UNKNOWN_EFFECT',
      headerText: extractText(alert.headerText),
      descriptionText: extractText(alert.descriptionText),
      url: extractText(alert.url),
      activePeriods: (alert.activePeriod ?? []).map((p) => ({
        start: toTimestamp(p.start),
        end: toTimestamp(p.end),
      })),
      informedEntities: (alert.informedEntity ?? []).map(transformEntity),
    };
  }
}

function extractText(ts: ITranslatedString | null | undefined, lang = 'sv'): string | undefined {
  if (!ts?.translation?.length) {
    return undefined;
  }
  const match = ts.translation.find((t: ITranslation) => t.language === lang);
  return (match ?? ts.translation[0])?.text;
}

interface LongLike {
  toNumber(): number;
}

/** Convert protobufjs Long/number to plain number, treating 0 as unset for timestamps. */
function toTimestamp(v: number | LongLike | null | undefined): number | undefined {
  if (v == null) {
    return undefined;
  }
  const n = typeof v === 'number' ? v : v.toNumber();
  return n === 0 ? undefined : n;
}

function transformEntity(e: IEntitySelector): GtfsInformedEntity {
  const entity: GtfsInformedEntity = {};
  if (e.agencyId) {
    entity.agencyId = e.agencyId;
  }
  if (e.routeId) {
    entity.routeId = e.routeId;
  }
  if (e.routeType != null) {
    entity.routeType = e.routeType;
  }
  if (e.stopId) {
    entity.stopId = e.stopId;
  }
  if (e.trip) {
    entity.trip = transformTrip(e.trip);
  }
  return entity;
}

function transformTrip(t: ITripDescriptor): GtfsInformedEntity['trip'] {
  const trip: NonNullable<GtfsInformedEntity['trip']> = {};
  if (t.tripId) {
    trip.tripId = t.tripId;
  }
  if (t.routeId) {
    trip.routeId = t.routeId;
  }
  if (t.directionId != null) {
    trip.directionId = t.directionId;
  }
  if (t.startTime) {
    trip.startTime = t.startTime;
  }
  if (t.startDate) {
    trip.startDate = t.startDate;
  }
  return trip;
}
