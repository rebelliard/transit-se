import type { CombinedSLNearbyVehiclesResult } from '@transit-se/sdk/combined';
import type { GtfsServiceAlert, GtfsTripUpdate, GtfsVehiclePosition } from '@transit-se/sdk/gtfs';
import type { SLDeparturesResponse, SLDeviationMessage, SLSiteEntry } from '@transit-se/sdk/sl';
import type {
  TrafiklabArrivalsResponse,
  TrafiklabDeparturesResponse,
  TrafiklabStopLookupResponse,
} from '@transit-se/sdk/trafiklab';
import { describe, expect, it } from 'bun:test';
import {
  formatCombinedSLNearbyVehicles,
  formatGtfsServiceAlerts,
  formatGtfsTripUpdates,
  formatGtfsVehiclePositions,
  formatSLDepartures,
  formatSLDeviations,
  formatSLSites,
  formatTrafiklabArrivals,
  formatTrafiklabDepartures,
  formatTrafiklabStopLookup,
} from './formatting';

// ─── Fixtures ───────────────────────────────────────────────────────

const stopLookupResult: TrafiklabStopLookupResponse = {
  timestamp: '2025-04-01T14:22:43',
  query: { queryTime: '2025-04-01T14:22:00', query: 'T-Centralen' },
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
  ],
};

const departuresResult: TrafiklabDeparturesResponse = {
  timestamp: '2025-04-01T14:30:00',
  query: { queryTime: '2025-04-01T14:30:00', query: '740000001' },
  stops: [
    {
      id: '740000001-A',
      name: 'T-Centralen',
      lat: 59.3313,
      lon: 18.0597,
      transport_modes: ['METRO'],
      alerts: [
        {
          id: 'a1',
          header: 'Service disruption',
          details: 'Delays on green line',
          severity: 'WARNING',
        },
      ],
    },
  ],
  departures: [
    {
      scheduled: '2025-04-01T14:32:00+02:00',
      realtime: '2025-04-01T14:34:00+02:00',
      delay: 120,
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
      trip: { trip_id: 'trip-1', start_date: '2025-04-01', technical_number: 42 },
      stop: {
        id: '740000001-A',
        name: 'T-Centralen',
        lat: 59.3313,
        lon: 18.0597,
        transport_modes: ['METRO'],
        alerts: [],
      },
      scheduled_platform: { id: 'p1', designation: '1' },
      realtime_platform: { id: 'p1', designation: '1' },
      alerts: [],
      is_realtime: true,
    },
    {
      scheduled: '2025-04-01T14:35:00+02:00',
      realtime: '2025-04-01T14:35:00+02:00',
      delay: 0,
      canceled: true,
      route: {
        name: 'Röda linjen',
        designation: '14',
        transport_mode: 'METRO',
        transport_mode_code: 401,
        direction: 'Mörby centrum',
        origin: { id: '740000044', name: 'Fruängen' },
        destination: { id: '740000033', name: 'Mörby centrum' },
      },
      trip: { trip_id: 'trip-2', start_date: '2025-04-01', technical_number: 88 },
      stop: {
        id: '740000001-A',
        name: 'T-Centralen',
        lat: 59.3313,
        lon: 18.0597,
        transport_modes: ['METRO'],
        alerts: [],
      },
      scheduled_platform: { id: 'p2', designation: '2' },
      realtime_platform: null,
      alerts: [{ id: 'a2', header: 'Trip canceled', details: 'This trip is canceled' }],
      is_realtime: true,
    },
  ],
};

const arrivalsResult: TrafiklabArrivalsResponse = {
  timestamp: '2025-04-01T14:30:00',
  query: { queryTime: '2025-04-01T14:30:00', query: '740000001' },
  stops: [
    {
      id: '740000001-A',
      name: 'T-Centralen',
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
      trip: { trip_id: 'trip-a1', start_date: '2025-04-01', technical_number: 101 },
      stop: {
        id: '740000001-A',
        name: 'T-Centralen',
        lat: 59.3313,
        lon: 18.0597,
        transport_modes: ['METRO'],
        alerts: [],
      },
      scheduled_platform: { id: 'p3', designation: '3' },
      realtime_platform: { id: 'p3', designation: '3' },
      alerts: [],
      is_realtime: true,
    },
  ],
};

