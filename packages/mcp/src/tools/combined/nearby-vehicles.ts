/**
 * MCP tool for finding vehicles near a Stockholm location.
 *
 * Combines GTFS-RT vehicle positions with SL stop point data to
 * return a table of nearby vehicles classified by transport mode
 * (metro, bus, tram, etc.).
 *
 * Requires TRAFIKLAB_GTFS_KEY.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { API_DESCRIPTIONS, getApiDescription } from '@transit-se/sdk';
import type { CombinedSLNearbyVehiclesApi } from '@transit-se/sdk/combined';
import { z } from 'zod';
import { formatCombinedSLNearbyVehicles } from '../../formatting.js';

export function registerCombinedSLNearbyVehiclesTools(
  server: McpServer,
  nearbyVehiclesApi: CombinedSLNearbyVehiclesApi,
): void {
  const desc = API_DESCRIPTIONS.combined_nearby_vehicles;

  server.tool(
    'combined_nearby_vehicles',
    getApiDescription(desc),
    {
      site_name: z.string().optional().describe(desc.params.site_name),
      site_id: z.number().optional().describe(desc.params.site_id),
      latitude: z.number().optional().describe(desc.params.latitude),
      longitude: z.number().optional().describe(desc.params.longitude),
      radius_km: z.number().min(0).max(20).optional().describe(desc.params.radius_km),
    },
    async ({ site_name, site_id, latitude, longitude, radius_km }) => {
      const result = await nearbyVehiclesApi.getNearbyVehicles({
        siteName: site_name,
        siteId: site_id,
        latitude,
        longitude,
        radiusKm: radius_km,
      });
      return {
        content: [{ type: 'text', text: formatCombinedSLNearbyVehicles(result) }],
      };
    },
  );
}
