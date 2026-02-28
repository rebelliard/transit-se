/**
 * MCP tools for the SL Transport API (Stockholm-specific).
 *
 * These tools work WITHOUT an API key since the SL Transport API is public.
 * They provide Stockholm-specific data: departures and site lookups.
 *
 * sl_sites fetches from the SL Transport API and caches results in memory
 * for the lifetime of the server — fast lookups after the initial fetch.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { API_DESCRIPTIONS, getApiDescription } from '@transit-se/sdk';
import type { SLTransportApi } from '@transit-se/sdk/sl';
import { z } from 'zod';
import { formatSLDepartures, formatSLSites } from '../../formatting.js';

export function registerSLTransportTools(server: McpServer, sl: SLTransportApi): void {
  /**
   * sl_departures — Real-time SL departures from a Stockholm station.
   *
   * Includes display times ("3 min"), crowding levels, platform info,
   * and disruption messages. Use sl_sites to find site IDs.
   */
  server.tool(
    'sl_departures',
    getApiDescription(API_DESCRIPTIONS.sl_departures),
    {
      site_id: z.string().describe(API_DESCRIPTIONS.sl_departures.params.site_id),
    },
    async ({ site_id }) => {
      const id = Number(site_id);
      const result = await sl.getDepartures(id);
      return {
        content: [{ type: 'text', text: formatSLDepartures(result, id) }],
      };
    },
  );

  /**
   * sl_sites — Search SL stations.
   *
   * Fetches from the SL API on first call, then cached. Great for
   * resolving "Slussen" → site ID 9192 before calling sl_departures.
   */
  server.tool(
    'sl_sites',
    getApiDescription(API_DESCRIPTIONS.sl_sites),
    {
      query: z.string().optional().describe(API_DESCRIPTIONS.sl_sites.params.query),
    },
    async ({ query }) => {
      const sites = query ? await sl.searchSitesByName(query) : await sl.getCachedSites();
      return {
        content: [{ type: 'text', text: formatSLSites(sites, query) }],
      };
    },
  );
}
