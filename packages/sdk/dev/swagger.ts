#!/usr/bin/env bun
/**
 * API Explorer — interactive Swagger UI for the transit-se SDK.
 *
 * Wraps every SDK method as a REST endpoint so you can try them
 * from the browser. SL endpoints work without an API key.
 *
 * Usage:
 *   bun run inspect                          # SL endpoints only
 *   TRAFIKLAB_API_KEY=xxx bun run inspect    # + Trafiklab endpoints
 *   TRAFIKLAB_GTFS_KEY=xxx bun run inspect   # + GTFS endpoints
 */

import { swaggerUI } from '@hono/swagger-ui';
import { Hono } from 'hono';
import pkg from '../package.json';
import { CombinedSLNearbyVehiclesApi } from '../src/api/combined';
import { combinedNearbyVehiclesPath } from '../src/api/combined/open-api';
import { GtfsServiceAlertsApi, GtfsTripUpdatesApi, GtfsVehiclePositionsApi } from '../src/api/gtfs';
import {
  gtfsServiceAlertsPath,
  gtfsTripUpdatesPath,
  gtfsVehiclePositionsPath,
} from '../src/api/gtfs/open-api';
import { SLDeviationsApi } from '../src/api/sl/deviations';
import { slDeparturesPath, slDeviationsPath, slSitesPath } from '../src/api/sl/open-api';
import { SLTransportApi } from '../src/api/sl/transport';
import {
  trafiklabArrivalsPath,
  trafiklabDeparturesPath,
  trafiklabStopsSearchPath,
} from '../src/api/trafiklab/open-api';
import { TransitClient } from '../src/client';
import type { GtfsOperator } from '../src/types/gtfs/service-alerts';
import type { SLDeviationTransportMode } from '../src/types/sl/deviations';

const PORT = Number(process.env.PORT) || 3000;
const API_KEY = process.env.TRAFIKLAB_API_KEY;
const GTFS_KEY = process.env.TRAFIKLAB_GTFS_KEY;

const sl = new SLTransportApi();
const deviationsApi = new SLDeviationsApi();
const client = API_KEY ? new TransitClient({ apiKey: API_KEY }) : null;
const gtfsAlerts = GTFS_KEY ? new GtfsServiceAlertsApi({ apiKey: GTFS_KEY }) : null;
const gtfsTripUpdates = GTFS_KEY ? new GtfsTripUpdatesApi({ apiKey: GTFS_KEY }) : null;
const gtfsVehiclePositions = GTFS_KEY ? new GtfsVehiclePositionsApi({ apiKey: GTFS_KEY }) : null;
const combinedNearbyVehicles =
  gtfsVehiclePositions && sl
    ? new CombinedSLNearbyVehiclesApi({
        vehiclePositionsApi: gtfsVehiclePositions,
        slTransportApi: sl,
      })
    : null;

const app = new Hono();

// ─── SL routes (no key required) ─────────────────────────────────────

app.get('/sl/sites', async (c) => {
  const query = c.req.query('query');
  const sites = query ? await sl.searchSitesByName(query) : await sl.getCachedSites();
  return c.json(sites);
});

app.get('/sl/departures/:siteId', async (c) => {
  const siteId = Number(c.req.param('siteId'));
  const forecast = c.req.query('forecast');
  const direction = c.req.query('direction');
  const line = c.req.query('line');
  const transport = c.req.query('transport');

  const result = await sl.getDepartures(siteId, {
    forecast: forecast ? Number(forecast) : undefined,
    direction: direction ? Number(direction) : undefined,
    line: line ? Number(line) : undefined,
    transport: transport as
      | 'METRO'
      | 'TRAM'
      | 'TRAIN'
      | 'BUS'
      | 'SHIP'
      | 'FERRY'
      | 'TAXI'
      | undefined,
  });
  return c.json(result);
});

app.get('/sl/deviations', async (c) => {
  const transportModes = c.req.query('transport_modes');
  const lineIds = c.req.query('line_ids');
  const siteIds = c.req.query('site_ids');
  const future = c.req.query('future');

  const result = await deviationsApi.getDeviations({
    transportModes: transportModes?.split(',').filter(Boolean) as
      | Array<SLDeviationTransportMode>
      | undefined,
    lineIds: lineIds?.split(',').filter(Boolean).map(Number),
    siteIds: siteIds?.split(',').filter(Boolean).map(Number),
    future: future === 'true' ? true : undefined,
  });
  return c.json(result);
});

// ─── Trafiklab routes (key required) ─────────────────────────────────

const NO_KEY_ERROR = {
  error: 'TRAFIKLAB_API_KEY not configured',
  help: 'Set TRAFIKLAB_API_KEY env var. Get a free key at https://developer.trafiklab.se',
  hint: 'SL endpoints (/sl/*) work without a key.',
};

app.get('/trafiklab/stops/search/:query', async (c) => {
  if (!client) {
    return c.json(NO_KEY_ERROR, 403);
  }
  const query = c.req.param('query');
  const result = await client.stops.searchByName(query);
  return c.json(result);
});

app.get('/trafiklab/departures/:areaId', async (c) => {
  if (!client) {
    return c.json(NO_KEY_ERROR, 403);
  }
  const areaId = c.req.param('areaId');
  const time = c.req.query('time');
  const result = await client.timetables.getDepartures(areaId, time);
  return c.json(result);
});

