/**
 * MCP tool for GTFS-RT VehiclePositions.
 *
 * Exposes real-time vehicle positions from GTFS Sweden 3 feeds, covering
 * all Swedish transit operators with real-time data. Returns GPS locations,
 * bearing, speed, and occupancy for vehicles currently in service.
 * Updated every 3 seconds.
 *
 * Requires TRAFIKLAB_GTFS_KEY.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { API_DESCRIPTIONS, getApiDescription } from '@transit-se/sdk';
import type { GtfsVehiclePositionsApi } from '@transit-se/sdk/gtfs';
import { z } from 'zod';
import { formatGtfsVehiclePositions } from '../../formatting.js';
import { GTFS_OPERATORS } from './operators.js';

export function registerGtfsVehiclePositionsTools(
  server: McpServer,
  vehiclePositionsApi: GtfsVehiclePositionsApi,
): void {
  server.tool(
    'gtfs_vehicle_positions',
    getApiDescription(API_DESCRIPTIONS.gtfs_vehicle_positions),
    {
      operator: z
        .enum(GTFS_OPERATORS)
        .describe(API_DESCRIPTIONS.gtfs_vehicle_positions.params.operator),
    },
    async ({ operator }) => {
      const result = await vehiclePositionsApi.getVehiclePositions(operator);
      return {
        content: [{ type: 'text', text: formatGtfsVehiclePositions(result, operator) }],
      };
    },
  );
}
