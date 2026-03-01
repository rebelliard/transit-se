import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import type { GtfsServiceAlert } from '../../types/gtfs/service-alerts';

const { FeedMessage } = GtfsRealtimeBindings.transit_realtime;

// ─── Raw protobuf feeds for mocking fetch ───────────────────────────

const maintenanceFeed = FeedMessage.create({
  header: {
    gtfsRealtimeVersion: '2.0',
    incrementality: 0,
    timestamp: 1772374000,
  },
  entity: [
    {
      id: '33010000163741154',
      alert: {
        activePeriod: [{ start: 1765959967, end: 1777586340 }],
        informedEntity: [
          { routeId: '9011003010700000', routeType: 0, stopId: '4467' },
          { routeId: '9011003001100000', routeType: 0, stopId: '4246' },
        ],
        cause: 10,
        effect: 8,
        headerText: {
          translation: [
            {
              text: 'Hållplats Martallsvägen (Uppsala) trafikeras inte',
              language: 'sv',
            },
          ],
        },
        descriptionText: {
          translation: [
            {
              text: 'Hållplats Martallsvägen (Uppsala) är indragen i båda riktningar och trafikeras inte av linje 11 och 107. Resande hänvisas till hållplats Spinnrocksvägen. Detta beror på vägarbete och gäller till och med 2026-04-30.',
              language: 'sv',
            },
          ],
        },
      },
    },
    {
      id: '33010000166383924',
      alert: {
        activePeriod: [{ start: 1769143028 }],
        informedEntity: [{ agencyId: 'UL', routeId: '9011003010000000' }],
        cause: 8,
        effect: 3,
        headerText: {
          translation: [{ text: 'Förseningar pga väderförhållanden', language: 'sv' }],
        },
        descriptionText: {
          translation: [
            {
              text: 'Förseningar upp till 20 minuter pga halt väglag.',
              language: 'sv',
            },
          ],
        },
        url: {
          translation: [{ text: 'https://ul.se/disruptions/166383924', language: 'sv' }],
        },
      },
    },
  ],
});

const emptyFeed = FeedMessage.create({
  header: { gtfsRealtimeVersion: '2.0', incrementality: 0, timestamp: 1772374000 },
  entity: [],
});

const multiLanguageFeed = FeedMessage.create({
  header: { gtfsRealtimeVersion: '2.0', incrementality: 0, timestamp: 1772374000 },
  entity: [
    {
      id: '33010000168085227',
      alert: {
        activePeriod: [{ start: 1771256402, end: 1773615540 }],
        informedEntity: [{ routeId: '9011003000100000', routeType: 0, stopId: '4445' }],
        cause: 10,
        effect: 4,
        headerText: {
          translation: [
            { text: 'Omlagd körväg linje 1', language: 'sv' },
            { text: 'Line 1 rerouted', language: 'en' },
          ],
        },
        descriptionText: {
          translation: [
            {
              text: 'Linje 1 kör via Storgatan pga vägarbete.',
              language: 'sv',
            },
            {
              text: 'Line 1 rerouted via Storgatan due to road works.',
              language: 'en',
            },
          ],
        },
      },
    },
  ],
});

/** Encoded protobuf: two alerts (construction + weather). */
export const gtfsServiceAlertsFeedBuffer = FeedMessage.encode(maintenanceFeed).finish();

/** Encoded protobuf: no alerts. */
export const gtfsServiceAlertsEmptyFeedBuffer = FeedMessage.encode(emptyFeed).finish();

/** Encoded protobuf: one alert with Swedish + English translations. */
export const gtfsServiceAlertsMultiLangFeedBuffer = FeedMessage.encode(multiLanguageFeed).finish();

// ─── Expected clean output ──────────────────────────────────────────

/** Expected output for the two-alert feed. */
export const gtfsServiceAlertsResponse: Array<GtfsServiceAlert> = [
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

/** Expected output for the empty feed. */
export const gtfsServiceAlertsEmptyResponse: Array<GtfsServiceAlert> = [];
