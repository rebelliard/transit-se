import type {
  SLDeparturesResponse,
  SLLinesResponse,
  SLSite,
  SLStopPointFull,
  SLTransportAuthority,
} from '../../types/sl/transport';

/**
 * Fixture: SL sites (from /sites)
 *
 * Source: GET https://transport.integration.sl.se/v1/sites
 */
export const slSitesResponse: Array<SLSite> = [
  {
    id: 9001,
    gid: 9091001000009001,
    name: 'T-Centralen',
    alias: ['Tcentralen'],
    abbreviation: 'TCE',
    lat: 59.3313754153065,
    lon: 18.0604334292973,
    valid: { from: '2018-11-23T00:00:00' },
  },
  {
    id: 9192,
    gid: 9091001000009192,
    name: 'Slussen',
    abbreviation: 'SLU',
    lat: 59.3203176773338,
    lon: 18.0724531524889,
    valid: { from: '2023-10-07T00:00:00' },
  },
];

/**
 * Fixture: SL sites with expand=true (from /sites?expand=true)
 *
 * Source: GET https://transport.integration.sl.se/v1/sites?expand=true
 */
export const slSitesExpandedResponse: Array<SLSite> = [
  {
    id: 9001,
    gid: 9091001000009001,
    name: 'T-Centralen',
    alias: ['Tcentralen'],
    abbreviation: 'TCE',
    lat: 59.3313754153065,
    lon: 18.0604334292973,
    stop_areas: [1051, 5011, 5901, 10291, 80055, 10910, 4301, 5300, 5310],
    valid: { from: '2018-11-23T00:00:00' },
  },
];

/**
 * Fixture: SL departures from T-Centralen (from /sites/9001/departures)
 *
 * Source: GET https://transport.integration.sl.se/v1/sites/9001/departures
 * Trimmed to 2 representative departures (metro blue line + bus).
 */
export const slDeparturesResponse: SLDeparturesResponse = {
  departures: [
    {
      destination: 'Kungsträdgården',
      direction_code: 2,
      direction: 'Kungsträdgården',
      state: 'EXPECTED',
      scheduled: '2026-03-01T14:34:00',
      expected: '2026-03-01T14:36:41',
      display: '3 min',
      journey: {
        id: 2026030136046,
        state: 'NORMALPROGRESS',
        prediction_state: 'NORMAL',
      },
      stop_area: {
        id: 1051,
        name: 'T-Centralen',
        type: 'METROSTN',
      },
      stop_point: {
        id: 3052,
        name: 'T-Centralen',
        designation: '6',
      },
      line: {
        id: 11,
        designation: '11',
        transport_authority_id: 1,
        transport_mode: 'METRO',
        group_of_lines: 'Tunnelbanans blå linje',
      },
      deviations: [],
    },
    {
      destination: 'Djurgårdsbrunn',
      direction_code: 1,
      direction: 'Djurgårdsbrunn',
      state: 'EXPECTED',
      display: 'Nu',
      scheduled: '2026-03-01T14:36:31',
      expected: '2026-03-01T14:36:31',
      journey: {
        id: 2026030104926,
        state: 'ATORIGIN',
        prediction_state: 'NORMAL',
      },
      stop_area: {
        id: 10291,
        name: 'T-Centralen',
        type: 'BUSTERM',
      },
      stop_point: {
        id: 10291,
        name: 'T-Centralen',
        designation: 'N',
      },
      line: {
        id: 69,
        designation: '69',
        transport_authority_id: 1,
        transport_mode: 'BUS',
      },
      deviations: [],
    },
  ],
  stop_deviations: [],
};

/**
 * Fixture: SL departures with deviations
 *
 * Source: derived from real data — departure-level and stop-level deviations
 * observed on the Pendeltåg and blue metro lines at T-Centralen / Stockholm City.
 */