const slDeparturesResult: SLDeparturesResponse = {
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
      stop_area: { id: 10001, name: 'T-Centralen', sname: 'TCE', type: 'METROSTN' },
      stop_point: { id: 20001, name: 'T-Centralen', designation: '1' },
      line: {
        id: 19,
        designation: '19',
        transport_mode: 'metro',
        group_of_lines: 'Tunnelbanans gröna linje',
      },
      deviations: [],
    },
  ],
  stop_deviations: [],
};

const slDeparturesWithDeviations: SLDeparturesResponse = {
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
      stop_area: { id: 10001, name: 'T-Centralen', sname: 'TCE', type: 'METROSTN' },
      stop_point: { id: 20001, name: 'T-Centralen', designation: '1' },
      line: {
        id: 19,
        designation: '19',
        transport_mode: 'metro',
        group_of_lines: 'Tunnelbanans gröna linje',
      },
      deviations: [
        { importance: 5, consequence: 'CANCELLED', message: 'Signal failure at Slussen' },
      ],
    },
  ],
  stop_deviations: [
    { importance: 8, consequence: 'INFORMATION', message: 'Reduced service on green line' },
  ],
};

const slSites: Array<SLSiteEntry> = [
  { id: 9192, name: 'Slussen', lat: 59.3198, lon: 18.0723 },
  { id: 9001, name: 'T-Centralen', lat: 59.3313, lon: 18.0597 },
];

// ─── Tests ──────────────────────────────────────────────────────────

describe('formatTrafiklabStopLookup', () => {
  it('should format stop groups with names, IDs, and modes', () => {
    const text = formatTrafiklabStopLookup(stopLookupResult);
    expect(text).toContain('T-Centralen');
    expect(text).toContain('740000001');
    expect(text).toContain('METRO');
    expect(text).toContain('META_STOP');
    expect(text).toContain('1250.5');
  });

  it('should include child stops with coordinates', () => {
    const text = formatTrafiklabStopLookup(stopLookupResult);
    expect(text).toContain('T-Centralen (tunnelbana)');
    expect(text).toContain('740000001-A');
    expect(text).toContain('59.3313');
    expect(text).toContain('18.0597');
  });

  it('should handle empty results', () => {
    const empty: TrafiklabStopLookupResponse = {
      timestamp: '',
      query: { queryTime: '', query: 'nothing' },
      stop_groups: [],
    };
    expect(formatTrafiklabStopLookup(empty)).toBe('No stops found.');
  });

  it('should show result count', () => {
    const text = formatTrafiklabStopLookup(stopLookupResult);
    expect(text).toContain('Found 1 stop(s)');
  });
});

describe('formatTrafiklabDepartures', () => {
  it('should include stop name and result count', () => {
    const text = formatTrafiklabDepartures(departuresResult);
    expect(text).toContain('T-Centralen');
    expect(text).toContain('2 results');
  });

  it('should show line designation and direction', () => {
    const text = formatTrafiklabDepartures(departuresResult);
    expect(text).toContain('Line 19');
    expect(text).toContain('Hagsätra');
    expect(text).toContain('Line 14');
    expect(text).toContain('Mörby centrum');
  });

  it('should show delay information', () => {
    const text = formatTrafiklabDepartures(departuresResult);
    expect(text).toContain('+2 min late');
  });

  it('should mark canceled departures', () => {
    const text = formatTrafiklabDepartures(departuresResult);
    expect(text).toContain('[CANCELED]');
  });

  it('should show stop-level alerts', () => {
    const text = formatTrafiklabDepartures(departuresResult);
    expect(text).toContain('Service disruption');
    expect(text).toContain('Delays on green line');
  });

  it('should show departure-level alerts', () => {
    const text = formatTrafiklabDepartures(departuresResult);
    expect(text).toContain('Trip canceled');
  });

  it('should show platform info', () => {
    const text = formatTrafiklabDepartures(departuresResult);
    expect(text).toContain('Platform 1');
  });

  it('should mark non-realtime entries', () => {
    const text = formatTrafiklabDepartures({
      ...departuresResult,
      departures: [{ ...departuresResult.departures[0], is_realtime: false }],
    });
    expect(text).toContain('scheduled only');
  });

  it('should handle empty departures', () => {
    const empty: TrafiklabDeparturesResponse = {
      timestamp: '',
      query: { queryTime: '', query: '999' },
      stops: [],
      departures: [],
    };
    expect(formatTrafiklabDepartures(empty)).toContain('No departures found');
  });
});

