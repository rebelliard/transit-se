import { GTFS_OPERATORS } from '../../types/gtfs/service-alerts';
import { API_DESCRIPTIONS } from '../../utils/get-api-description';

const GTFS_KEY_RESPONSE = {
  description: 'GTFS API key not configured',
  content: {
    'application/json': {
      schema: { type: 'object' },
      example: {
        error: 'TRAFIKLAB_GTFS_KEY not configured',
        help: 'Set TRAFIKLAB_GTFS_KEY env var. Enable "GTFS Sweden 3 Realtime" at developer.trafiklab.se',
        hint: 'SL endpoints (/sl/*) work without a key.',
      },
    },
  },
};

const OPERATOR_PARAM = {
  name: 'operator',
  in: 'path',
  required: true,
  schema: {
    type: 'string',
    enum: GTFS_OPERATORS,
  },
  example: 'ul',
};

/**
 * OpenAPI path-item for GET /gtfs/service-alerts/{operator}.
 */
export const gtfsServiceAlertsPath = {
  get: {
    tags: ['GTFS (requires key)'],
    summary: `${API_DESCRIPTIONS.gtfs_service_alerts.icon} ${API_DESCRIPTIONS.gtfs_service_alerts.summary}`,
    description: API_DESCRIPTIONS.gtfs_service_alerts.description,
    parameters: [
      {
        ...OPERATOR_PARAM,
        description: API_DESCRIPTIONS.gtfs_service_alerts.params.operator,
      },
    ],
    responses: {
      '200': {
        description: 'Array of service alerts for the operator',
        content: {
          'application/json': {
            schema: { type: 'array', items: { type: 'object' } },
            example: [
              {
                id: 'UL_ServiceAlert_12345',
                cause: 'MAINTENANCE',
                effect: 'DETOUR',
                headerText: 'Omlagd linje',
                descriptionText: 'Linje 801 kör en annan väg pga vägarbete vid Uppsala C.',
                activePeriods: [{ start: 1740700800, end: 1741305600 }],
                informedEntities: [{ agencyId: 'UL', routeId: '801' }],
              },
            ],
          },
        },
      },
      '403': GTFS_KEY_RESPONSE,
    },
  },
};

/**
 * OpenAPI path-item for GET /gtfs/trip-updates/{operator}.
 */
export const gtfsTripUpdatesPath = {
  get: {
    tags: ['GTFS (requires key)'],
    summary: `${API_DESCRIPTIONS.gtfs_trip_updates.icon} ${API_DESCRIPTIONS.gtfs_trip_updates.summary}`,
    description: API_DESCRIPTIONS.gtfs_trip_updates.description,
    parameters: [
      {
        ...OPERATOR_PARAM,
        description: API_DESCRIPTIONS.gtfs_trip_updates.params.operator,
      },
    ],
    responses: {
      '200': {
        description: 'Array of trip updates for the operator',
        content: {
          'application/json': {
            schema: { type: 'array', items: { type: 'object' } },
            example: [
              {
                id: 'UL_TripUpdate_12345',
                trip: {
                  tripId: 'trip-abc-123',
                  routeId: '801',
                  directionId: 0,
                  startTime: '08:30:00',
                  startDate: '20240228',
                  scheduleRelationship: 'SCHEDULED',
                },
                vehicle: { id: 'vehicle-42', label: 'Bus 801' },
                stopTimeUpdates: [
                  {
                    stopSequence: 5,
                    stopId: '740000001',
                    arrival: { delay: 120, time: 1709101200 },
                    departure: { delay: 150, time: 1709101350 },
                    scheduleRelationship: 'SCHEDULED',
                  },
                ],
                timestamp: 1709100900,
                delay: 120,
              },
            ],
          },
        },
      },
      '403': GTFS_KEY_RESPONSE,
    },
  },
};

/**
 * OpenAPI path-item for GET /gtfs/vehicle-positions/{operator}.
 */
export const gtfsVehiclePositionsPath = {
  get: {
    tags: ['GTFS (requires key)'],
    summary: `${API_DESCRIPTIONS.gtfs_vehicle_positions.icon} ${API_DESCRIPTIONS.gtfs_vehicle_positions.summary}`,
    description: API_DESCRIPTIONS.gtfs_vehicle_positions.description,
    parameters: [
      {
        ...OPERATOR_PARAM,
        description: API_DESCRIPTIONS.gtfs_vehicle_positions.params.operator,
      },
    ],
    responses: {
      '200': {
        description: 'Array of vehicle positions for the operator',
        content: {
          'application/json': {
            schema: { type: 'array', items: { type: 'object' } },
            example: [
              {
                id: 'UL_Vehicle_42',
                trip: {
                  tripId: 'trip-abc-123',
                  routeId: '801',
                  scheduleRelationship: 'SCHEDULED',
                },
                vehicle: { id: 'vehicle-42', label: 'Bus 801' },
                position: { latitude: 59.8586, longitude: 17.6389, bearing: 180, speed: 12.5 },
                currentStatus: 'IN_TRANSIT_TO',
                stopId: '740000001',
                timestamp: 1709100900,
                occupancyStatus: 'FEW_SEATS_AVAILABLE',
              },
            ],
          },
        },
      },
      '403': GTFS_KEY_RESPONSE,
    },
  },
};
