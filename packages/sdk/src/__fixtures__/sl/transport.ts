import type {
  SLDeparturesResponse,
  SLLinesResponse,
  SLSite,
  SLStopPointFull,
  SLTransportAuthority,
} from '../../types/sl/transport';

/**
 * Realistic fixture: SL sites
 */
export const slSitesResponse: Array<SLSite> = [
  {
    id: 9001,
    gid: 9600009001,
    name: 'T-Centralen',
    abbreviation: 'TCE',
    lat: 59.331264,
    lon: 18.059547,
    valid: { from: '2024-01-01' },
  },
  {
    id: 9192,
    gid: 9600009192,
    name: 'Slussen',
    abbreviation: 'SLU',
    lat: 59.319783,
    lon: 18.072345,
    valid: { from: '2024-01-01' },
  },
];

/**
 * Realistic fixture: SL sites with expand=true
 */
export const slSitesExpandedResponse: Array<SLSite> = [
  {
    id: 9001,
    gid: 9600009001,
    name: 'T-Centralen',
    abbreviation: 'TCE',
    lat: 59.331264,
    lon: 18.059547,
    stop_areas: [10001, 10002, 10003],
    valid: { from: '2024-01-01' },
  },
];

/**
 * Realistic fixture: SL departures from T-Centralen
 */
export const slDeparturesResponse: SLDeparturesResponse = {
  departures: [
    {
      direction: 'Hässelby strand',
      direction_code: 1,
      via: '',
      destination: 'Hässelby strand',
      state: 'EXPECTED',
      scheduled: '2025-04-01T14:32:00',
      expected: '2025-04-01T14:33:00',
      display: '1 min',
      journey: {
        id: 50001,
        state: 'NORMALPROGRESS',
        prediction_state: 'NORMAL',
        passenger_level: 'LOW',
      },
      stop_area: {
        id: 10001,
        name: 'T-Centralen',
        sname: 'TCE',
        type: 'METROSTN',
      },
      stop_point: {
        id: 20001,
        name: 'T-Centralen',
        designation: '1',
      },
      line: {
        id: 19,
        designation: '19',
        transport_mode: 'metro',
        group_of_lines: 'Tunnelbanans gröna linje',
      },
      deviations: [],
    },
    {
      direction: 'Mörby centrum',
      direction_code: 2,
      via: '',
      destination: 'Mörby centrum',
      state: 'EXPECTED',
      scheduled: '2025-04-01T14:35:00',
      expected: '2025-04-01T14:35:00',
      display: '4 min',
      journey: {
        id: 50002,
        state: 'NORMALPROGRESS',
        prediction_state: 'NORMAL',
        passenger_level: 'MEDIUM',
      },
      stop_area: {
        id: 10002,
        name: 'T-Centralen',
        sname: 'TCE',
        type: 'METROSTN',
      },
      stop_point: {
        id: 20002,
        name: 'T-Centralen',
        designation: '2',
      },
      line: {
        id: 14,
        designation: '14',
        transport_mode: 'metro',
        group_of_lines: 'Tunnelbanans röda linje',
      },
      deviations: [],
    },
  ],
  stop_deviations: [],
};

/**
 * Realistic fixture: SL departures with deviations
 */
export const slDeparturesWithDeviationsResponse: SLDeparturesResponse = {
  departures: [
    {
      direction: 'Hagsätra',
      direction_code: 1,
      via: '',
      destination: 'Hagsätra',
      state: 'NOTEXPECTED',
      scheduled: '2025-04-01T15:10:00',
      expected: '2025-04-01T15:10:00',
      display: '',
      journey: {
        id: 50003,
        state: 'CANCELLED',
        prediction_state: 'UNKNOWN',
        passenger_level: 'UNKNOWN',
      },
      stop_area: {
        id: 10001,
        name: 'T-Centralen',
        sname: 'TCE',
        type: 'METROSTN',
      },
      stop_point: {
        id: 20001,
        name: 'T-Centralen',
        designation: '1',
      },
      line: {
        id: 19,
        designation: '19',
        transport_mode: 'metro',
        group_of_lines: 'Tunnelbanans gröna linje',
      },
      deviations: [
        {
          importance: 5,
          consequence: 'CANCELLED',
          message: 'Signal failure between Gamla stan and Slussen. Expect delays.',
        },
      ],
    },
  ],
  stop_deviations: [
    {
      importance: 8,
      consequence: 'INFORMATION',
      message: 'Reduced service on green line due to technical issues.',
    },
  ],
};

/**
 * Realistic fixture: SL lines grouped by transport mode
 */
export const slLinesResponse: SLLinesResponse = {
  metro: [
    {
      id: 19,
      gid: 9011001001900000,
      name: 'Tunnelbanans gröna linje 19',
      designation: '19',
      transport_mode: 'metro',
      group_of_lines: 'Tunnelbanans gröna linje',
      transport_authority: { id: 1, name: 'SL' },
      contractor: { id: 1, name: 'MTR Tunnelbanan' },
      valid: { from: '2024-01-01' },
    },
  ],
  tram: [],
  train: [
    {
      id: 40,
      gid: 9011001004000000,
      name: 'Pendeltåg 40',
      designation: '40',
      transport_mode: 'train',
      group_of_lines: 'Pendeltåg',
      transport_authority: { id: 1, name: 'SL' },
      contractor: { id: 2, name: 'SJ' },
      valid: { from: '2024-01-01' },
    },
  ],
  bus: [
    {
      id: 1,
      gid: 9011001000100000,
      name: 'Blåbuss 1',
      designation: '1',
      transport_mode: 'bus',
      group_of_lines: 'Blåbussar',
      transport_authority: { id: 1, name: 'SL' },
      contractor: { id: 3, name: 'Keolis' },
      valid: { from: '2024-01-01' },
    },
  ],
  ship: [],
  ferry: [],
  taxi: [],
};

/**
 * Realistic fixture: SL stop points
 */
export const slStopPointsResponse: Array<SLStopPointFull> = [
  {
    id: 20001,
    gid: 9022001000010001,
    pattern_point_gid: 9025001000010001,
    name: 'T-Centralen',
    sname: 'TCE',
    designation: '1',
    local_num: 1,
    type: 'METROSTN',
    has_entrance: true,
    lat: 59.331264,
    lon: 18.059547,
    door_orientation: 90,
    transport_authority: { id: 1, name: 'SL' },
    stop_area: {
      id: 10001,
      name: 'T-Centralen',
      sname: 'TCE',
      type: 'METROSTN',
    },
    valid: { from: '2024-01-01' },
  },
];

/**
 * Realistic fixture: SL transport authorities
 */
export const slTransportAuthoritiesResponse: Array<SLTransportAuthority> = [
  {
    id: 1,
    gid: 9010001000000000,
    name: 'SL',
    formal_name: 'AB Storstockholms Lokaltrafik',
    code: 'SL',
    street: 'Lindhagensgatan 100',
    postal_code: 10573,
    city: 'Stockholm',
    country: 'SE',
    valid: { from: '2024-01-01' },
  },
];