describe('formatTrafiklabArrivals', () => {
  it('should include stop name and result count', () => {
    const text = formatTrafiklabArrivals(arrivalsResult);
    expect(text).toContain('T-Centralen');
    expect(text).toContain('1 results');
  });

  it('should show line and direction', () => {
    const text = formatTrafiklabArrivals(arrivalsResult);
    expect(text).toContain('Line 13');
    expect(text).toContain('Norsborg');
  });

  it('should handle empty arrivals', () => {
    const empty: TrafiklabArrivalsResponse = {
      timestamp: '',
      query: { queryTime: '', query: '999' },
      stops: [],
      arrivals: [],
    };
    expect(formatTrafiklabArrivals(empty)).toContain('No arrivals found');
  });
});

describe('formatSLDepartures', () => {
  it('should include stop name and result count', () => {
    const text = formatSLDepartures(slDeparturesResult, 9001);
    expect(text).toContain('T-Centralen');
    expect(text).toContain('1 results');
  });

  it('should show display time, line, and destination', () => {
    const text = formatSLDepartures(slDeparturesResult, 9001);
    expect(text).toContain('1 min');
    expect(text).toContain('19');
    expect(text).toContain('Hässelby strand');
  });

  it('should show transport mode in uppercase', () => {
    const text = formatSLDepartures(slDeparturesResult, 9001);
    expect(text).toContain('METRO');
  });

  it('should show platform designation', () => {
    const text = formatSLDepartures(slDeparturesResult, 9001);
    expect(text).toContain('Platform 1');
  });

  it('should show crowding level when known', () => {
    const text = formatSLDepartures(slDeparturesResult, 9001);
    expect(text).toContain('Crowding: LOW');
  });

  it('should hide crowding when UNKNOWN', () => {
    const text = formatSLDepartures(slDeparturesWithDeviations, 9001);
    expect(text).not.toContain('Crowding: UNKNOWN');
  });

  it('should show stop deviations', () => {
    const text = formatSLDepartures(slDeparturesWithDeviations, 9001);
    expect(text).toContain('Reduced service on green line');
  });

  it('should show departure-level disruptions', () => {
    const text = formatSLDepartures(slDeparturesWithDeviations, 9001);
    expect(text).toContain('Signal failure at Slussen');
  });

  it('should handle empty departures', () => {
    const empty: SLDeparturesResponse = { departures: [], stop_deviations: [] };
    expect(formatSLDepartures(empty, 9999)).toContain('No departures found');
  });
});

describe('formatSLSites', () => {
  it('should show site names with IDs and coordinates', () => {
    const text = formatSLSites(slSites);
    expect(text).toContain('Slussen');
    expect(text).toContain('9192');
    expect(text).toContain('59.3198');
    expect(text).toContain('T-Centralen');
    expect(text).toContain('9001');
  });

  it('should show total count', () => {
    const text = formatSLSites(slSites);
    expect(text).toContain('2 total');
  });

  it('should include search query in header when provided', () => {
    const text = formatSLSites(slSites, 'sluss');
    expect(text).toContain('matching "sluss"');
    expect(text).toContain('2 results');
  });

  it('should handle empty results with query', () => {
    expect(formatSLSites([], 'nonexistent')).toContain('No SL sites matching "nonexistent"');
  });

  it('should handle empty results without query', () => {
    expect(formatSLSites([])).toBe('No SL sites found.');
  });

  it('should cap output at 100 sites', () => {
    const manySites: Array<SLSiteEntry> = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      name: `Site ${i}`,
      lat: 59.0,
      lon: 18.0,
    }));
    const text = formatSLSites(manySites);
    expect(text).toContain('and 50 more');
    // Should not contain site 100+
    expect(text).not.toContain('Site 100');
  });
});