export const slDeparturesWithDeviationsResponse: SLDeparturesResponse = {
  departures: [
    {
      destination: 'Uppsala C',
      direction_code: 2,
      direction: 'Uppsala',
      state: 'ATSTOP',
      display: 'Nu',
      scheduled: '2026-03-01T14:38:00',
      expected: '2026-03-01T14:38:00',
      journey: {
        id: 2026030102242,
        state: 'NORMALPROGRESS',
        prediction_state: 'NORMAL',
      },
      stop_area: {
        id: 5310,
        name: 'Stockholm City',
        type: 'RAILWSTN',
      },
      stop_point: {
        id: 5312,
        name: 'Stockholm City',
        designation: '2',
      },
      line: {
        id: 40,
        designation: '40',
        transport_authority_id: 1,
        transport_mode: 'TRAIN',
        group_of_lines: 'Pendeltåg',
      },
      deviations: [
        {
          importance_level: 2,
          consequence: 'INFORMATION',
          message:
            'Stockholm City: Hissen mellan norra mellanplanet och mötesplats Vasagatan är avstängd på grund av tekniskt fel.',
        },
      ],
    },
  ],
  stop_deviations: [
    {
      id: 10449348,
      importance_level: 2,
      message: 'Korta tåg. Gå mot mitten av plattformen.',
      scope: {
        stop_areas: [
          { id: 3031, name: 'Kungsträdgården', type: 'METROSTN' },
          { id: 3131, name: 'Rådhuset', type: 'METROSTN' },
        ],
        stop_points: [
          { id: 3051, name: 'T-Centralen', designation: '5' },
          { id: 3052, name: 'T-Centralen', designation: '6' },
        ],
        lines: [
          {
            id: 10,
            designation: '10',
            transport_authority_id: 1,
            transport_mode: 'METRO',
            group_of_lines: 'Tunnelbanans blå linje',
          },
          {
            id: 11,
            designation: '11',
            transport_authority_id: 1,
            transport_mode: 'METRO',
            group_of_lines: 'Tunnelbanans blå linje',
          },
        ],
      },
    },
  ],
};

/**
 * Fixture: SL lines grouped by transport mode (from /lines)
 *
 * Source: GET https://transport.integration.sl.se/v1/lines?transport_authority_id=1
 * Trimmed to one representative line per mode.
 */
export const slLinesResponse: SLLinesResponse = {
  metro: [
    {
      id: 19,
      gid: 9011001001900000,
      name: 'Gröna linjen',
      designation: '19',
      transport_mode: 'METRO',
      group_of_lines: 'Tunnelbanans gröna linje',
      transport_authority: { id: 1, name: 'Storstockholms Lokaltrafik' },
      contractor: { id: 27, name: 'Connecting Stockholm' },
      valid: { from: '2007-08-24T00:00:00' },
    },
  ],
  tram: [],
  train: [
    {
      id: 40,
      gid: 9011001004000000,
      name: '',
      designation: '40',
      transport_mode: 'TRAIN',
      group_of_lines: 'Pendeltåg',
      transport_authority: { id: 1, name: 'Storstockholms Lokaltrafik' },
      contractor: { id: 65, name: 'SJ Stockholmståg' },
      valid: { from: '2017-08-23T00:00:00' },
    },
  ],
  bus: [
    {
      id: 1,
      gid: 9011001000100000,
      name: '',
      designation: '1',
      transport_mode: 'BUS',
      group_of_lines: 'Blåbuss',
      transport_authority: { id: 1, name: 'Storstockholms Lokaltrafik' },
      contractor: { id: 10, name: 'Keolis' },
      valid: { from: '2007-08-24T00:00:00' },
    },
  ],
  ship: [],
  ferry: [],
  taxi: [],
};

/**
 * Fixture: SL stop point (from /stop-points)
 *
 * Source: GET https://transport.integration.sl.se/v1/stop-points
 * Filtered to T-Centralen platform 3 (blue line metro).
 */
export const slStopPointsResponse: Array<SLStopPointFull> = [
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
    transport_authority: { id: 1, name: 'Storstockholms Lokaltrafik' },
    stop_area: {
      id: 1051,
      name: 'T-Centralen',
      type: 'METROSTN',
    },
    valid: { from: '2024-07-11T00:00:00' },
  },
];

/**
 * Fixture: SL transport authorities (from /transport-authorities)
 *
 * Source: GET https://transport.integration.sl.se/v1/transport-authorities
 */
export const slTransportAuthoritiesResponse: Array<SLTransportAuthority> = [
  {
    id: 1,
    gid: 9010001000000000,
    name: 'Storstockholms Lokaltrafik',
    formal_name: 'AB Storstockholms Lokaltrafik',
    code: 'SL',
    street: 'Lindhagensgatan 100',
    postal_code: 10573,
    city: 'Stockholm',
    country: 'Sweden',
    valid: { from: '2007-08-23T00:00:00' },
  },
];
