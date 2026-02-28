/**
 * MCP tool for GTFS-RT ServiceAlerts.
 *
 * Exposes service alerts from GTFS Sweden 3 feeds, covering all Swedish
 * transit operators with real-time data (UL, Skånetrafiken, etc.).
 *
 * For Stockholm (SL) disruptions, the sl_deviations tool is preferred —
 * it provides richer data and requires no API key.
 *
 * Requires TRAFIKLAB_GTFS_KEY.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { API_DESCRIPTIONS, getApiDescription } from '@transit-se/sdk';
import type { GtfsServiceAlertsApi } from '@transit-se/sdk/gtfs';
import { z } from 'zod';
import { formatGtfsServiceAlerts } from '../../formatting.js';
import { GTFS_OPERATORS } from './operators.js';

export function registerGtfsServiceAlertsTools(
  server: McpServer,
  alertsApi: GtfsServiceAlertsApi,
): void {
  server.tool(
    'gtfs_service_alerts',
    getApiDescription(API_DESCRIPTIONS.gtfs_service_alerts),
    {
      operator: z
        .enum(GTFS_OPERATORS)
        .describe(API_DESCRIPTIONS.gtfs_service_alerts.params.operator),
    },
    async ({ operator }) => {
      const result = await alertsApi.getServiceAlerts(operator);
      return {
        content: [{ type: 'text', text: formatGtfsServiceAlerts(result, operator) }],
      };
    },
  );
}