// ─── GTFS Service Alerts ────────────────────────────────────────────

const gtfsAlerts: Array<GtfsServiceAlert> = [
  {
    id: 'alert-1',
    cause: 'MAINTENANCE',
    effect: 'REDUCED_SERVICE',
    headerText: 'Reducerad trafik på linje 1',
    descriptionText: 'Linje 1 kör med reducerad turtäthet pga underhåll.',
    activePeriods: [{ start: 1709100000, end: 1709200000 }],
    informedEntities: [{ routeId: '1', stopId: '740000001' }],
  },
  {
    id: 'alert-2',
    cause: 'WEATHER',
    effect: 'SIGNIFICANT_DELAYS',
    headerText: 'Förseningar pga väderförhållanden',
    descriptionText: 'Förseningar upp till 20 minuter pga halt väglag.',
    url: 'https://ul.se/disruptions/123',
    activePeriods: [{ start: 1709150000 }],
    informedEntities: [{ agencyId: 'UL', routeId: '801' }],
  },
];

describe('formatGtfsServiceAlerts', () => {
  it('should show operator name and alert count', () => {
    const text = formatGtfsServiceAlerts(gtfsAlerts, 'ul');
    expect(text).toContain('UL (Uppsala)');
    expect(text).toContain('2');
  });

  it('should show alert header and effect', () => {
    const text = formatGtfsServiceAlerts(gtfsAlerts, 'ul');
    expect(text).toContain('Reducerad trafik på linje 1');
    expect(text).toContain('REDUCED_SERVICE');
  });

  it('should show description text', () => {
    const text = formatGtfsServiceAlerts(gtfsAlerts, 'ul');
    expect(text).toContain('Linje 1 kör med reducerad turtäthet pga underhåll.');
  });

  it('should show cause', () => {
    const text = formatGtfsServiceAlerts(gtfsAlerts, 'ul');
    expect(text).toContain('maintenance');
  });

  it('should show route and stop IDs', () => {
    const text = formatGtfsServiceAlerts(gtfsAlerts, 'ul');
    expect(text).toContain('Routes: 1');
    expect(text).toContain('Stops: 740000001');
  });

  it('should show URL when present', () => {
    const text = formatGtfsServiceAlerts(gtfsAlerts, 'ul');
    expect(text).toContain('https://ul.se/disruptions/123');
  });

  it('should show active period dates', () => {
    const text = formatGtfsServiceAlerts(gtfsAlerts, 'ul');
    expect(text).toContain('2024-02-28');
  });

  it('should show "ongoing" when no end date', () => {
    const text = formatGtfsServiceAlerts(gtfsAlerts, 'ul');
    expect(text).toContain('ongoing');
  });

  it('should use operator abbreviation when name unknown', () => {
    const text = formatGtfsServiceAlerts(gtfsAlerts, 'custom-op');
    expect(text).toContain('custom-op');
  });

  it('should handle empty alerts', () => {
    const text = formatGtfsServiceAlerts([], 'ul');
    expect(text).toContain('No active service alerts for UL (Uppsala)');
  });

  it('should handle empty alerts with unknown operator', () => {
    const text = formatGtfsServiceAlerts([], 'unknown');
    expect(text).toContain('No active service alerts for unknown');
  });
});

// ─── GTFS Trip Updates ──────────────────────────────────────────────

