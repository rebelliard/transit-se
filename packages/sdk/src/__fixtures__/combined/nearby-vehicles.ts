import type { CombinedSLNearbyVehiclesResult } from '../../types/combined/nearby-vehicles';
import type { GtfsVehiclePosition } from '../../types/gtfs/vehicle-positions';
import type { SLStopPointFull } from '../../types/sl/transport';

// ─── Real GTFS vehicle positions near T-Centralen (site ID 9001) ────

export const mockVehiclePositions: Array<GtfsVehiclePosition> = [
  {
    id: '48151772374092874',
    trip: { tripId: '14010000704215260', scheduleRelationship: 'SCHEDULED', directionId: 0 },
    vehicle: { id: '9031001001004815' },
    position: { latitude: 59.3312, longitude: 18.061, bearing: 59, speed: 2.5 },
    currentStatus: 'IN_TRANSIT_TO',
    timestamp: 1772374092,
  },
  {
    id: '4711772374092768',
    trip: { tripId: '14010000712345678', scheduleRelationship: 'SCHEDULED', directionId: 1 },
    vehicle: { id: '9031001007000471', label: 'Buss 3' },
    position: { latitude: 59.3321, longitude: 18.0608, bearing: 80, speed: 3.1 },
    currentStatus: 'IN_TRANSIT_TO',
    timestamp: 1772374092,
  },
  {
    id: '100241772374092456',
    trip: { tripId: '14010200702563080', scheduleRelationship: 'SCHEDULED' },
    vehicle: { id: '9031001002510024' },
    position: { latitude: 59.3323, longitude: 18.0625, bearing: 88 },
    currentStatus: 'IN_TRANSIT_TO',
    timestamp: 1772374091,
  },
  {
    id: '55681772374093060',
    trip: { tripId: '14010000708150379', scheduleRelationship: 'SCHEDULED', directionId: 0 },
    vehicle: { id: '9031001004505568' },
    position: { latitude: 60.2041, longitude: 18.7436, bearing: 154, speed: 9.4 },
    currentStatus: 'IN_TRANSIT_TO',
    timestamp: 1772374091,
  },
];

// ─── Real SL stop points near T-Centralen ───────────────────────────

const authority = { id: 1, name: 'Storstockholms Lokaltrafik' };

export const mockStopPoints: Array<SLStopPointFull> = [
  {
    id: 1051,
    gid: 9022001001051001,
    pattern_point_gid: 9025001000001051,
    name: 'T-Centralen',
    sname: 'T-Centralen',
    designation: '3',
    local_num: 1,
    type: 'PLATFORM',
    has_entrance: true,
    lat: 59.3315327442894,
    lon: 18.0608876677575,
    door_orientation: 228,
    transport_authority: authority,
    stop_area: { id: 1051, name: 'T-Centralen', type: 'METROSTN' },
    valid: { from: '2024-07-11T00:00:00' },
  },
  {
    id: 10526,
    gid: 9022001010291007,
    pattern_point_gid: 9025001000010526,
    name: 'T-Centralen',
    sname: 'T-Centralen',
    designation: 'M',
    local_num: 7,
    type: 'BUSSTOP',
    has_entrance: false,
    lat: 59.3318771958359,
    lon: 18.0610106174182,
    door_orientation: 208,
    transport_authority: authority,
    stop_area: { id: 10291, name: 'T-Centralen', type: 'BUSTERM' },
    valid: { from: '2020-06-18T00:00:00' },
  },
  {
    id: 4300,
    gid: 9022001004301002,
    pattern_point_gid: 9025001000004300,
    name: 'T-Centralen',
    sname: 'T-Centralen',
    local_num: 2,
    type: 'PLATFORM',
    has_entrance: false,
    lat: 59.3321035623807,
    lon: 18.0621399810141,
    door_orientation: 29,
    transport_authority: authority,
    stop_area: { id: 4301, name: 'T-Centralen', type: 'TRAMSTN' },
    valid: { from: '2018-08-18T00:00:00' },
  },
  {
    id: 50001,
    gid: 9022001050001001,
    pattern_point_gid: 9025001000050001,
    name: 'Norsborg',
    sname: 'Norsborg',
    designation: '1',
    local_num: 1,
    type: 'PLATFORM',
    has_entrance: false,
    lat: 59.2436,
    lon: 17.8147,
    door_orientation: 0,
    transport_authority: authority,
    stop_area: { id: 50001, name: 'Norsborg', type: 'METROSTN' },
    valid: { from: '2024-01-01' },
  },
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
