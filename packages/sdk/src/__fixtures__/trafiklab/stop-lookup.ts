import type { TrafiklabStopLookupResponse } from '../../types/trafiklab/stop-lookup';

/**
 * Real fixture: searching for "T-Centralen" (from live API 2026-03-01)
 */
export const stopLookupSearchResponse: TrafiklabStopLookupResponse = {
  timestamp: '2026-03-01T14:50:58',
  query: {
    queryTime: '2026-03-01T14:50:58',
    query: 'T-Centralen',
  },
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
    {
      id: '740035997',
      name: 'T-Centralen Spårv',
      area_type: 'RIKSHALLPLATS',
      average_daily_stop_times: 465.18,
      transport_modes: ['BUS', 'TRAM'],
      stops: [
        {
          id: '12736',
          name: 'T-Centralen',
          lat: 59.332098,
          lon: 18.061943,
        },
        {
          id: '12275',
          name: 'T-Centralen',
          lat: 59.33212,
          lon: 18.062138,
        },
      ],
    },
  ],
};

/**
 * Real fixture: listing all stops — first 2 entries (from live API 2026-03-01)
 */
export const stopLookupListResponse: TrafiklabStopLookupResponse = {
  timestamp: '2026-03-01T14:51:21',
  query: {
    queryTime: '2026-03-01T14:51:21',
    query: null,
  },
  stop_groups: [
    {
      id: '740050707',
      name: 'Krigtjärnsvägen',
      area_type: 'RIKSHALLPLATS',
      average_daily_stop_times: 7.33,
      transport_modes: ['BUS'],
      stops: [
        {
          id: '70787',
          name: 'Krigtjärnsvägen',
          lat: 59.950485,
          lon: 14.938174,
        },
      ],
    },
    {
      id: '740049719',
      name: 'Tynninge',
      area_type: 'RIKSHALLPLATS',
      average_daily_stop_times: 19.07,
      transport_modes: ['BUS'],
      stops: [
        {
          id: '70164',
          name: 'Tynninge',
          lat: 59.084528,
          lon: 15.260689,
        },
      ],
    },
  ],
};