app.get('/trafiklab/arrivals/:areaId', async (c) => {
  if (!client) {
    return c.json(NO_KEY_ERROR, 403);
  }
  const areaId = c.req.param('areaId');
  const time = c.req.query('time');
  const result = await client.timetables.getArrivals(areaId, time);
  return c.json(result);
});

// ─── GTFS routes (GTFS key required) ─────────────────────────────────

const NO_GTFS_KEY_ERROR = {
  error: 'TRAFIKLAB_GTFS_KEY not configured',
  help: 'Set TRAFIKLAB_GTFS_KEY env var. Enable "GTFS Sweden 3 Realtime" at developer.trafiklab.se',
  hint: 'SL endpoints (/sl/*) work without a key.',
};

app.get('/gtfs/service-alerts/:operator', async (c) => {
  if (!gtfsAlerts) {
    return c.json(NO_GTFS_KEY_ERROR, 403);
  }
  const operator = c.req.param('operator') as GtfsOperator;
  const result = await gtfsAlerts.getServiceAlerts(operator);
  return c.json(result);
});

app.get('/gtfs/trip-updates/:operator', async (c) => {
  if (!gtfsTripUpdates) {
    return c.json(NO_GTFS_KEY_ERROR, 403);
  }
  const operator = c.req.param('operator') as GtfsOperator;
  const result = await gtfsTripUpdates.getTripUpdates(operator);
  return c.json(result);
});

app.get('/gtfs/vehicle-positions/:operator', async (c) => {
  if (!gtfsVehiclePositions) {
    return c.json(NO_GTFS_KEY_ERROR, 403);
  }
  const operator = c.req.param('operator') as GtfsOperator;
  const result = await gtfsVehiclePositions.getVehiclePositions(operator);
  return c.json(result);
});

// ─── Combined routes (GTFS key required) ─────────────────────────────

app.get('/combined/nearby-vehicles', async (c) => {
  if (!combinedNearbyVehicles) {
    return c.json(NO_GTFS_KEY_ERROR, 403);
  }
  const siteName = c.req.query('site_name');
  const siteId = c.req.query('site_id');
  const latitude = c.req.query('latitude');
  const longitude = c.req.query('longitude');
  const radiusKm = c.req.query('radius_km');

  const result = await combinedNearbyVehicles.getNearbyVehicles({
    siteName: siteName || undefined,
    siteId: siteId ? Number(siteId) : undefined,
    latitude: latitude ? Number(latitude) : undefined,
    longitude: longitude ? Number(longitude) : undefined,
    radiusKm: radiusKm ? Number(radiusKm) : undefined,
  });
  return c.json(result);
});

// ─── OpenAPI spec ────────────────────────────────────────────────────

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: '@transit-se/sdk API Explorer',
    version: pkg.version,
    description:
      'Interactive explorer for the transit-se SDK.\n\n' +
      '**SL endpoints** work without an API key.\n\n' +
      '**Trafiklab endpoints** require `TRAFIKLAB_API_KEY` — ' +
      (API_KEY ? 'configured.' : 'not set (will return 403).') +
      '\n\n' +
      '**GTFS endpoints** require `TRAFIKLAB_GTFS_KEY` — ' +
      (GTFS_KEY ? 'configured.' : 'not set (will return 403).') +
      '\n\n' +
      '**Combined endpoints** require `TRAFIKLAB_GTFS_KEY` (uses GTFS vehicle positions internally) — ' +
      (GTFS_KEY ? 'configured.' : 'not set (will return 403).'),
  },
  paths: {
    '/sl/sites': slSitesPath,
    '/sl/departures/{siteId}': slDeparturesPath,
    '/sl/deviations': slDeviationsPath,
    '/trafiklab/stops/search/{query}': trafiklabStopsSearchPath,
    '/trafiklab/departures/{areaId}': trafiklabDeparturesPath,
    '/trafiklab/arrivals/{areaId}': trafiklabArrivalsPath,
    '/gtfs/service-alerts/{operator}': gtfsServiceAlertsPath,
    '/gtfs/trip-updates/{operator}': gtfsTripUpdatesPath,
    '/gtfs/vehicle-positions/{operator}': gtfsVehiclePositionsPath,
    '/combined/nearby-vehicles': combinedNearbyVehiclesPath,
  },
};

app.get('/doc', (c) => c.json(openApiSpec));
app.get('/', swaggerUI({ url: '/doc' }));

// ─── Error handling ──────────────────────────────────────────────────

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message }, 500);
});

// ─── Start ───────────────────────────────────────────────────────────

console.log(`\n  @transit-se/sdk API Explorer`);
console.log(`  Swagger UI:   http://localhost:${PORT}`);
console.log(`  OpenAPI spec: http://localhost:${PORT}/doc`);
console.log(`  API key:      ${API_KEY ? 'configured' : 'not set (Trafiklab → 403)'}`);
console.log(`  GTFS key:     ${GTFS_KEY ? 'configured' : 'not set (GTFS → 403)'}`);
console.log(`  SL endpoints work without any keys.\n`);

const url = `http://localhost:${PORT}`;
Bun.spawn(['open', url], { stdout: 'ignore', stderr: 'ignore' });

export default {
  port: PORT,
  fetch: app.fetch,
};
