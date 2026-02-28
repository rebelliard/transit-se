/**
 * MCP tool for the Trafiklab Stop Lookup API.
 *
 * Lets the AI search for Swedish public transport stops by name
 * and discover stop IDs needed by other tools (like trafiklab_get_departures).
 *
 * Requires a TRAFIKLAB_API_KEY.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { API_DESCRIPTIONS, getApiDescription, type TransitClient } from '@transit-se/sdk';
import { z } from 'zod';
import { formatTrafiklabStopLookup } from '../../formatting.js';

export function registerTrafiklabStopLookupTools(server: McpServer, client: TransitClient): void {
  /**
   * trafiklab_search_stops — Find stops by name.
   *
   * Use this as the first step when a user mentions a station or stop name.
   * Returns stop IDs that can be passed to trafiklab_get_departures / trafiklab_get_arrivals.
   */
  server.tool(
    'trafiklab_search_stops',
    getApiDescription(API_DESCRIPTIONS.trafiklab_search_stops),
    {
      query: z.string().describe(API_DESCRIPTIONS.trafiklab_search_stops.params.query),
    },
    async ({ query }) => {
      const result = await client.stops.searchByName(query);
      return {
        content: [{ type: 'text', text: formatTrafiklabStopLookup(result) }],
      };
    },
  );
}