const gtfsTripUpdates: Array<GtfsTripUpdate> = [
  {
    id: 'tu-1',
    trip: {
      tripId: 'trip-abc-123',
      routeId: '801',
      directionId: 0,
      startTime: '08:30:00',
      startDate: '20240228',
      scheduleRelationship: 'SCHEDULED',
    },
    vehicle: { id: 'vehicle-42', label: 'Bus 801' },
    stopTimeUpdates: [
      {
        stopSequence: 1,
        stopId: '740000001',
        arrival: { delay: 120, time: 1709101200, uncertainty: 30 },
        departure: { delay: 150, time: 1709101350, uncertainty: 30 },
        scheduleRelationship: 'SCHEDULED',
      },
      {
        stopSequence: 2,
        stopId: '740000002',
        arrival: { delay: 180, time: 1709102400, uncertainty: 60 },
        departure: { delay: 180, time: 1709102580 },
        scheduleRelationship: 'SCHEDULED',
      },
    ],
    timestamp: 1709100900,
    delay: 120,
  },
  {
    id: 'tu-2',
    trip: {
      tripId: 'trip-def-456',
      routeId: '3',
      directionId: 1,
      startTime: '09:00:00',
      startDate: '20240228',
      scheduleRelationship: 'CANCELED',
    },
    stopTimeUpdates: [],
    timestamp: 1709100900,
  },
];

const gtfsTripUpdatesWithSkippedStop: Array<GtfsTripUpdate> = [
  {
    id: 'tu-skip',
    trip: {
      tripId: 'trip-skip-1',
      routeId: '19',
      scheduleRelationship: 'SCHEDULED',
    },
    stopTimeUpdates: [
      {
        stopSequence: 3,
        stopId: '740000010',
        scheduleRelationship: 'SKIPPED',
      },
      {
        stopSequence: 4,
        stopId: '740000011',
        arrival: { delay: 0, time: 1709103000 },
        departure: { delay: 0, time: 1709103060 },
        scheduleRelationship: 'SCHEDULED',
      },
    ],
    timestamp: 1709100600,
  },
];

describe('formatGtfsTripUpdates', () => {
  it('should show operator name and update count', () => {
    const text = formatGtfsTripUpdates(gtfsTripUpdates, 'ul');
    expect(text).toContain('UL (Uppsala)');
    expect(text).toContain('2');
  });

  it('should show route and trip ID', () => {
    const text = formatGtfsTripUpdates(gtfsTripUpdates, 'ul');
    expect(text).toContain('Route 801');
    expect(text).toContain('trip-abc-123');
  });

  it('should show schedule relationship for non-scheduled trips', () => {
    const text = formatGtfsTripUpdates(gtfsTripUpdates, 'ul');
    expect(text).toContain('CANCELED');
  });

  it('should show trip-level delay', () => {
    const text = formatGtfsTripUpdates(gtfsTripUpdates, 'ul');
    expect(text).toContain('+2 min');
  });

  it('should show vehicle info', () => {
    const text = formatGtfsTripUpdates(gtfsTripUpdates, 'ul');
    expect(text).toContain('Bus 801');
  });

  it('should show departure time', () => {
    const text = formatGtfsTripUpdates(gtfsTripUpdates, 'ul');
    expect(text).toContain('08:30:00');
    expect(text).toContain('2024-02-28');
  });

  it('should show delayed stops count', () => {
    const text = formatGtfsTripUpdates(gtfsTripUpdates, 'ul');
    expect(text).toContain('2 stop(s) delayed');
    expect(text).toContain('max +3 min');
  });

  it('should show next stop', () => {
    const text = formatGtfsTripUpdates(gtfsTripUpdates, 'ul');
    expect(text).toContain('Next: 740000001');
  });

  it('should show skipped stops', () => {
    const text = formatGtfsTripUpdates(gtfsTripUpdatesWithSkippedStop, 'ul');
    expect(text).toContain('Skipped stops: 740000010');
  });

  it('should use operator abbreviation when name unknown', () => {
    const text = formatGtfsTripUpdates(gtfsTripUpdates, 'custom-op');
    expect(text).toContain('custom-op');
  });

  it('should handle empty trip updates', () => {
    const text = formatGtfsTripUpdates([], 'ul');
    expect(text).toContain('No active trip updates for UL (Uppsala)');
  });

  it('should handle empty trip updates with unknown operator', () => {
    const text = formatGtfsTripUpdates([], 'unknown');
    expect(text).toContain('No active trip updates for unknown');
  });
});

