/**
 * MCP tool for the SL Deviations API.
 *
 * Exposes service alerts and disruptions for Stockholm's transit network.
 * No API key required.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { API_DESCRIPTIONS, getApiDescription } from '@transit-se/sdk';
import type { SLDeviationTransportMode, SLDeviationsApi } from '@transit-se/sdk/sl';
import { z } from 'zod';
import { formatSLDeviations } from '../../formatting.js';

const TRANSPORT_MODES = ['BUS', 'METRO', 'TRAM', 'TRAIN', 'SHIP', 'FERRY', 'TAXI'] as const;

export function registerSLDeviationsTools(server: McpServer, deviations: SLDeviationsApi): void {
  /**
   * sl_deviations — Active service alerts across SL's network.
   *
   * Returns disruption messages: elevator/escalator outages, track works,
   * cancellations, timetable changes, and other incidents.
   * Filter by transport mode, line ID, or site ID to narrow results.
   */
  server.tool(
    'sl_deviations',
    getApiDescription(API_DESCRIPTIONS.sl_deviations),
    {
      transport_modes: z
        .array(z.enum(TRANSPORT_MODES))
        .optional()
        .describe(API_DESCRIPTIONS.sl_deviations.params.transport_modes),
      line_ids: z
        .array(z.string())
        .optional()
        .describe(API_DESCRIPTIONS.sl_deviations.params.line_ids),
      site_ids: z
        .array(z.string())
        .optional()
        .describe(API_DESCRIPTIONS.sl_deviations.params.site_ids),
      future: z.boolean().optional().describe(API_DESCRIPTIONS.sl_deviations.params.future),
    },
    async ({ transport_modes, line_ids, site_ids, future }) => {
      const parsedLineIds = line_ids?.map(Number);
      const parsedSiteIds = site_ids?.map(Number);
      const result = await deviations.getDeviations({
        transportModes: transport_modes as Array<SLDeviationTransportMode> | undefined,
        lineIds: parsedLineIds,
        siteIds: parsedSiteIds,
        future,
      });

      const context = buildContext(transport_modes, parsedLineIds, parsedSiteIds);
      return {
        content: [{ type: 'text', text: formatSLDeviations(result, context) }],
      };
    },
  );
}

function buildContext(
  modes?: Array<string>,
  lineIds?: Array<number>,
  siteIds?: Array<number>,
): string | undefined {
  const parts: Array<string> = [];
  if (modes && modes.length > 0) {
    parts.push(modes.join('/'));
  }
  if (lineIds && lineIds.length > 0) {
    parts.push(`lines ${lineIds.join(', ')}`);
  }
  if (siteIds && siteIds.length > 0) {
    parts.push(`sites ${siteIds.join(', ')}`);
  }
  return parts.length > 0 ? parts.join(', ') : undefined;
}
