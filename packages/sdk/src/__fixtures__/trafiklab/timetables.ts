import type {
  TrafiklabArrivalsResponse,
  TrafiklabDeparturesResponse,
} from '../../types/trafiklab/timetables';

/**
 * Realistic fixture: departures from T-Centralen
 */
export const departuresResponse: TrafiklabDeparturesResponse = {
  timestamp: '2025-04-01T14:30:00',
  query: {
    queryTime: '2025-04-01T14:30:00',
    query: '740000001',
  },
  stops: [
    {
      id: '740000001-A',
      name: 'T-Centralen (tunnelbana)',
      lat: 59.3313,
      lon: 18.0597,
      transport_modes: ['METRO'],
      alerts: [],
    },
  ],
  departures: [
    {
      scheduled: '2025-04-01T14:32:00+02:00',
      realtime: '2025-04-01T14:33:30+02:00',
      delay: 90,
      canceled: false,
      route: {
        name: 'Gröna linjen',
        designation: '19',
        transport_mode: 'METRO',
        transport_mode_code: 401,
        direction: 'Hagsätra',
        origin: { id: '740000025', name: 'Hässelby strand' },
        destination: { id: '740000252', name: 'Hagsätra' },
      },
      trip: {
        trip_id: 'trip-12345',
        start_date: '2025-04-01',
        technical_number: 42,
      },
      stop: {
        id: '740000001-A',
        name: 'T-Centralen (tunnelbana)',
        lat: 59.3313,
        lon: 18.0597,
        transport_modes: ['METRO'],
        alerts: [],
      },
      scheduled_platform: { id: 'plat-1', designation: '1' },
      realtime_platform: { id: 'plat-1', designation: '1' },
      alerts: [],
      is_realtime: true,
    },
    {
      scheduled: '2025-04-01T14:35:00+02:00',
      realtime: '2025-04-01T14:35:00+02:00',
      delay: 0,
      canceled: false,
      route: {
        name: 'Röda linjen',
        designation: '14',
        transport_mode: 'METRO',
        transport_mode_code: 401,
        direction: 'Mörby centrum',
        origin: { id: '740000044', name: 'Fruängen' },
        destination: { id: '740000033', name: 'Mörby centrum' },
      },
      trip: {
        trip_id: 'trip-67890',
        start_date: '2025-04-01',
        technical_number: 88,
      },
      stop: {
        id: '740000001-A',
        name: 'T-Centralen (tunnelbana)',
        lat: 59.3313,
        lon: 18.0597,
        transport_modes: ['METRO'],
        alerts: [],
      },
      scheduled_platform: { id: 'plat-2', designation: '2' },
      realtime_platform: null,
      alerts: [],
      is_realtime: false,
    },
  ],
};

/**
 * Realistic fixture: canceled departure
 */
export const departuresCanceledResponse: TrafiklabDeparturesResponse = {
  timestamp: '2025-04-01T15:00:00',
  query: {
    queryTime: '2025-04-01T15:00:00',
    query: '740000001',
  },
  stops: [
    {
      id: '740000001-A',
      name: 'T-Centralen',
      lat: 59.3313,
      lon: 18.0597,
      transport_modes: ['METRO'],
      alerts: [
        {
          id: 'alert-1',
          header: 'Service disruption',
          details: 'Reduced service on green line due to signal failure',
          severity: 'WARNING',
        },
      ],
    },
  ],
  departures: [
    {
      scheduled: '2025-04-01T15:05:00+02:00',
      realtime: '2025-04-01T15:05:00+02:00',
      delay: 0,
      canceled: true,
      route: {
        name: 'Gröna linjen',
        designation: '19',
        transport_mode: 'METRO',
        transport_mode_code: 401,
        direction: 'Hagsätra',
        origin: { id: '740000025', name: 'Hässelby strand' },
        destination: { id: '740000252', name: 'Hagsätra' },
      },
      trip: {
        trip_id: 'trip-99999',
        start_date: '2025-04-01',
        technical_number: 55,
      },
      stop: {
        id: '740000001-A',
        name: 'T-Centralen',
        lat: 59.3313,
        lon: 18.0597,
        transport_modes: ['METRO'],
        alerts: [],
      },
      scheduled_platform: { id: 'plat-1', designation: '1' },
      realtime_platform: null,
      alerts: [
        {
          id: 'alert-2',
          header: 'Trip canceled',
          details: 'This departure has been canceled',
        },
      ],
      is_realtime: true,
    },
  ],
};

/**
 * Realistic fixture: arrivals at T-Centralen
 */
export const arrivalsResponse: TrafiklabArrivalsResponse = {
  timestamp: '2025-04-01T14:30:00',
  query: {
    queryTime: '2025-04-01T14:30:00',
    query: '740000001',
  },
  stops: [
    {
      id: '740000001-A',
      name: 'T-Centralen (tunnelbana)',
      lat: 59.3313,
      lon: 18.0597,
      transport_modes: ['METRO'],
      alerts: [],
    },
  ],
  arrivals: [
    {
      scheduled: '2025-04-01T14:31:00+02:00',
      realtime: '2025-04-01T14:31:00+02:00',
      delay: 0,
      canceled: false,
      route: {
        name: 'Röda linjen',
        designation: '13',
        transport_mode: 'METRO',
        transport_mode_code: 401,
        direction: 'Norsborg',
        origin: { id: '740000034', name: 'Ropsten' },
        destination: { id: '740000055', name: 'Norsborg' },
      },
      trip: {
        trip_id: 'trip-arrival-1',
        start_date: '2025-04-01',
        technical_number: 101,
      },
      stop: {
        id: '740000001-A',
        name: 'T-Centralen (tunnelbana)',
        lat: 59.3313,
        lon: 18.0597,
        transport_modes: ['METRO'],
        alerts: [],
      },
      scheduled_platform: { id: 'plat-3', designation: '3' },
      realtime_platform: { id: 'plat-3', designation: '3' },
      alerts: [],
      is_realtime: true,
    },
  ],
};
