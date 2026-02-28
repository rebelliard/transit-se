import type { TrafiklabStopLookupResponse } from '../../types/trafiklab/stop-lookup';

/**
 * Realistic fixture: searching for "T-Centralen"
 */
export const stopLookupSearchResponse: TrafiklabStopLookupResponse = {
  timestamp: '2025-04-01T14:22:43',
  query: {
    queryTime: '2025-04-01T14:22:00',
    query: 'T-Centralen',
  },
  stop_groups: [
    {
      id: '740000001',
      name: 'T-Centralen',
      area_type: 'META_STOP',
      average_daily_stop_times: 1250.5,
      transport_modes: ['METRO', 'BUS', 'TRAIN'],
      stops: [
        { id: '740000001-A', name: 'T-Centralen (tunnelbana)', lat: 59.3313, lon: 18.0597 },
        { id: '740000001-B', name: 'T-Centralen (bussar)', lat: 59.3315, lon: 18.0601 },
      ],
    },
    {
      id: '740000002',
      name: 'Stockholm Central',
      area_type: 'RIKSHALLPLATS',
      average_daily_stop_times: 980.2,
      transport_modes: ['TRAIN'],
      stops: [{ id: '740000002-A', name: 'Stockholm Central', lat: 59.3309, lon: 18.0585 }],
    },
  ],
};

/**
 * Realistic fixture: listing all stops (abbreviated)
 */
export const stopLookupListResponse: TrafiklabStopLookupResponse = {
  timestamp: '2025-04-01T14:25:00',
  query: {
    queryTime: '2025-04-01T14:25:00',
    query: null,
  },
  stop_groups: [
    {
      id: '740000001',
      name: 'T-Centralen',
      area_type: 'META_STOP',
      average_daily_stop_times: 1250.5,
      transport_modes: ['METRO', 'BUS', 'TRAIN'],
      stops: [{ id: '740000001-A', name: 'T-Centralen (tunnelbana)', lat: 59.3313, lon: 18.0597 }],
    },
    {
      id: '740020076',
      name: 'Slussen',
      area_type: 'META_STOP',
      average_daily_stop_times: 890.3,
      transport_modes: ['METRO', 'BUS', 'BOAT'],
      stops: [{ id: '740020076-A', name: 'Slussen (tunnelbana)', lat: 59.3198, lon: 18.0723 }],
    },
  ],
};
