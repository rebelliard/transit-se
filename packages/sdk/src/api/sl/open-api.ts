import { API_DESCRIPTIONS } from '../../utils/get-api-description';

/**
 * OpenAPI path-item for GET /sl/sites.
 */
export const slSitesPath = {
  get: {
    tags: ['SL (no key required)'],
    summary: `${API_DESCRIPTIONS.sl_sites.icon} ${API_DESCRIPTIONS.sl_sites.summary}`,
    description: API_DESCRIPTIONS.sl_sites.description,
    parameters: [
      {
        name: 'query',
        in: 'query',
        required: false,
        description: API_DESCRIPTIONS.sl_sites.params.query,
        schema: { type: 'string' },
        example: 'Slussen',
      },
    ],
    responses: {
      '200': {
        description: 'Array of matching SL site entries',
        content: {
          'application/json': {
            schema: { type: 'array', items: { type: 'object' } },
            example: [
              { id: 9192, name: 'Slussen', lat: 59.320318, lon: 18.072453 },
              { id: 9194, name: 'Slussen/Stadsgården', lat: 59.319796, lon: 18.074742 },
            ],
          },
        },
      },
    },
  },
};

/**
 * OpenAPI path-item for GET /sl/departures/{siteId}.
 */
export const slDeparturesPath = {
  get: {
    tags: ['SL (no key required)'],
    summary: `${API_DESCRIPTIONS.sl_departures.icon} ${API_DESCRIPTIONS.sl_departures.summary}`,
    description: API_DESCRIPTIONS.sl_departures.description,
    parameters: [
      {
        name: 'siteId',
        in: 'path',
        required: true,
        description: API_DESCRIPTIONS.sl_departures.params.site_id,
        schema: { type: 'string' },
        example: '9192',
      },
    ],
    responses: {
      '200': {
        description: 'Departures response with stop deviations',
        content: {
          'application/json': {
            schema: { type: 'object' },
            example: {
              departures: [
                {
                  destination: 'Fruängen',
                  direction_code: 2,
                  display: '3 min',
                  state: 'EXPECTED',
                  scheduled: '2026-02-28T12:03:00',
                  expected: '2026-02-28T12:04:30',
                  line: {
                    id: 19,
                    designation: '19',
                    transport_mode: 'METRO',
                    group_of_lines: 'Gröna linjen',
                  },
                  stop_area: { id: 1011, name: 'Slussen' },
                },
              ],
              stop_deviations: [],
            },
          },
        },
      },
    },
  },
};

/**
 * OpenAPI path-item for GET /sl/deviations.
 */
export const slDeviationsPath = {
  get: {
    tags: ['SL (no key required)'],
    summary: `${API_DESCRIPTIONS.sl_deviations.icon} ${API_DESCRIPTIONS.sl_deviations.summary}`,
    description: API_DESCRIPTIONS.sl_deviations.description,
    parameters: [
      {
        name: 'transport_modes',
        in: 'query',
        required: false,
        description: API_DESCRIPTIONS.sl_deviations.params.transport_modes,
        schema: { type: 'string' },
        example: 'METRO,BUS',
      },
      {
        name: 'line_ids',
        in: 'query',
        required: false,
        description: API_DESCRIPTIONS.sl_deviations.params.line_ids,
        schema: { type: 'string' },
        example: '13,14',
      },
      {
        name: 'site_ids',
        in: 'query',
        required: false,
        description: API_DESCRIPTIONS.sl_deviations.params.site_ids,
        schema: { type: 'string' },
        example: '9192',
      },
      {
        name: 'future',
        in: 'query',
        required: false,
        description: API_DESCRIPTIONS.sl_deviations.params.future,
        schema: { type: 'boolean' },
      },
    ],
    responses: {
      '200': {
        description: 'Array of deviation messages',
        content: {
          'application/json': {
            schema: { type: 'array', items: { type: 'object' } },
            example: [
              {
                deviation_case_id: 12345,
                publish: { from: '2026-02-01T00:00:00', upto: '2026-03-31T23:59:59' },
                priority: { importance_level: 5, influence_level: 3, urgency_level: 2 },
                message_variants: [
                  {
                    header: 'Indragen hållplats',
                    details: 'Buss linje 66 stannar inte vid Renstiernas gata pga vägarbete.',
                    scope_alias: 'Buss 66',
                    language: 'sv',
                  },
                ],
                scope: {
                  lines: [{ id: 66, designation: '66', transport_mode: 'BUS', name: '66' }],
                  stop_areas: [{ id: 1511, name: 'Renstiernas gata' }],
                },
              },
            ],
          },
        },
      },
    },
  },
};
