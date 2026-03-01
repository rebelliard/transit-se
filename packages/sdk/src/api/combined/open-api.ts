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
                name: 'T-Centralen',
                siteId: 9001,
                latitude: 59.3314,
                longitude: 18.0604,
              },
              radiusKm: 1,
              vehicles: [
                {
                  id: '48151772374092874',
                  vehicleId: '9031001001004815',
                  transportMode: 'metro',
                  position: {
                    latitude: 59.3312,
                    longitude: 18.061,
                    bearing: 59,
                    speed: 2.5,
                  },
                  distanceMeters: 38,
                  currentStatus: 'IN_TRANSIT_TO',
                  timestamp: 1772374092,
                  trip: {
                    tripId: '14010000704215260',
                    directionId: 0,
                  },
                  nearestStopPoint: {
                    name: 'T-Centralen',
                    designation: '3',
                    type: 'METROSTN',
                    distanceMeters: 12,
                  },
                },
              ],
              activeModes: ['metro', 'bus', 'tram'],
              timestamp: 1772374092,
            },
          },
        },
      },
      '400': { description: 'Invalid or missing location parameters' },
      '403': { description: 'GTFS key not configured' },
    },
  },
};
