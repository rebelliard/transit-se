import type { transit_realtime } from 'gtfs-realtime-bindings';
import type { GtfsOperator } from '../../types/gtfs/service-alerts';
import type { GtfsTripScheduleRelationship } from '../../types/gtfs/trip-updates';
import type {
  GtfsCongestionLevel,
  GtfsOccupancyStatus,
  GtfsPosition,
  GtfsVehiclePosition,
  GtfsVehiclePositionTrip,
  GtfsVehiclePositionVehicle,
  GtfsVehicleStopStatus,
} from '../../types/gtfs/vehicle-positions';
import { GtfsBaseApi, type GtfsBaseApiOptions } from './base';

type IVehiclePosition = transit_realtime.IVehiclePosition;
type ITripDescriptor = transit_realtime.ITripDescriptor;
type IVehicleDescriptor = transit_realtime.IVehicleDescriptor;
type IPosition = transit_realtime.IPosition;

const TRIP_SCHEDULE_RELATIONSHIP_MAP: Record<number, GtfsTripScheduleRelationship> = {
  0: 'SCHEDULED',
  1: 'ADDED',
  2: 'UNSCHEDULED',
  3: 'CANCELED',
  5: 'REPLACEMENT',
  6: 'DUPLICATED',
};

const VEHICLE_STOP_STATUS_MAP: Record<number, GtfsVehicleStopStatus> = {
  0: 'INCOMING_AT',
  1: 'STOPPED_AT',
  2: 'IN_TRANSIT_TO',
};

const CONGESTION_LEVEL_MAP: Record<number, GtfsCongestionLevel> = {
  0: 'UNKNOWN_CONGESTION_LEVEL',
  1: 'RUNNING_SMOOTHLY',
  2: 'STOP_AND_GO',
  3: 'CONGESTION',
  4: 'SEVERE_CONGESTION',
};

const OCCUPANCY_STATUS_MAP: Record<number, GtfsOccupancyStatus> = {
  0: 'EMPTY',
  1: 'MANY_SEATS_AVAILABLE',
  2: 'FEW_SEATS_AVAILABLE',
  3: 'STANDING_ROOM_ONLY',
  4: 'CRUSHED_STANDING_ROOM_ONLY',
  5: 'FULL',
  6: 'NOT_ACCEPTING_PASSENGERS',
  7: 'NO_DATA_AVAILABLE',
  8: 'NOT_BOARDABLE',
};

/**
 * Client for GTFS Sweden 3 VehiclePositions feeds.
 *
 * Fetches protobuf-encoded vehicle positions from Trafiklab's GTFS-RT feeds
 * and decodes them into clean TypeScript objects. Provides real-time GPS
 * locations, bearing, speed, and occupancy data for vehicles. Updated
 * every 3 seconds.
 *
 * Requires a GTFS Sweden 3 API key from Trafiklab.
 *
 * @see https://gtfs.org/realtime/reference/#message-vehicleposition
 * @see https://trafiklab.se/api/gtfs-datasets/gtfs-sweden/
 */
export class GtfsVehiclePositionsApi extends GtfsBaseApi {
  constructor(options: GtfsBaseApiOptions) {
    super(options);
  }

  /**
   * Get current vehicle positions for a Swedish transit operator.
   *
   * Returns real-time GPS positions, bearing, speed, stop status,
   * and occupancy for all vehicles currently in service.
   *
   * @param operator - Operator abbreviation (e.g. `'ul'` for Uppsala, `'skane'` for Skåne).
   *                   See {@link GtfsOperator} for all supported values.
   * @returns Array of decoded vehicle positions
   */
  async getVehiclePositions(operator: GtfsOperator): Promise<Array<GtfsVehiclePosition>> {
    const feed = await this.fetchFeed(`/${operator}/VehiclePositionsSweden.pb`);

    return feed.entity
      .filter((e) => e.vehicle != null)
      .map((e) => this.transformVehiclePosition(e.id, e.vehicle!));
  }

  private transformVehiclePosition(id: string, vp: IVehiclePosition): GtfsVehiclePosition {
    const result: GtfsVehiclePosition = { id };

    if (vp.trip) {
      result.trip = transformTrip(vp.trip);
    }

    const vehicle = vp.vehicle ? transformVehicle(vp.vehicle) : undefined;
    if (vehicle) {
      result.vehicle = vehicle;
    }

    if (vp.position) {
      result.position = transformPosition(vp.position);
    }

    if (vp.currentStopSequence != null && vp.currentStopSequence !== 0) {
      result.currentStopSequence = vp.currentStopSequence;
    }

    if (vp.stopId) {
      result.stopId = vp.stopId;
    }

    if (vp.currentStatus != null) {
      result.currentStatus = VEHICLE_STOP_STATUS_MAP[vp.currentStatus] ?? 'IN_TRANSIT_TO';
    }

    const ts = toTimestamp(vp.timestamp);
    if (ts != null) {
      result.timestamp = ts;
    }

    if (vp.congestionLevel != null && vp.congestionLevel !== 0) {
      result.congestionLevel =
        CONGESTION_LEVEL_MAP[vp.congestionLevel] ?? 'UNKNOWN_CONGESTION_LEVEL';
    }

    if (vp.occupancyStatus != null && vp.occupancyStatus !== 0 && vp.occupancyStatus !== 7) {
      result.occupancyStatus = OCCUPANCY_STATUS_MAP[vp.occupancyStatus] ?? 'NO_DATA_AVAILABLE';
    }

    if (vp.occupancyPercentage != null && vp.occupancyPercentage !== 0) {
      result.occupancyPercentage = vp.occupancyPercentage;
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

function transformTrip(t: ITripDescriptor): GtfsVehiclePositionTrip {
  const trip: GtfsVehiclePositionTrip = {
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

function transformVehicle(v: IVehicleDescriptor): GtfsVehiclePositionVehicle | undefined {
  const vehicle: GtfsVehiclePositionVehicle = {};
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

function transformPosition(p: IPosition): GtfsPosition {
  const pos: GtfsPosition = {
    latitude: p.latitude,
    longitude: p.longitude,
  };
  if (p.bearing != null && p.bearing !== 0) {
    pos.bearing = p.bearing;
  }
  if (p.odometer != null && p.odometer !== 0) {
    pos.odometer = p.odometer;
  }
  if (p.speed != null && p.speed !== 0) {
    pos.speed = p.speed;
  }
  return pos;
}
