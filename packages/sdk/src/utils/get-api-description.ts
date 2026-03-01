/**
 * Shared tool metadata used by both the MCP server and the Swagger API explorer.
 *
 * Single source of truth for tool names, icons, summaries, and descriptions.
 * Import from `@transit-se/sdk` or directly from this file.
 */

export const API_DESCRIPTIONS = {
  sl_sites: {
    icon: '📍',
    summary: 'Search Stockholm (SL) stations by name',
    description:
      'Site lookup — no API key needed. Fetched once from the SL API, then instant. Returns site IDs for sl_departures.',
    params: {
      query: 'Station name to search for, e.g. "Slussen". Omit to list all sites.',
    },
  },
  sl_departures: {
    icon: '🚏',
    summary: 'Get real-time departures from a Stockholm (SL) station',
    description:
      'No API key needed. Includes display times, crowding, and disruptions. Optionally filter by forecast window, direction, line, or transport mode.',
    params: {
      site_id: 'SL site ID, e.g. 9192 for Slussen. Use sl_sites to find IDs.',
      forecast:
        'Forecast window in minutes (min: 5, default: 60). Only return departures within this time window.',
      direction: 'Direction code (1 or 2) to filter by travel direction.',
      line: 'Line ID to show departures for a single line only, e.g. 19 for green metro line 19.',
      transport:
        'Transport mode filter: METRO, TRAM, TRAIN, BUS, SHIP, FERRY, or TAXI. Only return departures for this mode.',
    },
  },
  sl_deviations: {
    icon: '⚠️',
    summary: 'Get active service disruptions for Stockholm (SL) transit',
    description:
      'No API key needed. Filter by transport mode (METRO, BUS, etc.), line ID, or site ID.',
    params: {
      transport_modes: 'Filter by transport mode(s), e.g. ["METRO", "BUS"].',
      line_ids: 'Filter by SL line ID(s), e.g. ["13", "14"] for red metro lines.',
      site_ids: 'Filter by SL site ID(s). Use sl_sites to find IDs.',
      future: 'Include deviations that start in the future. Default: false.',
    },
  },
  trafiklab_search_stops: {
    icon: '🔍',
    summary: 'Search for Swedish public transport stops by name',
    description:
      'Returns stop IDs you can use with trafiklab_get_departures/trafiklab_get_arrivals. Requires TRAFIKLAB_API_KEY.',
    params: {
      query: 'Stop name to search for, e.g. "T-Centralen", "Slussen".',
    },
  },
  trafiklab_get_departures: {
    icon: '🚆',
    summary: 'Get real-time departures from a Swedish transit stop',
    description:
      'Returns next 60 minutes of departures with delays, cancellations, and alerts. Requires TRAFIKLAB_API_KEY.',
    params: {
      area_id:
        'Stop area ID, e.g. "740020749" for T-Centralen metro or "740000001" for Stockholm C trains. Use trafiklab_search_stops to find IDs.',
      time: 'Optional lookup time in YYYY-MM-DDTHH:mm format. Defaults to now.',
    },
  },
  trafiklab_get_arrivals: {
    icon: '⌛️',
    summary: 'Get real-time arrivals at a Swedish transit stop',
    description:
      'Returns next 60 minutes of arrivals with delays, cancellations, and alerts. Requires TRAFIKLAB_API_KEY.',
    params: {
      area_id:
        'Stop area ID, e.g. "740020749" for T-Centralen metro or "740000001" for Stockholm C trains. Use trafiklab_search_stops to find IDs.',
      time: 'Optional lookup time in YYYY-MM-DDTHH:mm format. Defaults to now.',
    },
  },
  gtfs_service_alerts: {
    icon: '🚨',
    summary: 'Get service alerts for any Swedish transit operator (GTFS-RT)',
    description:
      'Covers all Swedish operators with GTFS-RT support: UL (Uppsala), Skånetrafiken, Östgötatrafiken, and more. For Stockholm (SL), prefer sl_deviations instead — it is richer and requires no API key. Requires TRAFIKLAB_GTFS_KEY.',
    params: {
      operator:
        'Operator abbreviation, e.g. "ul" for Uppsala, "skane" for Skåne, "otraf" for Östgötatrafiken. See GTFS_OPERATOR_NAMES for all supported operators.',
    },
  },
  gtfs_trip_updates: {
    icon: '🔄',
    summary: 'Get real-time trip updates for any Swedish transit operator (GTFS-RT)',
    description:
      'Returns per-trip delay predictions, cancellations, and per-stop arrival/departure times. Covers all Swedish operators with GTFS-RT support. Updated every 15 seconds. Requires TRAFIKLAB_GTFS_KEY.',
    params: {
      operator:
        'Operator abbreviation, e.g. "ul" for Uppsala, "skane" for Skåne, "otraf" for Östgötatrafiken. See GTFS_OPERATOR_NAMES for all supported operators.',
    },
  },
  gtfs_vehicle_positions: {
    icon: '📡',
    summary: 'Get real-time vehicle positions for any Swedish transit operator (GTFS-RT)',
    description:
      'Returns GPS locations, bearing, speed, and occupancy for all vehicles currently in service. Covers all Swedish operators with GTFS-RT support. Updated every 3 seconds. Requires TRAFIKLAB_GTFS_KEY.',
    params: {
      operator:
        'Operator abbreviation, e.g. "ul" for Uppsala, "skane" for Skåne, "otraf" for Östgötatrafiken. See GTFS_OPERATOR_NAMES for all supported operators.',
    },
  },
  combined_nearby_vehicles: {
    icon: '📍',
    summary: 'Find vehicles near a Stockholm location with transport mode',
    description:
      'Combines "gtfs_vehicle_positions" with "sl_departures" stop point data to find and classify vehicles near a given station or coordinate. Provide exactly one location: site_name, site_id, or latitude+longitude. Precedence if multiple given: site_id > site_name > lat+lon. Requires TRAFIKLAB_GTFS_KEY.',
    params: {
      site_name:
        'SL station name, e.g. "Solna centrum", "T-Centralen". Resolved via cached site data. Mutually exclusive with site_id and latitude+longitude (if multiple given, site_id wins, then site_name, then lat+lon).',
      site_id:
        'SL site ID, e.g. 9305. Use sl_sites to find IDs. Takes highest precedence if combined with other location params.',
      latitude:
        'Latitude (e.g. 59.3587). Must be provided together with longitude. The nearest SL site is auto-detected. Lowest precedence if site_name or site_id is also given.',
      longitude: 'Longitude (e.g. 17.9976). Must be provided together with latitude.',
      radius_km: 'Search radius in kilometers (0–20). Default: 1.0.',
    },
  },
} as const;

/** Helper to build an MCP-style description string: "icon summary description" */
export function getApiDescription(
  tool: (typeof API_DESCRIPTIONS)[keyof typeof API_DESCRIPTIONS],
): string {
  return `${tool.icon} ${tool.summary} ${tool.description}`;
}
