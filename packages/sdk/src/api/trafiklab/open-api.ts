import { API_DESCRIPTIONS } from '../../utils/get-api-description';

const NO_KEY_RESPONSE = {
  description: 'API key not configured',
  content: {
    'application/json': {
      schema: { type: 'object' },
      example: {
        error: 'TRAFIKLAB_API_KEY not configured',
        help: 'Set TRAFIKLAB_API_KEY env var.',
        hint: 'SL endpoints (/sl/*) work without a key.',
      },
    },
  },
};

/**
 * OpenAPI path-item for GET /trafiklab/stops/search/{query}.
 */
export const trafiklabStopsSearchPath = {
  get: {
    tags: ['Trafiklab (requires key)'],
    summary: `${API_DESCRIPTIONS.trafiklab_search_stops.icon} ${API_DESCRIPTIONS.trafiklab_search_stops.summary}`,
    description: API_DESCRIPTIONS.trafiklab_search_stops.description,
    parameters: [
      {
        name: 'query',
        in: 'path',
        required: true,
        description: API_DESCRIPTIONS.trafiklab_search_stops.params.query,
        schema: { type: 'string' },
        example: 'T-Centralen',
      },
    ],
    responses: {
      '200': {
        description: 'Stop lookup response with matching stop groups',
        content: {
          'application/json': {
            schema: { type: 'object' },
            example: {
              timestamp: '2026-03-01T14:50:58',
              query: { queryTime: '2026-03-01T14:50:58', query: 'T-Centralen' },
              stop_groups: [
                {
                  id: '740020749',
                  name: 'T-Centralen T-bana',
                  area_type: 'RIKSHALLPLATS',
                  average_daily_stop_times: 2023.35,
                  transport_modes: ['METRO'],
                  stops: [
                    {
                      id: '9825',
                      name: 'T-Centralen',
                      lat: 59.33166,
                      lon: 18.061694,
                    },
                  ],
                },
              ],
            },
          },
        },
      },
      '403': NO_KEY_RESPONSE,
    },
  },
};

/**
 * OpenAPI path-item for GET /trafiklab/departures/{areaId}.
 */
export const trafiklabDeparturesPath = {
  get: {
    tags: ['Trafiklab (requires key)'],
    summary: `${API_DESCRIPTIONS.trafiklab_get_departures.icon} ${API_DESCRIPTIONS.trafiklab_get_departures.summary}`,
    description: API_DESCRIPTIONS.trafiklab_get_departures.description,
    parameters: [
      {
        name: 'areaId',
        in: 'path',
        required: true,
        description: API_DESCRIPTIONS.trafiklab_get_departures.params.area_id,
        schema: { type: 'string' },
        example: '740020749',
      },
      {
        name: 'time',
        in: 'query',
        required: false,
        description: API_DESCRIPTIONS.trafiklab_get_departures.params.time,
        schema: { type: 'string' },
        example: '2026-02-28T12:00',
      },
    ],
    responses: {
      '200': {
        description: 'Departures response',
        content: {
          'application/json': {
            schema: { type: 'object' },
            example: {
              timestamp: '2026-03-01T14:51:18',
              query: { queryTime: '2026-03-01T14:51:00', query: '740020749' },
              stops: [
                {
                  id: '9825',
                  name: 'T-Centralen',
                  lat: 59.33166,
                  lon: 18.061694,
                  transport_modes: ['METRO'],
                  alerts: [],
                },
              ],
              departures: [
                {
                  scheduled: '2026-03-01T14:49:48',
                  realtime: '2026-03-01T14:51:46',
                  delay: 118,
                  canceled: false,
                  route: {
                    name: 'Röda linjen',
                    designation: '13',
                    transport_mode: 'METRO',
                    transport_mode_code: 401,
                    direction: 'Ropsten',
                    origin: { id: '9139', name: 'Norsborg' },
                    destination: { id: '9863', name: 'Ropsten' },
                  },
                  trip: {
                    trip_id: '14010100702496794',
                    start_date: '2026-03-01',
                    technical_number: 26496,
                  },
                  agency: {
                    id: '505000000000000001',
                    name: 'AB Storstockholms Lokaltrafik',
                    operator: 'Connecting Stockholm',
                  },
                  stop: { id: '9825', name: 'T-Centralen', lat: 59.33166, lon: 18.061694 },
                  scheduled_platform: { id: '9022050009825001', designation: '3' },
                  realtime_platform: { id: '9022050009825001', designation: '3' },
                  alerts: [],
                  is_realtime: true,
                },
              ],
            },
          },
        },
      },
      '403': NO_KEY_RESPONSE,
    },
  },
};

/**
 * OpenAPI path-item for GET /trafiklab/arrivals/{areaId}.
 */
export const trafiklabArrivalsPath = {
  get: {
    tags: ['Trafiklab (requires key)'],
    summary: `${API_DESCRIPTIONS.trafiklab_get_arrivals.icon} ${API_DESCRIPTIONS.trafiklab_get_arrivals.summary}`,
    description: API_DESCRIPTIONS.trafiklab_get_arrivals.description,
    parameters: [
      {
        name: 'areaId',
        in: 'path',
        required: true,
        description: API_DESCRIPTIONS.trafiklab_get_arrivals.params.area_id,
        schema: { type: 'string' },
        example: '740020749',
      },
      {
        name: 'time',
        in: 'query',
        required: false,
        description: API_DESCRIPTIONS.trafiklab_get_arrivals.params.time,
        schema: { type: 'string' },
        example: '2026-02-28T12:00',
      },
    ],
    responses: {
      '200': {
        description: 'Arrivals response',
        content: {
          'application/json': {
            schema: { type: 'object' },
            example: {
              timestamp: '2026-03-01T14:51:39',
              query: { queryTime: '2026-03-01T14:51:00', query: '740020749' },
              stops: [
                {
                  id: '9825',
                  name: 'T-Centralen',
                  lat: 59.33166,
                  lon: 18.061694,
                  transport_modes: ['METRO'],
                  alerts: [],
                },
              ],
              arrivals: [
                {
                  scheduled: '2026-03-01T14:50:00',
                  realtime: '2026-03-01T14:51:18',
                  delay: 78,
                  canceled: false,
                  route: {
                    name: 'Gröna linjen',
                    designation: '17',
                    transport_mode: 'METRO',
                    transport_mode_code: 401,
                    direction: 'Skarpnäck',
                    origin: { id: '12256', name: 'Åkeshov' },
                    destination: { id: '12346', name: 'Skarpnäck' },
                  },
                  trip: {
                    trip_id: '14010000702402856',
                    start_date: '2026-03-01',
                    technical_number: 10522,
                  },
                  agency: {
                    id: '505000000000000001',
                    name: 'AB Storstockholms Lokaltrafik',
                    operator: 'Connecting Stockholm',
                  },
                  stop: { id: '9825', name: 'T-Centralen', lat: 59.33166, lon: 18.061694 },
                  scheduled_platform: { id: '9022050009825002', designation: '4' },
                  realtime_platform: { id: '9022050009825002', designation: '4' },
                  alerts: [],
                  is_realtime: true,
                },
              ],
            },
          },
        },
      },
      '403': NO_KEY_RESPONSE,
    },
  },
};
