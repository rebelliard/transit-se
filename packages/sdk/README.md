# @transit-se/sdk

TypeScript SDK for [Trafiklab](https://www.trafiklab.se/) realtime APIs with a focus on Stockholm (SL).

## Table of Contents

- [APIs Covered](#apis-covered)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [SL Transport](#sl-transport)
  - [SL Deviations](#sl-deviations)
  - [Trafiklab Stop Lookup](#trafiklab-stop-lookup)
  - [Trafiklab Timetables](#trafiklab-timetables)
  - [GTFS-RT APIs](#gtfs-rt-apis)
  - [Combined Nearby Vehicles](#combined-nearby-vehicles)
- [Standalone API Usage](#standalone-api-usage)
- [Response Validation](#response-validation)
- [Usage Tracking](#usage-tracking)
- [Error Handling](#error-handling)

## APIs Covered

| API                                                                                                                                        | Auth                 | Scope     |
| ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- | --------- |
| [SL Transport](https://www.trafiklab.se/api/our-apis/sl/transport/)                                                                        | None                 | Stockholm |
| [SL Deviations](https://www.trafiklab.se/api/our-apis/sl/deviations/)                                                                      | None                 | Stockholm |
| [Trafiklab Stop Lookup](https://www.trafiklab.se/api/our-apis/trafiklab-realtime-apis/stop-lookup/)                                        | `TRAFIKLAB_API_KEY`  | Sweden    |
| [Trafiklab Timetables](https://www.trafiklab.se/api/our-apis/trafiklab-realtime-apis/timetables/)                                          | `TRAFIKLAB_API_KEY`  | Sweden    |
| [GTFS-RT Service Alerts](https://www.trafiklab.se/api/gtfs-datasets/gtfs-sweden/realtime-specification/#/GTFS-RT/fetchServiceAlerts)       | `TRAFIKLAB_GTFS_KEY` | Sweden    |
| [GTFS-RT Trip Updates](https://www.trafiklab.se/api/gtfs-datasets/gtfs-sweden/realtime-specification/#/GTFS-RT/fetchTripUpdates)           | `TRAFIKLAB_GTFS_KEY` | Sweden    |
| [GTFS-RT Vehicle Positions](https://www.trafiklab.se/api/gtfs-datasets/gtfs-sweden/realtime-specification/#/GTFS-RT/fetchVehiclePositions) | `TRAFIKLAB_GTFS_KEY` | Sweden    |
| Combined Nearby Vehicles                                                                                                                   | `TRAFIKLAB_GTFS_KEY` | Stockholm |

## Quick Start

To explore all endpoints interactively, open the built-in Swagger UI:

```bash
bun run --filter @transit-se/sdk inspect
```

```typescript
import { TransitClient } from '@transit-se/sdk';

const client = new TransitClient({
  apiKey: process.env.TRAFIKLAB_API_KEY!,
});

// Search stops
const stops = await client.stops.searchByName('T-Centralen');

// Get departures
const departures = await client.timetables.getDepartures('740000001');

// SL-specific (no API key needed)
const slDepartures = await client.sl.getDepartures(9192);

// Check usage
console.log(client.getUsage());
```

## API Reference

### SL Transport

Stockholm-specific API. **No API key required.**

```typescript
import { SLTransportApi } from '@transit-se/sdk/sl';

const sl = new SLTransportApi();

// Departures from Slussen (site ID 9192)
const deps = await sl.getDepartures(9192);
for (const dep of deps.departures) {
  console.log(`${dep.display} ${dep.line.designation} → ${dep.destination}`);
}

// All sites, lines (grouped by mode), stop points
const sites = await sl.getSites();
const lines = await sl.getLines();
const stopPoints = await sl.getStopPoints();

// Cached site lookups (fetched once, then instant)
const site = await sl.getSiteById(9192);
const slussen = await sl.getSiteByName('Slussen');
const matches = await sl.searchSitesByName('central');
const allCached = await sl.getCachedSites();
```

| Method                      | Endpoint                        | Description                              |
| --------------------------- | ------------------------------- | ---------------------------------------- |
| `getSites(expand?)`         | `GET /v1/sites`                 | List all sites (full response)           |
| `getDepartures(siteId)`     | `GET /v1/sites/{id}/departures` | Departures from a site                   |
| `getLines()`                | `GET /v1/lines`                 | Lines grouped by mode                    |
| `getStopPoints()`           | `GET /v1/stop-points`           | List all stop points                     |
| `getTransportAuthorities()` | `GET /v1/transport-authorities` | List transport authorities               |
| `getCachedSites()`          | Cached                          | All sites (fetched once, then in-memory) |
| `getSiteById(id)`           | Cached                          | Look up a site by numeric ID             |
| `getSiteByName(name)`       | Cached                          | Look up a site by exact name             |
| `searchSitesByName(query)`  | Cached                          | Search sites by name substring           |

> **Site ID note:** IDs from Trafiklab Stop Lookup (format `300109001`) need the prefix removed — `300109001` becomes `9001`.

### SL Deviations

Service disruptions, reroutes, and planned maintenance for Stockholm. **No API key required.**

```typescript
import { SLDeviationsApi } from '@transit-se/sdk/sl';

const deviations = new SLDeviationsApi();

// All current deviations
const all = await deviations.getDeviations();

// Filter by transport mode and line
const metro = await deviations.getDeviations({
  transportModes: ['METRO'],
  lineIds: [13, 14],
});

for (const msg of metro) {
  const variant = msg.message_variants[0];
  console.log(`${variant.header}: ${variant.details}`);
}
```

| Method                    | Endpoint             | Description                       |
| ------------------------- | -------------------- | --------------------------------- |
| `getDeviations(options?)` | `GET /v1/deviations` | Current and future service alerts |

### Trafiklab Stop Lookup

Search and list public transport stops. Covers **all of Sweden**. Requires `TRAFIKLAB_API_KEY`.

```typescript
import { TransitClient } from '@transit-se/sdk';

const client = new TransitClient({ apiKey: process.env.TRAFIKLAB_API_KEY! });

// Search stops by name
const result = await client.stops.searchByName('T-Centralen');
for (const group of result.stop_groups) {
  console.log(group.name, group.transport_modes);
}

// List all stops (sorted by daily departures)
const all = await client.stops.listAll();
```

| Method                | Endpoint                     | Description          |
| --------------------- | ---------------------------- | -------------------- |
| `searchByName(query)` | `GET /v1/stops/name/{query}` | Search stops by name |
| `listAll()`           | `GET /v1/stops/list`         | List all stops       |

### Trafiklab Timetables

Departures and arrivals for the next 60 minutes from any stop. Requires `TRAFIKLAB_API_KEY`.

```typescript
// Departures from T-Centralen
const deps = await client.timetables.getDepartures('740000001');
for (const dep of deps.departures) {
  console.log(`${dep.route.designation} → ${dep.route.direction} (delay: ${dep.delay}s)`);
}

// Arrivals at a specific time
const arrs = await client.timetables.getArrivals('740000001', '2025-04-01T16:00');
```

| Method                         | Endpoint                               | Description            |
| ------------------------------ | -------------------------------------- | ---------------------- |
| `getDepartures(areaId, time?)` | `GET /v1/departures/{areaId}[/{time}]` | Departures from a stop |
| `getArrivals(areaId, time?)`   | `GET /v1/arrivals/{areaId}[/{time}]`   | Arrivals at a stop     |

### GTFS-RT APIs

Real-time feeds covering **all Swedish transit operators** (Uppsala, Skane, Ostgotrafiken, and more). The SDK decodes protobuf into clean TypeScript objects. Requires `TRAFIKLAB_GTFS_KEY`.

> **For Stockholm (SL):** Prefer the SL-specific APIs — they provide richer data and require no API key.

```typescript
import {
  GtfsServiceAlertsApi,
  GtfsTripUpdatesApi,
  GtfsVehiclePositionsApi,
} from '@transit-se/sdk/gtfs';

const alerts = new GtfsServiceAlertsApi({ apiKey: process.env.TRAFIKLAB_GTFS_KEY! });
const trips = new GtfsTripUpdatesApi({ apiKey: process.env.TRAFIKLAB_GTFS_KEY! });
const vehicles = new GtfsVehiclePositionsApi({ apiKey: process.env.TRAFIKLAB_GTFS_KEY! });

// Service alerts for Uppsala
const ulAlerts = await alerts.getServiceAlerts('ul');

// Trip updates (delays, cancellations) for Skane
const skaneTrips = await trips.getTripUpdates('skane');

// Live vehicle positions for Uppsala
const ulVehicles = await vehicles.getVehiclePositions('ul');
```

| Method                          | Feed                        | Description                                   |
| ------------------------------- | --------------------------- | --------------------------------------------- |
| `getServiceAlerts(operator)`    | `ServiceAlertsSweden.pb`    | Disruptions, reroutes, planned maintenance    |
| `getTripUpdates(operator)`      | `TripUpdatesSweden.pb`      | Per-trip delay predictions and cancellations  |
| `getVehiclePositions(operator)` | `VehiclePositionsSweden.pb` | Live GPS positions, speed, bearing, occupancy |

Supported operators: `sl`, `ul`, `otraf`, `jlt`, `krono`, `klt`, `gotland`, `blekinge`, `skane`, `halland`, `varm`, `orebro`, `vastmanland`, `dt`, `xt`, `dintur`.

### Combined Nearby Vehicles

Find vehicles near a Stockholm location with automatic transport mode classification (metro, bus, tram, train, ferry, ship). Combines GTFS-RT vehicle positions with SL stop point data. Requires `TRAFIKLAB_GTFS_KEY`.

```typescript
import { CombinedSLNearbyVehiclesApi } from '@transit-se/sdk/combined';
import { GtfsVehiclePositionsApi } from '@transit-se/sdk/gtfs';
import { SLTransportApi } from '@transit-se/sdk/sl';

const nearby = new CombinedSLNearbyVehiclesApi({
  vehiclePositionsApi: new GtfsVehiclePositionsApi({ apiKey: process.env.TRAFIKLAB_GTFS_KEY! }),
  slTransportApi: new SLTransportApi(),
});

// By station name
const result = await nearby.getNearbyVehicles({ siteName: 'Slussen' });

// By coordinates with custom radius
const result2 = await nearby.getNearbyVehicles({
  latitude: 59.3195,
  longitude: 18.0722,
  radiusKm: 2,
});

for (const v of result.vehicles) {
  console.log(`${v.transportMode} — ${v.distanceMeters}m away — ${v.vehicleLabel}`);
}
```

| Method                       | Description                                   |
| ---------------------------- | --------------------------------------------- |
| `getNearbyVehicles(options)` | Vehicles near a site or coordinate with modes |

## Standalone API Usage

Each API can be used independently without the `TransitClient` facade:

```typescript
import { SLTransportApi, SLDeviationsApi } from '@transit-se/sdk/sl';
import { TrafiklabStopLookupApi, TrafiklabTimetablesApi } from '@transit-se/sdk/trafiklab';
import {
  GtfsServiceAlertsApi,
  GtfsTripUpdatesApi,
  GtfsVehiclePositionsApi,
} from '@transit-se/sdk/gtfs';

// SL APIs (no API key)
const sl = new SLTransportApi();
const deviations = new SLDeviationsApi();

// Trafiklab APIs (require TRAFIKLAB_API_KEY)
const stops = new TrafiklabStopLookupApi({ apiKey: 'your-key' });
const timetables = new TrafiklabTimetablesApi({ apiKey: 'your-key' });

// GTFS-RT APIs (require TRAFIKLAB_GTFS_KEY)
const alerts = new GtfsServiceAlertsApi({ apiKey: 'your-gtfs-key' });
const trips = new GtfsTripUpdatesApi({ apiKey: 'your-gtfs-key' });
const vehicles = new GtfsVehiclePositionsApi({ apiKey: 'your-gtfs-key' });

// Combined APIs (require TRAFIKLAB_GTFS_KEY)
import { CombinedSLNearbyVehiclesApi } from '@transit-se/sdk/combined';
const nearby = new CombinedSLNearbyVehiclesApi({
  vehiclePositionsApi: vehicles,
  slTransportApi: sl,
});
```

## Response Validation

The SDK ships with optional [Valibot](https://valibot.dev/) schemas for JSON API responses (SL and Trafiklab APIs). GTFS-RT APIs use protobuf, which is self-validating.

```typescript
import { TransitClient, ValidationError } from '@transit-se/sdk';

const client = new TransitClient({
  apiKey: process.env.TRAFIKLAB_API_KEY!,
  validate: true,
});

try {
  const stops = await client.stops.searchByName('T-Centralen');
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('API response changed:', error.message);
  }
}
```

- **`validate: false`** (default) — zero overhead, zero deps. Responses are cast to TypeScript types.
- **`validate: true`** — responses are parsed through Valibot schemas. Throws `ValidationError` on shape mismatch. Requires `valibot` as a peer dependency (`bun add valibot`).

Individual APIs also accept `validate`:

```typescript
import { SLTransportApi } from '@transit-se/sdk/sl';

const sl = new SLTransportApi({ validate: true });
```

Schemas are exported for direct use:

```typescript
import { TrafiklabStopLookupResponseSchema, SLDepartureSchema } from '@transit-se/sdk/schemas';
```

## Usage Tracking

The SDK tracks API call counts so you can monitor your quota:

```typescript
const client = new TransitClient({ apiKey: '...' });

await client.stops.searchByName('Slussen');
await client.timetables.getDepartures('740000001');

console.log(client.getUsage());
// { totalRequests: 2, byEndpoint: { '/name/Slussen': 1, '/departures/740000001': 1 } }
```

Individual API instances also expose `getUsage()`.

## Error Handling

```typescript
import { ApiResponseError, ValidationError } from '@transit-se/sdk';

try {
  await client.timetables.getDepartures('invalid');
} catch (error) {
  if (error instanceof ApiResponseError) {
    console.error(`HTTP ${error.statusCode}: ${error.message}`);
  }
  if (error instanceof ValidationError) {
    console.error('API shape changed:', error.message);
  }
}
```
