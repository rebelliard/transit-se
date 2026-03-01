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
  timestamp: '2026-03-01T14:50:58',
  query: { queryTime: '2026-03-01T14:50:58', query: 'T-Centralen' },
  stop_groups: [
    {
      id: '740020749',
      name: 'T-Centralen T-bana',
      area_type: 'RIKSHALLPLATS',
      average_daily_stop_times: 2023.35,
      transport_modes: ['METRO'],
      stops: [{ id: '9825', name: 'T-Centralen', lat: 59.33166, lon: 18.061694 }],
    },
  ],
};

const departuresResult: TrafiklabDeparturesResponse = {
  timestamp: '2026-03-01T14:51:18',
  query: { queryTime: '2026-03-01T14:51:00', query: '740020749' },
  stops: [
    {
      id: '9825',
      name: 'T-Centralen',
      lat: 59.33166,
      lon: 18.061694,
      transport_modes: ['METRO'],
      alerts: [
        {
          type: 'MAINTENANCE',
          title: 'Service disruption',
          text: 'Delays on green line',
        },
      ],
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
      trip: { trip_id: '14010100702496794', start_date: '2026-03-01', technical_number: 26496 },
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
    {
      scheduled: '2026-03-01T14:50:42',
      realtime: '2026-03-01T14:50:42',
      delay: 0,
      canceled: true,
      route: {
        name: 'Gröna linjen',
        designation: '17',
        transport_mode_code: 401,
        transport_mode: 'METRO',
        direction: 'Skarpnäck',
        origin: { id: '12256', name: 'Åkeshov' },
        destination: { id: '12346', name: 'Skarpnäck' },
      },
      trip: { trip_id: '14010000702402856', start_date: '2026-03-01', technical_number: 10522 },
      agency: {
        id: '505000000000000001',
        name: 'AB Storstockholms Lokaltrafik',
        operator: 'Connecting Stockholm',
      },
      stop: { id: '9825', name: 'T-Centralen', lat: 59.33166, lon: 18.061694 },
      scheduled_platform: { id: '9022050009825002', designation: '4' },
      realtime_platform: null,
      alerts: [{ type: 'INFORMATION', title: 'Trip canceled', text: 'This trip is canceled' }],
      is_realtime: true,
    },
  ],
};

const arrivalsResult: TrafiklabArrivalsResponse = {
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
        transport_mode_code: 401,
        transport_mode: 'METRO',
        direction: 'Skarpnäck',
        origin: { id: '12256', name: 'Åkeshov' },
        destination: { id: '12346', name: 'Skarpnäck' },
      },
      trip: { trip_id: '14010000702402856', start_date: '2026-03-01', technical_number: 10522 },
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
};

const slDeparturesResult: SLDeparturesResponse = {
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
      stop_area: { id: 1051, name: 'T-Centralen', type: 'METROSTN' },
      stop_point: { id: 3052, name: 'T-Centralen', designation: '6' },
      line: {
        id: 11,
        designation: '11',
        transport_authority_id: 1,
        transport_mode: 'METRO',
        group_of_lines: 'Tunnelbanans blå linje',
      },
      deviations: [],
    },
  ],
  stop_deviations: [],
};

const slDeparturesWithDeviations: SLDeparturesResponse = {
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
      stop_area: { id: 5310, name: 'Stockholm City', type: 'RAILWSTN' },
      stop_point: { id: 5312, name: 'Stockholm City', designation: '2' },
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
          message: 'Hissen är avstängd på grund av tekniskt fel.',
        },
      ],
    },
  ],
  stop_deviations: [
    {
      id: 10449348,
      importance_level: 2,
      message: 'Korta tåg. Gå mot mitten av plattformen.',
    },
  ],
};

const slSites: Array<SLSiteEntry> = [
  { id: 9192, name: 'Slussen', lat: 59.3203176773338, lon: 18.0724531524889 },
  { id: 9001, name: 'T-Centralen', lat: 59.3313754153065, lon: 18.0604334292973 },
];

// ─── Tests ──────────────────────────────────────────────────────────