// ─── GTFS Vehicle Positions ─────────────────────────────────────────

const gtfsVehiclePositions: Array<GtfsVehiclePosition> = [
  {
    id: 'vp-1',
    trip: {
      tripId: 'trip-abc-123',
      routeId: '801',
      directionId: 0,
      startTime: '08:30:00',
      startDate: '20240228',
      scheduleRelationship: 'SCHEDULED',
    },
    vehicle: { id: 'vehicle-42', label: 'Bus 801', licensePlate: 'ABC123' },
    position: { latitude: 59.8586, longitude: 17.6389, bearing: 180, speed: 12.5 },
    currentStopSequence: 5,
    stopId: '740000001',
    currentStatus: 'IN_TRANSIT_TO',
    timestamp: 1709100900,
    congestionLevel: 'RUNNING_SMOOTHLY',
    occupancyStatus: 'FEW_SEATS_AVAILABLE',
    occupancyPercentage: 45,
  },
  {
    id: 'vp-2',
    trip: {
      tripId: 'trip-def-456',
      routeId: '3',
      directionId: 1,
      scheduleRelationship: 'SCHEDULED',
    },
    vehicle: { id: 'vehicle-99' },
    position: { latitude: 59.3313, longitude: 18.0597 },
    currentStatus: 'STOPPED_AT',
    timestamp: 1709100800,
  },
];

describe('formatGtfsVehiclePositions', () => {
  it('should show operator name and vehicle count', () => {
    const text = formatGtfsVehiclePositions(gtfsVehiclePositions, 'ul');
    expect(text).toContain('UL (Uppsala)');
    expect(text).toContain('2');
  });

  it('should show route and vehicle label', () => {
    const text = formatGtfsVehiclePositions(gtfsVehiclePositions, 'ul');
    expect(text).toContain('Route 801');
    expect(text).toContain('Bus 801');
  });

  it('should show vehicle stop status', () => {
    const text = formatGtfsVehiclePositions(gtfsVehiclePositions, 'ul');
    expect(text).toContain('IN TRANSIT TO');
    expect(text).toContain('STOPPED AT');
  });

  it('should show position coordinates', () => {
    const text = formatGtfsVehiclePositions(gtfsVehiclePositions, 'ul');
    expect(text).toContain('59.8586');
    expect(text).toContain('17.6389');
  });

  it('should show bearing and speed in km/h', () => {
    const text = formatGtfsVehiclePositions(gtfsVehiclePositions, 'ul');
    expect(text).toContain('bearing 180°');
    expect(text).toContain('45 km/h');
  });

  it('should show stop ID', () => {
    const text = formatGtfsVehiclePositions(gtfsVehiclePositions, 'ul');
    expect(text).toContain('740000001');
    expect(text).toContain('seq 5');
  });

  it('should show occupancy status', () => {
    const text = formatGtfsVehiclePositions(gtfsVehiclePositions, 'ul');
    expect(text).toContain('few seats available');
    expect(text).toContain('45%');
  });

  it('should show congestion level', () => {
    const text = formatGtfsVehiclePositions(gtfsVehiclePositions, 'ul');
    expect(text).toContain('running smoothly');
  });

  it('should use operator abbreviation when name unknown', () => {
    const text = formatGtfsVehiclePositions(gtfsVehiclePositions, 'custom-op');
    expect(text).toContain('custom-op');
  });

  it('should handle empty vehicle positions', () => {
    const text = formatGtfsVehiclePositions([], 'ul');
    expect(text).toContain('No active vehicles for UL (Uppsala)');
  });

  it('should handle empty positions with unknown operator', () => {
    const text = formatGtfsVehiclePositions([], 'unknown');
    expect(text).toContain('No active vehicles for unknown');
  });
});

// ─── SL Deviations ──────────────────────────────────────────────────

