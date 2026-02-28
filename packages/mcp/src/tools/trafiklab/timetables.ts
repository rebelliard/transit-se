/**
 * MCP tools for the Trafiklab Timetables API.
 *
 * These tools provide real-time departures and arrivals for any Swedish
 * public transport stop. They need a stop area ID — use trafiklab_search_stops
 * first if you only have a station name.
 *
 * Both tools require a TRAFIKLAB_API_KEY.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { API_DESCRIPTIONS, getApiDescription, type TransitClient } from '@transit-se/sdk';
import { z } from 'zod';
import { formatTrafiklabArrivals, formatTrafiklabDepartures } from '../../formatting.js';

export function registerTrafiklabTimetableTools(server: McpServer, client: TransitClient): void {
  /**
   * trafiklab_get_departures — Real-time departures from a stop.
   *
   * Returns the next 60 minutes of departures including real-time delays,
   * cancellations, platform info, and service alerts.
   */
  server.tool(
    'trafiklab_get_departures',
    getApiDescription(API_DESCRIPTIONS.trafiklab_get_departures),
    {
      area_id: z.string().describe(API_DESCRIPTIONS.trafiklab_get_departures.params.area_id),
      time: z.string().optional().describe(API_DESCRIPTIONS.trafiklab_get_departures.params.time),
    },
    async ({ area_id, time }) => {
      const result = await client.timetables.getDepartures(area_id, time);
      return {
        content: [{ type: 'text', text: formatTrafiklabDepartures(result) }],
      };
    },
  );

  /**
   * trafiklab_get_arrivals — Real-time arrivals at a stop.
   *
   * Same as trafiklab_get_departures but for incoming vehicles.
   */
  server.tool(
    'trafiklab_get_arrivals',
    getApiDescription(API_DESCRIPTIONS.trafiklab_get_arrivals),
    {
      area_id: z.string().describe(API_DESCRIPTIONS.trafiklab_get_arrivals.params.area_id),
      time: z.string().optional().describe(API_DESCRIPTIONS.trafiklab_get_arrivals.params.time),
    },
    async ({ area_id, time }) => {
      const result = await client.timetables.getArrivals(area_id, time);
      return {
        content: [{ type: 'text', text: formatTrafiklabArrivals(result) }],
      };
    },
  );
}