describe('formatTrafiklabStopLookup', () => {
  it('should format stop groups with names, IDs, and modes', () => {
    const text = formatTrafiklabStopLookup(stopLookupResult);
    expect(text).toContain('T-Centralen T-bana');
    expect(text).toContain('740020749');
    expect(text).toContain('METRO');
    expect(text).toContain('RIKSHALLPLATS');
    expect(text).toContain('2023.35');
  });

  it('should include child stops with coordinates', () => {
    const text = formatTrafiklabStopLookup(stopLookupResult);
    expect(text).toContain('T-Centralen');
    expect(text).toContain('9825');
    expect(text).toContain('59.33166');
    expect(text).toContain('18.061694');
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
    expect(text).toContain('Line 13');
    expect(text).toContain('Ropsten');
    expect(text).toContain('Line 17');
    expect(text).toContain('Skarpnäck');
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
    expect(text).toContain('Platform 3');
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
    expect(text).toContain('Line 17');
    expect(text).toContain('Skarpnäck');
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
    expect(text).toContain('3 min');
    expect(text).toContain('11');
    expect(text).toContain('Kungsträdgården');
  });

  it('should show transport mode in uppercase', () => {
    const text = formatSLDepartures(slDeparturesResult, 9001);
    expect(text).toContain('METRO');
  });

  it('should show platform designation', () => {
    const text = formatSLDepartures(slDeparturesResult, 9001);
    expect(text).toContain('Platform 6');
  });

  it('should show stop deviations', () => {
    const text = formatSLDepartures(slDeparturesWithDeviations, 9001);
    expect(text).toContain('Korta tåg. Gå mot mitten av plattformen.');
  });

  it('should show departure-level disruptions', () => {
    const text = formatSLDepartures(slDeparturesWithDeviations, 9001);
    expect(text).toContain('Hissen är avstängd på grund av tekniskt fel.');
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
    expect(text).toContain('59.3203');
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
    id: '33010000163741154',
    cause: 'CONSTRUCTION',
    effect: 'UNKNOWN_EFFECT',
    headerText: 'Hållplats Martallsvägen (Uppsala) trafikeras inte',
    descriptionText:
      'Hållplats Martallsvägen (Uppsala) är indragen i båda riktningar och trafikeras inte av linje 11 och 107. Resande hänvisas till hållplats Spinnrocksvägen. Detta beror på vägarbete och gäller till och med 2026-04-30.',
    activePeriods: [{ start: 1765959967, end: 1777586340 }],
    informedEntities: [
      { routeId: '9011003010700000', routeType: 0, stopId: '4467' },
      { routeId: '9011003001100000', routeType: 0, stopId: '4246' },
    ],
  },
  {
    id: '33010000166383924',
    cause: 'WEATHER',
    effect: 'SIGNIFICANT_DELAYS',
    headerText: 'Förseningar pga väderförhållanden',
    descriptionText: 'Förseningar upp till 20 minuter pga halt väglag.',
    url: 'https://ul.se/disruptions/166383924',
    activePeriods: [{ start: 1769143028 }],
    informedEntities: [{ agencyId: 'UL', routeId: '9011003010000000' }],
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
    expect(text).toContain('Hållplats Martallsvägen (Uppsala) trafikeras inte');
    expect(text).toContain('SIGNIFICANT_DELAYS');
  });

  it('should show description text', () => {
    const text = formatGtfsServiceAlerts(gtfsAlerts, 'ul');
    expect(text).toContain('Resande hänvisas till hållplats Spinnrocksvägen');
  });

  it('should show cause', () => {
    const text = formatGtfsServiceAlerts(gtfsAlerts, 'ul');
    expect(text).toContain('construction');
  });

  it('should show route and stop IDs', () => {
    const text = formatGtfsServiceAlerts(gtfsAlerts, 'ul');
    expect(text).toContain('Routes: 9011003010700000, 9011003001100000');
    expect(text).toContain('Stops: 4467, 4246');
  });

  it('should show URL when present', () => {
    const text = formatGtfsServiceAlerts(gtfsAlerts, 'ul');
    expect(text).toContain('https://ul.se/disruptions/166383924');
  });

  it('should show active period dates', () => {
    const text = formatGtfsServiceAlerts(gtfsAlerts, 'ul');
    expect(text).toContain('2025-12-17');
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
    id: '14010517687256993',
    trip: {
      tripId: '14010000713020248',
      routeId: '9011001004300000',
      directionId: 0,
      startTime: '14:45:00',
      startDate: '20260301',
      scheduleRelationship: 'SCHEDULED',
    },
    vehicle: { id: '9031008000500546', label: 'Pendeltåg 43' },
    stopTimeUpdates: [
      {
        stopSequence: 32,
        stopId: '9022050013110001',
        arrival: { delay: 412, time: 1772374012, uncertainty: 60 },
        departure: { delay: 412, time: 1772374012, uncertainty: 60 },
        scheduleRelationship: 'SCHEDULED',
      },
      {
        stopSequence: 33,
        stopId: '9022050013100001',
        arrival: { delay: 541, time: 1772374441 },
        departure: { delay: 592, time: 1772374492 },
        scheduleRelationship: 'SCHEDULED',
      },
    ],
    timestamp: 1772374495,
    delay: 412,
  },
  {
    id: '14050001911285220',
    trip: {
      tripId: '14010000702187461',
      routeId: '9011001001800000',
      directionId: 1,
      startTime: '15:11:12',
      startDate: '20260301',
      scheduleRelationship: 'CANCELED',
    },
    stopTimeUpdates: [],
    timestamp: 1772374412,
  },
];

const gtfsTripUpdatesWithSkippedStop: Array<GtfsTripUpdate> = [
  {
    id: '14010517652571469',
    trip: {
      tripId: '14010100711492126',
      routeId: '9011001015100000',
      scheduleRelationship: 'SCHEDULED',
    },
    stopTimeUpdates: [
      {
        stopSequence: 79,
        stopId: '9022050010409001',
        scheduleRelationship: 'SKIPPED',
      },
      {
        stopSequence: 80,
        stopId: '9022050011518001',
        arrival: { delay: 0, time: 1772374653 },
        departure: { delay: 0, time: 1772374660 },
        scheduleRelationship: 'SCHEDULED',
      },
    ],
    timestamp: 1772374418,
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
    expect(text).toContain('Route 9011001004300000');
    expect(text).toContain('14010000713020248');
  });

  it('should show schedule relationship for non-scheduled trips', () => {
    const text = formatGtfsTripUpdates(gtfsTripUpdates, 'ul');
    expect(text).toContain('CANCELED');
  });

  it('should show trip-level delay', () => {
    const text = formatGtfsTripUpdates(gtfsTripUpdates, 'ul');
    expect(text).toContain('+7 min');
  });

  it('should show vehicle info', () => {
    const text = formatGtfsTripUpdates(gtfsTripUpdates, 'ul');
    expect(text).toContain('Pendeltåg 43');
  });

  it('should show departure time', () => {
    const text = formatGtfsTripUpdates(gtfsTripUpdates, 'ul');
    expect(text).toContain('14:45:00');
    expect(text).toContain('2026-03-01');
  });

  it('should show delayed stops count', () => {
    const text = formatGtfsTripUpdates(gtfsTripUpdates, 'ul');
    expect(text).toContain('2 stop(s) delayed');
    expect(text).toContain('max +10 min');
  });

  it('should show next stop', () => {
    const text = formatGtfsTripUpdates(gtfsTripUpdates, 'ul');
    expect(text).toContain('Next: 9022050013110001');
  });

  it('should show skipped stops', () => {
    const text = formatGtfsTripUpdates(gtfsTripUpdatesWithSkippedStop, 'ul');
    expect(text).toContain('Skipped stops: 9022050010409001');
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
    id: '48061772374517773',
    trip: {
      tripId: '14010000664343260',
      routeId: '9011001004300000',
      directionId: 0,
      startTime: '14:45:00',
      startDate: '20260301',
      scheduleRelationship: 'SCHEDULED',
    },
    vehicle: { id: '9031001001004806', label: 'Pendeltåg 43', licensePlate: 'SL4806' },
    position: { latitude: 59.33179, longitude: 18.02621, bearing: 90, speed: 10.6 },
    currentStopSequence: 12,
    stopId: '9022050013110001',
    currentStatus: 'IN_TRANSIT_TO',
    timestamp: 1772374517,
    congestionLevel: 'RUNNING_SMOOTHLY',
    occupancyStatus: 'FEW_SEATS_AVAILABLE',
    occupancyPercentage: 45,
  },
  {
    id: '371362377',
    trip: {
      tripId: '14010100711492126',
      routeId: '9011005006100000',
      directionId: 1,
      scheduleRelationship: 'SCHEDULED',
    },
    vehicle: { id: '9031005920505666' },
    position: { latitude: 58.41698, longitude: 15.62424 },
    currentStatus: 'STOPPED_AT',
    timestamp: 1772374517,
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
    expect(text).toContain('Route 9011001004300000');
    expect(text).toContain('Pendeltåg 43');
  });

  it('should show vehicle stop status', () => {
    const text = formatGtfsVehiclePositions(gtfsVehiclePositions, 'ul');
    expect(text).toContain('IN TRANSIT TO');
    expect(text).toContain('STOPPED AT');
  });

  it('should show position coordinates', () => {
    const text = formatGtfsVehiclePositions(gtfsVehiclePositions, 'ul');
    expect(text).toContain('59.3318');
    expect(text).toContain('18.0262');
  });

  it('should show bearing and speed in km/h', () => {
    const text = formatGtfsVehiclePositions(gtfsVehiclePositions, 'ul');
    expect(text).toContain('bearing 90°');
    expect(text).toContain('38 km/h');
  });

  it('should show stop ID', () => {
    const text = formatGtfsVehiclePositions(gtfsVehiclePositions, 'ul');
    expect(text).toContain('9022050013110001');
    expect(text).toContain('seq 12');
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
  location: { name: 'T-Centralen', siteId: 9001, latitude: 59.3314, longitude: 18.0604 },
  radiusKm: 1,
  vehicles: [
    {
      id: '48151772374092874',
      vehicleId: '9031001001004815',
      transportMode: 'metro',
      position: { latitude: 59.3312, longitude: 18.061, bearing: 59, speed: 2.5 },
      distanceMeters: 38,
      currentStatus: 'IN_TRANSIT_TO',
      timestamp: 1772374092,
      trip: { tripId: '14010000704215260', directionId: 0 },
      nearestStopPoint: {
        name: 'T-Centralen',
        designation: '3',
        type: 'METROSTN',
        distanceMeters: 12,
      },
    },
    {
      id: '4711772374092768',
      vehicleId: '9031001007000471',
      vehicleLabel: 'Buss 3',
      transportMode: 'bus',
      position: { latitude: 59.3321, longitude: 18.0608, bearing: 80, speed: 3.1 },
      distanceMeters: 80,
      currentStatus: 'IN_TRANSIT_TO',
      nearestStopPoint: {
        name: 'T-Centralen',
        designation: 'M',
        type: 'BUSTERM',
        distanceMeters: 25,
      },
    },
  ],
  activeModes: ['metro', 'bus'],
  timestamp: 1772374092,
};

describe('formatCombinedSLNearbyVehicles', () => {
  it('should show location and vehicle count', () => {
    const text = formatCombinedSLNearbyVehicles(nearbyResult);
    expect(text).toContain('Vehicles near T-Centralen');
    expect(text).toContain('ID: 9001');
    expect(text).toContain('2 within 1 km');
  });

  it('should show active modes', () => {
    const text = formatCombinedSLNearbyVehicles(nearbyResult);
    expect(text).toContain('Active modes: metro, bus');
  });

  it('should show transport mode and distance', () => {
    const text = formatCombinedSLNearbyVehicles(nearbyResult);
    expect(text).toContain('METRO');
    expect(text).toContain('38 m');
    expect(text).toContain('BUS');
    expect(text).toContain('80 m');
  });

  it('should show vehicle labels', () => {
    const text = formatCombinedSLNearbyVehicles(nearbyResult);
    expect(text).toContain('9031001001004815');
    expect(text).toContain('Buss 3');
  });

  it('should show speed in km/h', () => {
    const text = formatCombinedSLNearbyVehicles(nearbyResult);
    expect(text).toContain('9 km/h');
    expect(text).toContain('11 km/h');
  });

  it('should show bearing when present', () => {
    const text = formatCombinedSLNearbyVehicles(nearbyResult);
    expect(text).toContain('59°');
  });

  it('should show current status', () => {
    const text = formatCombinedSLNearbyVehicles(nearbyResult);
    expect(text).toContain('IN TRANSIT TO');
  });

  it('should show nearest stop point info', () => {
    const text = formatCombinedSLNearbyVehicles(nearbyResult);
    expect(text).toContain('near T-Centralen (3)');
    expect(text).toContain('near T-Centralen (M)');
  });

  it('should show trip info', () => {
    const text = formatCombinedSLNearbyVehicles(nearbyResult);
    expect(text).toContain('trip 14010000704215260');
  });

  it('should handle empty vehicles', () => {
    const empty: CombinedSLNearbyVehiclesResult = {
      ...nearbyResult,
      vehicles: [],
      activeModes: [],
    };
    const text = formatCombinedSLNearbyVehicles(empty);
    expect(text).toBe('No vehicles found within 1 km of T-Centralen.');
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
