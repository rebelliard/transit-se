import type {
  TrafiklabArrivalsResponse,
  TrafiklabDeparturesResponse,
} from '../../types/trafiklab/timetables';

/**
 * Real fixture: metro departures from T-Centralen (740020749) (from live API 2026-03-01)
 */
export const departuresResponse: TrafiklabDeparturesResponse = {
  timestamp: '2026-03-01T14:51:18',
  query: {
    queryTime: '2026-03-01T14:51:00',
    query: '740020749',
  },
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
        transport_mode_code: 401,
        transport_mode: 'METRO',
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
      stop: {
        id: '9825',
        name: 'T-Centralen',
        lat: 59.33166,
        lon: 18.061694,
      },
      scheduled_platform: { id: '9022050009825001', designation: '3' },
      realtime_platform: { id: '9022050009825001', designation: '3' },
      alerts: [],
      is_realtime: true,
    },
    {
      scheduled: '2026-03-01T14:50:42',
      realtime: '2026-03-01T14:52:28',
      delay: 106,
      canceled: false,
      route: {
        name: 'Gröna linjen',
        designation: '17',
        transport_mode_code: 401,
        transport_mode: 'METRO',
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
      stop: {
        id: '9825',
        name: 'T-Centralen',
        lat: 59.33166,
        lon: 18.061694,
      },
      scheduled_platform: { id: '9022050009825002', designation: '4' },
      realtime_platform: { id: '9022050009825002', designation: '4' },
      alerts: [],
      is_realtime: true,
    },
  ],
};

/**
 * Real fixture: train departures from Stockholm Central (740000001).
 * Demonstrates `route.name: null` and `realtime_platform: null`.
 * (from live API 2026-03-01)
 */
export const departuresCanceledResponse: TrafiklabDeparturesResponse = {
  timestamp: '2026-03-01T14:50:59',
  query: {
    queryTime: '2026-03-01T14:50:00',
    query: '740000001',
  },
  stops: [
    {
      id: '1',
      name: 'Stockholm Centralstation',
      lat: 59.331537,
      lon: 18.054943,
      transport_modes: ['BUS', 'TRAIN'],
      alerts: [
        {
          type: 'MAINTENANCE',
          title: 'Service disruption',
          text: 'Reduced service due to maintenance',
        },
      ],
    },
  ],
  departures: [
    {
      scheduled: '2026-03-01T15:00:00',
      realtime: '2026-03-01T15:00:00',
      delay: 0,
      canceled: true,
      route: {
        name: null,
        designation: '3943',
        transport_mode_code: 100,
        transport_mode: 'TRAIN',
        direction: 'Malmö Centralstation',
        origin: { id: '1', name: 'Stockholm Centralstation' },
        destination: { id: '3', name: 'Malmö Centralstation' },
      },
      trip: {
        trip_id: '783943003943000001',
        start_date: '2026-03-01',
        technical_number: 3943,
      },
      agency: {
        id: '505000000000000128',
        name: 'Snälltåget',
        operator: 'Snälltåget',
      },
      stop: {
        id: '1',
        name: 'Stockholm Centralstation',
        lat: 59.331537,
        lon: 18.054943,
      },
      scheduled_platform: null,
      realtime_platform: null,
      alerts: [
        {
          type: 'INFORMATION',
          title: 'Trip canceled',
          text: 'This departure has been canceled',
        },
      ],
      is_realtime: true,
    },
  ],
};

/**
 * Real fixture: metro arrivals at T-Centralen (740020749) (from live API 2026-03-01)
 */
export const arrivalsResponse: TrafiklabArrivalsResponse = {
  timestamp: '2026-03-01T14:51:39',
  query: {
    queryTime: '2026-03-01T14:51:00',
    query: '740020749',
  },
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
        transport_mode_code: 401,
        transport_mode: 'METRO',
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
      stop: {
        id: '9825',
        name: 'T-Centralen',
        lat: 59.33166,
        lon: 18.061694,
      },
      scheduled_platform: { id: '9022050009825002', designation: '4' },
      realtime_platform: { id: '9022050009825002', designation: '4' },
      alerts: [],
      is_realtime: true,
    },
    {
      scheduled: '2026-03-01T14:52:00',
      realtime: '2026-03-01T14:52:00',
      delay: 0,
      canceled: false,
      route: {
        name: 'Blå linjen',
        designation: '10',
        transport_mode_code: 401,
        transport_mode: 'METRO',
        direction: 'Hjulsta',
        origin: { id: '12056', name: 'Kungsträdgården' },
        destination: { id: '12408', name: 'Hjulsta' },
      },
      trip: {
        trip_id: '14010200702563103',
        start_date: '2026-03-01',
        technical_number: 36270,
      },
      agency: {
        id: '505000000000000001',
        name: 'AB Storstockholms Lokaltrafik',
        operator: 'Connecting Stockholm',
      },
      stop: {
        id: '9825',
        name: 'T-Centralen',
        lat: 59.33166,
        lon: 18.061694,
      },
      scheduled_platform: { id: '9022050009825005', designation: '5' },
      realtime_platform: { id: '9022050009825005', designation: '5' },
      alerts: [],
      is_realtime: true,
    },
  ],
};
