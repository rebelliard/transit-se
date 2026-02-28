import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import type { GtfsServiceAlert } from '../../types/gtfs/service-alerts';

const { FeedMessage } = GtfsRealtimeBindings.transit_realtime;

// ─── Raw protobuf feeds for mocking fetch ───────────────────────────

const maintenanceFeed = FeedMessage.create({
  header: {
    gtfsRealtimeVersion: '2.0',
    incrementality: 0,
    timestamp: 1709100000,
  },
  entity: [
    {
      id: 'alert-1',
      alert: {
        activePeriod: [{ start: 1709100000, end: 1709200000 }],
        informedEntity: [{ routeId: '1', stopId: '740000001' }],
        cause: 9,
        effect: 2,
        headerText: {
          translation: [{ text: 'Reducerad trafik på linje 1', language: 'sv' }],
        },
        descriptionText: {
          translation: [
            { text: 'Linje 1 kör med reducerad turtäthet pga underhåll.', language: 'sv' },
          ],
        },
      },
    },
    {
      id: 'alert-2',
      alert: {
        activePeriod: [{ start: 1709150000 }],
        informedEntity: [{ agencyId: 'UL', routeId: '801' }],
        cause: 8,
        effect: 3,
        headerText: {
          translation: [{ text: 'Förseningar pga väderförhållanden', language: 'sv' }],
        },
        descriptionText: {
          translation: [
            { text: 'Förseningar upp till 20 minuter pga halt väglag.', language: 'sv' },
          ],
        },
        url: {
          translation: [{ text: 'https://ul.se/disruptions/123', language: 'sv' }],
        },
      },
    },
  ],
});

const emptyFeed = FeedMessage.create({
  header: { gtfsRealtimeVersion: '2.0', incrementality: 0, timestamp: 1709100000 },
  entity: [],
});

const multiLanguageFeed = FeedMessage.create({
  header: { gtfsRealtimeVersion: '2.0', incrementality: 0, timestamp: 1709100000 },
  entity: [
    {
      id: 'alert-multi',
      alert: {
        activePeriod: [{ start: 1709100000, end: 1709200000 }],
        informedEntity: [{ routeId: '3' }],
        cause: 10,
        effect: 4,
        headerText: {
          translation: [
            { text: 'Omlagd körväg linje 3', language: 'sv' },
            { text: 'Line 3 rerouted', language: 'en' },
          ],
        },
        descriptionText: {
          translation: [
            { text: 'Linje 3 kör via Storgatan pga vägarbete.', language: 'sv' },
            { text: 'Line 3 rerouted via Storgatan due to road works.', language: 'en' },
          ],
        },
      },
    },
  ],
});

/** Encoded protobuf: two alerts (maintenance + weather). */
export const gtfsServiceAlertsFeedBuffer = FeedMessage.encode(maintenanceFeed).finish();

/** Encoded protobuf: no alerts. */
export const gtfsServiceAlertsEmptyFeedBuffer = FeedMessage.encode(emptyFeed).finish();

/** Encoded protobuf: one alert with Swedish + English translations. */
export const gtfsServiceAlertsMultiLangFeedBuffer = FeedMessage.encode(multiLanguageFeed).finish();

// ─── Expected clean output ──────────────────────────────────────────

/** Expected output for the two-alert feed. */
export const gtfsServiceAlertsResponse: Array<GtfsServiceAlert> = [
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

/** Expected output for the empty feed. */
export const gtfsServiceAlertsEmptyResponse: Array<GtfsServiceAlert> = [];
