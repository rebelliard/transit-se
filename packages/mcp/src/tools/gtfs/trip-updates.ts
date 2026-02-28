/**
 * MCP tool for GTFS-RT TripUpdates.
 *
 * Exposes real-time trip updates from GTFS Sweden 3 feeds, covering all
 * Swedish transit operators with real-time data (UL, Skånetrafiken, etc.).
 *
 * Provides per-trip delay predictions, cancellations, and per-stop
 * arrival/departure times. Updated every 15 seconds.
 *
 * Requires TRAFIKLAB_GTFS_KEY.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { API_DESCRIPTIONS, getApiDescription } from '@transit-se/sdk';
import type { GtfsTripUpdatesApi } from '@transit-se/sdk/gtfs';
import { z } from 'zod';
import { formatGtfsTripUpdates } from '../../formatting.js';
import { GTFS_OPERATORS } from './operators.js';

export function registerGtfsTripUpdatesTools(
  server: McpServer,
  tripUpdatesApi: GtfsTripUpdatesApi,
): void {
  server.tool(
    'gtfs_trip_updates',
    getApiDescription(API_DESCRIPTIONS.gtfs_trip_updates),
    {
      operator: z.enum(GTFS_OPERATORS).describe(API_DESCRIPTIONS.gtfs_trip_updates.params.operator),
    },
    async ({ operator }) => {
      const result = await tripUpdatesApi.getTripUpdates(operator);
      return {
        content: [{ type: 'text', text: formatGtfsTripUpdates(result, operator) }],
      };
    },
  );
}
