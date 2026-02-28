import { API_DESCRIPTIONS } from '../../utils/get-api-description';

const desc = API_DESCRIPTIONS.combined_nearby_vehicles;

export const combinedNearbyVehiclesPath = {
  get: {
    tags: ['Combined (requires key)'],
    summary: `${desc.icon} ${desc.summary}`,
    description:
      desc.description +
      '\n\nProvide exactly one location: `site_name`, `site_id`, or `latitude`+`longitude`. ' +
      'Precedence if multiple given: `site_id` > `site_name` > `latitude`+`longitude`.',
    parameters: [
      {
        name: 'site_name',
        in: 'query',
        schema: { type: 'string' },
        description: desc.params.site_name,
      },
      {
        name: 'site_id',
        in: 'query',
        schema: { type: 'integer' },
        description: desc.params.site_id,
      },
      {
        name: 'latitude',
        in: 'query',
        schema: { type: 'number' },
        description: desc.params.latitude,
      },
      {
        name: 'longitude',
        in: 'query',
        schema: { type: 'number' },
        description: desc.params.longitude,
      },
      {
        name: 'radius_km',
        in: 'query',
        schema: { type: 'number' },
        description: desc.params.radius_km,
      },
    ],
    responses: {
      '200': {
        description: 'Nearby vehicles with transport mode classification',
        content: {
          'application/json': {
            schema: { type: 'object' },
            example: {
              location: {
                name: 'Slussen',
                siteId: 9192,
                latitude: 59.3195,
                longitude: 18.0722,
              },
              radiusKm: 1,
              vehicles: [
                {
                  id: 'SL_VehiclePosition_12345',
                  vehicleId: '9031001234500001',
                  vehicleLabel: 'Metro 1234',
                  transportMode: 'metro',
                  position: {
                    latitude: 59.3198,
                    longitude: 18.0725,
                    bearing: 90,
                    speed: 8.3,
                  },
                  distanceMeters: 42,
                  currentStatus: 'STOPPED_AT',
                  timestamp: 1743505200,
                  trip: {
                    tripId: 'trip-abc-123',
                    routeId: '17',
                    directionId: 1,
                  },
                  nearestStopPoint: {
                    name: 'Slussen',
                    designation: 'A',
                    type: 'METROSTN',
                    distanceMeters: 15,
                  },
                },
              ],
              activeModes: ['metro', 'bus'],
              timestamp: 1743505200,
            },
          },
        },
      },
      '400': { description: 'Invalid or missing location parameters' },
      '403': { description: 'GTFS key not configured' },
    },
  },
};
