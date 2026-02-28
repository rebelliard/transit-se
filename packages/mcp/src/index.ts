#!/usr/bin/env node
/**
 * @transit-se/mcp — MCP server for Swedish public transit.
 *
 * This is the entry point. It:
 *  1. Reads the TRAFIKLAB_API_KEY from the environment (passed via MCP config)
 *  2. Creates a TransitClient from @transit-se/sdk
 *  3. Registers all tools with the MCP server
 *  4. Connects via stdio transport so Claude / Cursor / any MCP client can call the tools
 *
 * Run it directly:
 *   TRAFIKLAB_API_KEY=xxx bun run packages/mcp/src/index.ts
 *
 * Or configure it in your MCP client — see README.md for details.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { TransitClient } from '@transit-se/sdk';
import { CombinedSLNearbyVehiclesApi } from '@transit-se/sdk/combined';
import {
  GtfsServiceAlertsApi,
  GtfsTripUpdatesApi,
  GtfsVehiclePositionsApi,
} from '@transit-se/sdk/gtfs';
import { SLDeviationsApi, SLTransportApi } from '@transit-se/sdk/sl';
import pkg from '../package.json';
import { registerCombinedSLNearbyVehiclesTools } from './tools/combined/nearby-vehicles.js';
import { registerGtfsServiceAlertsTools } from './tools/gtfs/service-alerts.js';
import { registerGtfsTripUpdatesTools } from './tools/gtfs/trip-updates.js';
import { registerGtfsVehiclePositionsTools } from './tools/gtfs/vehicle-positions.js';
import { registerSLDeviationsTools } from './tools/sl/deviations.js';
import { registerSLTransportTools } from './tools/sl/transport.js';
import { registerTrafiklabStopLookupTools } from './tools/trafiklab/stop-lookup.js';
import { registerTrafiklabTimetableTools } from './tools/trafiklab/timetables.js';

// ─── Configuration ──────────────────────────────────────────────────

const API_KEY = process.env.TRAFIKLAB_API_KEY;
const GTFS_KEY = process.env.TRAFIKLAB_GTFS_KEY;
const VALIDATE = process.env.TRAFIKLAB_VALIDATE === 'true';

// ─── SDK Clients ────────────────────────────────────────────────────

// SL Transport API works without a key — always available
const sl = new SLTransportApi({ validate: VALIDATE });

// SL Deviations API works without a key — always available
const deviationsApi = new SLDeviationsApi({ validate: VALIDATE });

// Full TransitClient requires an API key. If missing, we still start
// the server but only register the SL tools (which are keyless).
const client = API_KEY ? new TransitClient({ apiKey: API_KEY, validate: VALIDATE }) : null;

// GTFS-RT APIs require a separate GTFS Sweden 3 key.
const gtfsAlerts = GTFS_KEY ? new GtfsServiceAlertsApi({ apiKey: GTFS_KEY }) : null;
const gtfsTripUpdates = GTFS_KEY ? new GtfsTripUpdatesApi({ apiKey: GTFS_KEY }) : null;
const gtfsVehiclePositions = GTFS_KEY ? new GtfsVehiclePositionsApi({ apiKey: GTFS_KEY }) : null;

// Combined APIs merge GTFS + SL data (needs GTFS key for vehicle positions).
const combinedNearbyVehicles = gtfsVehiclePositions
  ? new CombinedSLNearbyVehiclesApi({
      vehiclePositionsApi: gtfsVehiclePositions,
      slTransportApi: sl,
    })
  : null;

// ─── MCP Server ─────────────────────────────────────────────────────

const server = new McpServer({
  name: pkg.name,
  version: pkg.version,
});

// Always register SL tools (no key needed)
registerSLTransportTools(server, sl);
registerSLDeviationsTools(server, deviationsApi);

if (client) {
  // Full API key available — register all tools
  registerTrafiklabStopLookupTools(server, client);
  registerTrafiklabTimetableTools(server, client);
} else {
  // No API key — register placeholder tools that explain the situation
  const noKeyMessage = [
    'This tool requires a TRAFIKLAB_API_KEY which is not configured.',
    '',
    'To fix this, add the key to your MCP server configuration:',
    '',
    '  "env": { "TRAFIKLAB_API_KEY": "your-key-here" }',
    '',
    'Get a free key at: https://developer.trafiklab.se',
    '  1. Create an account',
    '  2. Create a project',
    '  3. Enable "Trafiklab Realtime APIs"',
    '  4. Copy the API key',
    '',
    'Meanwhile, the sl_departures, sl_sites, and sl_deviations tools work without a key.',
  ].join('\n');

  for (const [name, desc] of [
    [
      'trafiklab_search_stops',
      'Search for Swedish public transport stops by name. (Requires TRAFIKLAB_API_KEY)',
    ],
    [
      'trafiklab_get_departures',
      'Get real-time departures from a Swedish transit stop. (Requires TRAFIKLAB_API_KEY)',
    ],
    [
      'trafiklab_get_arrivals',
      'Get real-time arrivals at a Swedish transit stop. (Requires TRAFIKLAB_API_KEY)',
    ],
  ] as const) {
    server.tool(name, desc, async () => ({
      content: [{ type: 'text', text: noKeyMessage }],
    }));
  }
}

// GTFS-RT tools (separate key)
if (gtfsAlerts && gtfsTripUpdates && gtfsVehiclePositions) {
  registerGtfsServiceAlertsTools(server, gtfsAlerts);
  registerGtfsTripUpdatesTools(server, gtfsTripUpdates);
  registerGtfsVehiclePositionsTools(server, gtfsVehiclePositions);

  if (combinedNearbyVehicles) {
    registerCombinedSLNearbyVehiclesTools(server, combinedNearbyVehicles);
  }
} else {
  const noGtfsKeyMessage = [
    'This tool requires a TRAFIKLAB_GTFS_KEY which is not configured.',
    '',
    'To fix this, add the key to your MCP server configuration:',
    '',
    '  "env": { "TRAFIKLAB_GTFS_KEY": "your-key-here" }',
    '',
    'Get a free key at: https://developer.trafiklab.se',
    '  1. Create an account',
    '  2. Create a project',
    '  3. Enable "GTFS Sweden 3" (under GTFS Datasets)',
    '  4. Copy the API key',
    '',
    'For Stockholm disruptions, sl_deviations works without any key.',
  ].join('\n');

  for (const [name, desc] of [
    [
      'gtfs_service_alerts',
      'Get service alerts for Swedish transit operators (Requires TRAFIKLAB_GTFS_KEY)',
    ],
    [
      'gtfs_trip_updates',
      'Get real-time trip updates for Swedish transit operators (Requires TRAFIKLAB_GTFS_KEY)',
    ],
    [
      'gtfs_vehicle_positions',
      'Get real-time vehicle positions for Swedish transit operators (Requires TRAFIKLAB_GTFS_KEY)',
    ],
    [
      'combined_nearby_vehicles',
      'Find vehicles near a Stockholm location with transport mode (Requires TRAFIKLAB_GTFS_KEY)',
    ],
  ] as const) {
    server.tool(name, desc, async () => ({
      content: [{ type: 'text', text: noGtfsKeyMessage }],
    }));
  }
}

// ─── Connect ────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
