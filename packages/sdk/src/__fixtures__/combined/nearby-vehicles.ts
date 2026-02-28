import type { CombinedSLNearbyVehiclesResult } from '../../types/combined/nearby-vehicles';
import type { GtfsVehiclePosition } from '../../types/gtfs/vehicle-positions';
import type { SLStopPointFull } from '../../types/sl/transport';

// Solna centrum coordinates
const SOLNA = { lat: 59.3587, lon: 17.9976 };

// ─── Mock GTFS vehicle positions near Solna Centrum ─────────────────

export const mockVehiclePositions: Array<GtfsVehiclePosition> = [
  {
    id: 'vp-metro-1',
    trip: { tripId: 'trip-m1', scheduleRelationship: 'SCHEDULED', directionId: 0 },
    vehicle: { id: '9031001001004617' },
    position: { latitude: SOLNA.lat + 0.0005, longitude: SOLNA.lon + 0.001, bearing: 96 },
    currentStatus: 'IN_TRANSIT_TO',
    timestamp: 1709100900,
  },
  {
    id: 'vp-bus-1',
    trip: { tripId: 'trip-b1', scheduleRelationship: 'SCHEDULED', directionId: 1 },
    vehicle: { id: '9031001007048590', label: 'Bus 113' },
    position: {
      latitude: SOLNA.lat - 0.001,
      longitude: SOLNA.lon + 0.0005,
      bearing: 180,
      speed: 8.5,
    },
    currentStatus: 'IN_TRANSIT_TO',
    timestamp: 1709100850,
  },
  {
    id: 'vp-tram-1',
    trip: { tripId: 'trip-t1', scheduleRelationship: 'SCHEDULED' },
    vehicle: { id: '9031001002510002' },
    position: { latitude: SOLNA.lat - 0.002, longitude: SOLNA.lon + 0.003, bearing: 270 },
    currentStatus: 'IN_TRANSIT_TO',
    timestamp: 1709100800,
  },
  {
    id: 'vp-far-away',
    trip: { tripId: 'trip-f1', scheduleRelationship: 'SCHEDULED' },
    vehicle: { id: 'far-vehicle' },
    position: { latitude: 59.0, longitude: 18.0 },
    currentStatus: 'IN_TRANSIT_TO',
    timestamp: 1709100700,
  },
];

// ─── Mock SL stop points near Solna Centrum ─────────────────────────

const validity = { from: '2024-01-01' };
const authority = { id: 1, name: 'SL' };

function stopPoint(
  overrides: Partial<SLStopPointFull> & {
    id: number;
    name: string;
    lat: number;
    lon: number;
    stopAreaType: string;
    stopAreaName: string;
  },
): SLStopPointFull {
  return {
    id: overrides.id,
    gid: overrides.id,
    pattern_point_gid: overrides.id,
    name: overrides.name,
    sname: overrides.name,
    designation: overrides.designation ?? '',
    local_num: 1,
    type: overrides.stopAreaType,
    has_entrance: false,
    lat: overrides.lat,
    lon: overrides.lon,
    door_orientation: 0,
    transport_authority: authority,
    stop_area: {
      id: overrides.id,
      name: overrides.stopAreaName,
      sname: overrides.stopAreaName,
      type: overrides.stopAreaType,
    },
    valid: validity,
  };
}

export const mockStopPoints: Array<SLStopPointFull> = [
  stopPoint({
    id: 1001,
    name: 'Solna centrum',
    designation: '2',
    lat: SOLNA.lat + 0.0006,
    lon: SOLNA.lon + 0.0003,
    stopAreaType: 'METROSTN',
    stopAreaName: 'Solna centrum',
  }),
  stopPoint({
    id: 1002,
    name: 'Solna centrum',
    designation: 'G',
    lat: SOLNA.lat - 0.0003,
    lon: SOLNA.lon + 0.001,
    stopAreaType: 'BUSTERM',
    stopAreaName: 'Solna centrum',
  }),
  stopPoint({
    id: 1003,
    name: 'Solna centrum',
    designation: '3',
    lat: SOLNA.lat - 0.003,
    lon: SOLNA.lon + 0.003,
    stopAreaType: 'TRAMSTN',
    stopAreaName: 'Solna centrum tvärbanan',
  }),
  stopPoint({
    id: 9999,
    name: 'Far away stop',
    designation: 'A',
    lat: 58.0,
    lon: 16.0,
    stopAreaType: 'BUSTERM',
    stopAreaName: 'Somewhere else',
  }),
];

// ─── Expected result ────────────────────────────────────────────────

export const expectedNearbyVehiclesResult: Pick<
  CombinedSLNearbyVehiclesResult,
  'radiusKm' | 'activeModes'
> & { vehicleCount: number } = {
  radiusKm: 1.0,
  activeModes: ['metro', 'bus', 'tram'],
  vehicleCount: 3,
};
