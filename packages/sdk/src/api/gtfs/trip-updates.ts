import type { transit_realtime } from 'gtfs-realtime-bindings';
import type { GtfsOperator } from '../../types/gtfs/service-alerts';
import type {
  GtfsStopScheduleRelationship,
  GtfsStopTimeEvent,
  GtfsStopTimeUpdate,
  GtfsTripDescriptor,
  GtfsTripScheduleRelationship,
  GtfsTripUpdate,
  GtfsVehicleDescriptor,
} from '../../types/gtfs/trip-updates';
import { GtfsBaseApi, type GtfsBaseApiOptions } from './base';

type ITripUpdate = transit_realtime.ITripUpdate;
type ITripDescriptor = transit_realtime.ITripDescriptor;
type IVehicleDescriptor = transit_realtime.IVehicleDescriptor;
type IStopTimeUpdate = transit_realtime.TripUpdate.IStopTimeUpdate;
type IStopTimeEvent = transit_realtime.TripUpdate.IStopTimeEvent;

const TRIP_SCHEDULE_RELATIONSHIP_MAP: Record<number, GtfsTripScheduleRelationship> = {
  0: 'SCHEDULED',
  1: 'ADDED',
  2: 'UNSCHEDULED',
  3: 'CANCELED',
  5: 'REPLACEMENT',
  6: 'DUPLICATED',
};

const STOP_SCHEDULE_RELATIONSHIP_MAP: Record<number, GtfsStopScheduleRelationship> = {
  0: 'SCHEDULED',
  1: 'SKIPPED',
  2: 'NO_DATA',
  3: 'UNSCHEDULED',
};

/**
 * Client for GTFS Sweden 3 TripUpdates feeds.
 *
 * Fetches protobuf-encoded trip updates from Trafiklab's GTFS-RT feeds
 * and decodes them into clean TypeScript objects. Provides real-time
 * arrival/departure predictions, delays, and cancellations for all
 * Swedish transit operators with real-time data support.
 *
 * Requires a GTFS Sweden 3 API key from Trafiklab.
 *
 * @see https://gtfs.org/realtime/reference/#message-tripupdate
 * @see https://trafiklab.se/api/gtfs-datasets/gtfs-sweden/
 */
export class GtfsTripUpdatesApi extends GtfsBaseApi {
  constructor(options: GtfsBaseApiOptions) {
    super(options);
  }

  /**
   * Get active trip updates for a Swedish transit operator.
   *
   * Returns real-time predictions for trips in progress, including
   * per-stop arrival/departure times, delays, and cancellations.
   *
   * @param operator - Operator abbreviation (e.g. `'ul'` for Uppsala, `'skane'` for Skåne).
   *                   See {@link GtfsOperator} for all supported values.
   * @returns Array of decoded trip updates
   */
  async getTripUpdates(operator: GtfsOperator): Promise<Array<GtfsTripUpdate>> {
    const feed = await this.fetchFeed(`/${operator}/TripUpdatesSweden.pb`);

    return feed.entity
      .filter((e) => e.tripUpdate != null)
      .map((e) => this.transformTripUpdate(e.id, e.tripUpdate!));
  }

  private transformTripUpdate(id: string, tu: ITripUpdate): GtfsTripUpdate {
    const result: GtfsTripUpdate = {
      id,
      trip: transformTripDescriptor(tu.trip),
      stopTimeUpdates: (tu.stopTimeUpdate ?? []).map(transformStopTimeUpdate),
      timestamp: toTimestamp(tu.timestamp),
      delay: tu.delay != null && tu.delay !== 0 ? tu.delay : undefined,
    };

    const vehicle = tu.vehicle ? transformVehicle(tu.vehicle) : undefined;
    if (vehicle) {
      result.vehicle = vehicle;
    }

    return result;
  }
}

interface LongLike {
  toNumber(): number;
}

function toTimestamp(v: number | LongLike | null | undefined): number | undefined {
  if (v == null) {
    return undefined;
  }
  const n = typeof v === 'number' ? v : v.toNumber();
  return n === 0 ? undefined : n;
}

function transformTripDescriptor(t: ITripDescriptor): GtfsTripDescriptor {
  const trip: GtfsTripDescriptor = {
    scheduleRelationship:
      TRIP_SCHEDULE_RELATIONSHIP_MAP[t.scheduleRelationship ?? -1] ?? 'SCHEDULED',
  };
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

function transformVehicle(v: IVehicleDescriptor): GtfsVehicleDescriptor | undefined {
  const vehicle: GtfsVehicleDescriptor = {};
  if (v.id) {
    vehicle.id = v.id;
  }
  if (v.label) {
    vehicle.label = v.label;
  }
  if (v.licensePlate) {
    vehicle.licensePlate = v.licensePlate;
  }
  if (!vehicle.id && !vehicle.label && !vehicle.licensePlate) {
    return undefined;
  }
  return vehicle;
}

function transformStopTimeEvent(e: IStopTimeEvent): GtfsStopTimeEvent {
  const event: GtfsStopTimeEvent = {};
  if (e.delay != null) {
    event.delay = e.delay;
  }
  const time = toTimestamp(e.time);
  if (time != null) {
    event.time = time;
  }
  if (e.uncertainty != null && e.uncertainty !== 0) {
    event.uncertainty = e.uncertainty;
  }
  return event;
}

function transformStopTimeUpdate(stu: IStopTimeUpdate): GtfsStopTimeUpdate {
  const update: GtfsStopTimeUpdate = {
    scheduleRelationship:
      STOP_SCHEDULE_RELATIONSHIP_MAP[stu.scheduleRelationship ?? -1] ?? 'SCHEDULED',
  };
  if (stu.stopSequence != null && stu.stopSequence !== 0) {
    update.stopSequence = stu.stopSequence;
  }
  if (stu.stopId) {
    update.stopId = stu.stopId;
  }
  if (stu.arrival) {
    update.arrival = transformStopTimeEvent(stu.arrival);
  }
  if (stu.departure) {
    update.departure = transformStopTimeEvent(stu.departure);
  }
  return update;
}
