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
              query: { query: 'T-Centralen' },
              timestamp: '2026-02-28T12:00:00Z',
              stop_groups: [
                {
                  name: 'T-Centralen',
                  area_type: 'META_STOP',
                  average_daily_stop_times: 1850,
                  transport_modes: ['METRO', 'BUS'],
                  stops: [
                    {
                      id: '740020749',
                      name: 'T-Centralen (tunnelbana)',
                      lat: 59.3313,
                      lon: 18.0597,
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
              departures: [
                {
                  direction: 1,
                  line: { id: 14, name: 'Röda linjen', transport_mode: 'METRO' },
                  stop: { id: '740020749', name: 'T-Centralen', lat: 59.3313, lon: 18.0597 },
                  scheduled_departure: '2026-02-28T12:05:00',
                  expected_departure: '2026-02-28T12:06:30',
                  state: 'EXPECTED',
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
              arrivals: [
                {
                  direction: 2,
                  line: { id: 14, name: 'Röda linjen', transport_mode: 'METRO' },
                  stop: { id: '740020749', name: 'T-Centralen', lat: 59.3313, lon: 18.0597 },
                  scheduled_arrival: '2026-02-28T12:08:00',
                  expected_arrival: '2026-02-28T12:08:00',
                  state: 'EXPECTED',
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