const slDeviations: Array<SLDeviationMessage> = [
  {
    version: 1,
    created: '2025-04-01T08:00:00',
    deviation_case_id: 12345,
    publish: { from: '2025-04-01T08:00:00', upto: '2025-04-30T23:59:59' },
    priority: { importance_level: 5, influence_level: 3, urgency_level: 2 },
    message_variants: [
      {
        header: 'Reduced service on the Red line',
        details: 'Due to track maintenance,\ntrains run every 15 minutes.',
        scope_alias: 'T13, T14',
        language: 'sv',
      },
    ],
    scope: {
      stop_areas: [{ id: 9001, name: 'T-Centralen', type: 'METROSTN', transport_authority: 1 }],
      lines: [
        {
          id: 13,
          transport_authority: 1,
          designation: '13',
          transport_mode: 'METRO',
          name: 'T13',
          group_of_lines: 'Röda linjen',
        },
        {
          id: 14,
          transport_authority: 1,
          designation: '14',
          transport_mode: 'METRO',
          name: 'T14',
          group_of_lines: 'Röda linjen',
        },
      ],
    },
    categories: [{ group: 'MAINTENANCE', type: 'TRACK_WORK' }],
  },
  {
    version: 1,
    created: '2025-04-02T06:00:00',
    deviation_case_id: 12346,
    publish: { from: '2025-04-02T06:00:00', upto: '2025-04-02T18:00:00' },
    priority: { importance_level: 8, influence_level: 7, urgency_level: 9 },
    message_variants: [
      {
        header: 'Bus 4 rerouted via Sergels torg',
        details: 'Bus 4 does not serve Kungsgatan due to road closure.',
        scope_alias: 'Linje 4',
        language: 'sv',
      },
    ],
    scope: {
      stop_areas: [
        { id: 1234, name: 'Kungsgatan', type: 'BUSTERM', transport_authority: 1 },
        { id: 5678, name: 'Sergels torg', type: 'BUSTERM', transport_authority: 1 },
      ],
      lines: [
        {
          id: 4,
          transport_authority: 1,
          designation: '4',
          transport_mode: 'BUS',
          name: 'Linje 4',
          group_of_lines: 'Blå bussarna',
        },
      ],
    },
  },
];

describe('formatSLDeviations', () => {
  it('should show deviation count', () => {
    const text = formatSLDeviations(slDeviations);
    expect(text).toContain('Service deviations (2)');
  });

  it('should show header text', () => {
    const text = formatSLDeviations(slDeviations);
    expect(text).toContain('Reduced service on the Red line');
    expect(text).toContain('Bus 4 rerouted via Sergels torg');
  });

  it('should collapse multi-line details', () => {
    const text = formatSLDeviations(slDeviations);
    expect(text).toContain('Due to track maintenance, trains run every 15 minutes.');
  });

  it('should show category tags', () => {
    const text = formatSLDeviations(slDeviations);
    expect(text).toContain('[TRACK_WORK]');
  });

  it('should show affected stop areas', () => {
    const text = formatSLDeviations(slDeviations);
    expect(text).toContain('Affects: T-Centralen');
    expect(text).toContain('Affects: Kungsgatan, Sergels torg');
  });

  it('should show affected lines', () => {
    const text = formatSLDeviations(slDeviations);
    expect(text).toContain('Lines: T13 13, T14 14');
    expect(text).toContain('Lines: Linje 4 4');
  });

  it('should show until date', () => {
    const text = formatSLDeviations(slDeviations);
    expect(text).toContain('Until: 2025-04-30');
    expect(text).toContain('Until: 2025-04-02');
  });

  it('should include context in header when provided', () => {
    const text = formatSLDeviations(slDeviations, 'METRO');
    expect(text).toContain('Service deviations for METRO (2)');
  });

  it('should handle empty deviations', () => {
    const text = formatSLDeviations([]);
    expect(text).toBe('No active service deviations.');
  });

  it('should handle empty deviations with context', () => {
    const text = formatSLDeviations([], 'BUS');
    expect(text).toBe('No service deviations found for BUS.');
  });

  it('should skip messages with no variants', () => {
    const noVariant: SLDeviationMessage = {
      ...slDeviations[0],
      message_variants: [],
    };
    const text = formatSLDeviations([noVariant]);
    expect(text).not.toContain('Reduced service');
  });
});

// ─── Combined SL Nearby Vehicles ────────────────────────────────────

const nearbyResult: CombinedSLNearbyVehiclesResult = {
  location: { name: 'Slussen', siteId: 9192, latitude: 59.3195, longitude: 18.0722 },
  radiusKm: 1,
  vehicles: [
    {
      id: 'entity-1',
      vehicleId: 'V1001',
      vehicleLabel: 'Metro 1001',
      transportMode: 'metro',
      position: { latitude: 59.3198, longitude: 18.0725, bearing: 90, speed: 8.3 },
      distanceMeters: 42,
      currentStatus: 'STOPPED_AT',
      timestamp: 1743505200,
      trip: { tripId: 'trip-123', routeId: 'route-17' },
      nearestStopPoint: { name: 'Slussen', designation: 'A', type: 'METROSTN', distanceMeters: 15 },
    },
    {
      id: 'entity-2',
      vehicleLabel: 'Bus 43',
      transportMode: 'bus',
      position: { latitude: 59.319, longitude: 18.071, speed: 0 },
      distanceMeters: 850,
      currentStatus: 'IN_TRANSIT_TO',
      nearestStopPoint: {
        name: 'Ryssgården',
        type: 'BUSTERM',
        distanceMeters: 30,
      },
    },
  ],
  activeModes: ['metro', 'bus'],
  timestamp: 1743505200,
};

describe('formatCombinedSLNearbyVehicles', () => {
  it('should show location and vehicle count', () => {
    const text = formatCombinedSLNearbyVehicles(nearbyResult);
    expect(text).toContain('Vehicles near Slussen');
    expect(text).toContain('ID: 9192');
    expect(text).toContain('2 within 1 km');
  });

  it('should show active modes', () => {
    const text = formatCombinedSLNearbyVehicles(nearbyResult);
    expect(text).toContain('Active modes: metro, bus');
  });

  it('should show transport mode and distance', () => {
    const text = formatCombinedSLNearbyVehicles(nearbyResult);
    expect(text).toContain('METRO');
    expect(text).toContain('42 m');
    expect(text).toContain('BUS');
    expect(text).toContain('850 m');
  });

  it('should show vehicle labels', () => {
    const text = formatCombinedSLNearbyVehicles(nearbyResult);
    expect(text).toContain('Metro 1001');
    expect(text).toContain('Bus 43');
  });

  it('should show speed in km/h', () => {
    const text = formatCombinedSLNearbyVehicles(nearbyResult);
    expect(text).toContain('30 km/h');
    expect(text).toContain('0 km/h');
  });

  it('should show bearing when present', () => {
    const text = formatCombinedSLNearbyVehicles(nearbyResult);
    expect(text).toContain('90°');
  });

  it('should show current status', () => {
    const text = formatCombinedSLNearbyVehicles(nearbyResult);
    expect(text).toContain('STOPPED AT');
    expect(text).toContain('IN TRANSIT TO');
  });

  it('should show nearest stop point info', () => {
    const text = formatCombinedSLNearbyVehicles(nearbyResult);
    expect(text).toContain('near Slussen (A)');
    expect(text).toContain('near Ryssgården');
  });

  it('should show trip info', () => {
    const text = formatCombinedSLNearbyVehicles(nearbyResult);
    expect(text).toContain('trip trip-123');
  });

  it('should handle empty vehicles', () => {
    const empty: CombinedSLNearbyVehiclesResult = {
      ...nearbyResult,
      vehicles: [],
      activeModes: [],
    };
    const text = formatCombinedSLNearbyVehicles(empty);
    expect(text).toBe('No vehicles found within 1 km of Slussen.');
  });

  it('should format distance in km when >= 1000m', () => {
    const farVehicle: CombinedSLNearbyVehiclesResult = {
      ...nearbyResult,
      vehicles: [{ ...nearbyResult.vehicles[0], distanceMeters: 1500 }],
    };
    const text = formatCombinedSLNearbyVehicles(farVehicle);
    expect(text).toContain('1.50 km');
  });
});
