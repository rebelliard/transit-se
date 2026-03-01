# @transit-se/mcp

MCP (Model Context Protocol) server for Swedish public transit. Exposes [Trafiklab](https://www.trafiklab.se/) real-time APIs as tools that AI assistants like Claude can call directly.

Built on top of [`@transit-se/sdk`](https://www.npmjs.com/package/@transit-se/sdk).

## Table of Contents

- [Quick Start](#quick-start)
- [Available Tools](#available-tools)
  - [SL tools (no API key required)](#sl-tools-no-api-key-required)
  - [Trafiklab tools (require `TRAFIKLAB_API_KEY`)](#trafiklab-tools-require-trafiklab_api_key)
  - [GTFS tools (require `TRAFIKLAB_GTFS_KEY`)](#gtfs-tools-require-trafiklab_gtfs_key)
  - [Combined tools (require `TRAFIKLAB_GTFS_KEY`)](#combined-tools-require-trafiklab_gtfs_key)
  - [SDK methods not exposed as MCP tools](#sdk-methods-not-exposed-as-mcp-tools)
  - [Typical workflow](#typical-workflow)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [License](#license)

---

## Quick Start

### 1. Get API keys (optional)

Some tools require [Trafiklab](https://developer.trafiklab.se) API keys. Stockholm (SL) tools work without any keys.

1. Sign up at [developer.trafiklab.se](https://developer.trafiklab.se)
2. Create a project
3. Enable the API products you need:
   - **Trafiklab Realtime APIs** → for `trafiklab_search_stops`, `trafiklab_get_departures`, `trafiklab_get_arrivals`
   - **GTFS Sweden 3 Realtime** → for `gtfs_service_alerts`, `gtfs_trip_updates`, `gtfs_vehicle_positions`, `combined_nearby_vehicles`
4. Copy each API key

### 2. Try it out

To interactively test tools in a web UI, use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
# From the repo root
bun run --filter @transit-se/mcp inspect
```

### 3. Configure your MCP client

Add the server to your MCP client configuration. Both keys are optional — without them, only the SL tools (Stockholm) are available.

#### Via npx (recommended)

No installation needed — `npx` downloads and runs the package automatically. Works with any MCP client that supports the `command` + `args` format.

- **Claude Desktop** — edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows).
- **Claude Code** — add to `.mcp.json` in your project root or `~/.claude/settings.json`.
- **Cursor** — add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "transit-se": {
      "command": "npx",
      "args": ["-y", "@transit-se/mcp"],
      "env": {
        "TRAFIKLAB_API_KEY": "your-key-here",
        "TRAFIKLAB_GTFS_KEY": "your-key-here"
      }
    }
  }
}
```

#### From source (for development)

If you've cloned the repo and want to run from source:

```json
{
  "mcpServers": {
    "transit-se": {
      "command": "node",
      "args": ["/absolute/path/to/packages/mcp/dist/index.js"],
      "env": {
        "TRAFIKLAB_API_KEY": "your-key-here",
        "TRAFIKLAB_GTFS_KEY": "your-key-here"
      }
    }
  }
}
```

> Build first with `bun run --filter @transit-se/mcp build`.

---

## Available Tools

### SL tools (no API key required)

| Tool            | Description                    | Key Parameters                                                                                                                |
| --------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `sl_departures` | Stockholm (SL) departures      | `site_id`: SL site ID (e.g. 9192), `forecast?`: minutes, `direction?`: 1 or 2, `line?`: line ID, `transport?`: METRO/BUS/etc. |
| `sl_sites`      | Search SL stations (cached)    | `query?`: station name                                                                                                        |
| `sl_deviations` | Service disruptions and alerts | `transport_modes?`: e.g. `["METRO"]`, `line_ids?`, `site_ids?`, `future?`                                                     |

### Trafiklab tools (require `TRAFIKLAB_API_KEY`)

| Tool                       | Description          | Key Parameters                                |
| -------------------------- | -------------------- | --------------------------------------------- |
| `trafiklab_search_stops`   | Search stops by name | `query`: stop name (e.g. "T-Centralen")       |
| `trafiklab_get_departures` | Real-time departures | `area_id`: stop ID, `time?`: YYYY-MM-DDTHH:mm |
| `trafiklab_get_arrivals`   | Real-time arrivals   | `area_id`: stop ID, `time?`: YYYY-MM-DDTHH:mm |

### GTFS tools (require `TRAFIKLAB_GTFS_KEY`)

| Tool                     | Description                                              | Key Parameters                                       |
| ------------------------ | -------------------------------------------------------- | ---------------------------------------------------- |
| `gtfs_service_alerts`    | Service alerts for any Swedish operator (GTFS-RT)        | `operator`: e.g. `"ul"` (Uppsala), `"skane"` (Skåne) |
| `gtfs_trip_updates`      | Real-time trip delays and cancellations for any operator | `operator`: e.g. `"ul"` (Uppsala), `"skane"` (Skåne) |
| `gtfs_vehicle_positions` | Real-time GPS positions for vehicles in service          | `operator`: e.g. `"ul"` (Uppsala), `"skane"` (Skåne) |

> **Note:** For Stockholm (SL) disruptions, prefer `sl_deviations` — it provides richer data and requires no API key.

### Combined tools (require `TRAFIKLAB_GTFS_KEY`)

| Tool                       | Description                                                                | Key Parameters                                                                       |
| -------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `combined_nearby_vehicles` | Find vehicles near a Stockholm location with transport mode classification | `site_name?`, `site_id?`, `latitude?`+`longitude?`, `radius_km?` (0–20, default 1.0) |

> Combines GTFS-RT vehicle positions with SL stop point data to classify each vehicle as metro, bus, tram, train, ferry, or ship.
>
> **Location resolution** — provide exactly one of these (if multiple are given, precedence is `site_id` > `site_name` > `latitude`+`longitude`):
>
> - `site_name` — SL station name (e.g. `"Solna centrum"`), resolved via cached site data
> - `site_id` — SL site ID (e.g. `9305`), use `sl_sites` to find IDs
> - `latitude` + `longitude` — raw coordinates; the nearest SL site is auto-detected

### SDK methods not exposed as MCP tools

The following SDK methods are available for programmatic use but intentionally excluded from the MCP server. They return bulk data that is useful for apps (UI lists, caches) but wasteful for AI agents, which reason better with focused, filtered results.

| SDK Method                     | Why not exposed                                                             |
| ------------------------------ | --------------------------------------------------------------------------- |
| `sl.getLines()`                | Returns all SL lines. Departures already include line info per station.     |
| `sl.getSites()`                | Full site response. `sl_sites` uses the cached/lightweight version instead. |
| `sl.getStopPoints()`           | Bulk stop point data. Useful for maps, not for agent queries.               |
| `sl.getTransportAuthorities()` | Admin metadata. No agent use case.                                          |
| `stops.listAll()`              | Returns thousands of stops. Use `trafiklab_search_stops` to search by name. |

### Typical workflow

The AI will typically chain tools like this:

1. **User**: "When does the next train leave from Slussen?"
2. **AI calls** `sl_sites` with `query: "Slussen"` → gets site ID 9192
3. **AI calls** `sl_departures` with `site_id: 9192` → gets real-time departures
4. **AI responds** with formatted departure information

---

## Environment Variables

| Variable             | Trafiklab product       | Required | Description                                                                                |
| -------------------- | ----------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `TRAFIKLAB_API_KEY`  | Trafiklab Realtime APIs | No       | Stop lookup, departures, arrivals. Without it, only the SL tools work.                     |
| `TRAFIKLAB_GTFS_KEY` | GTFS Sweden 3 Realtime  | No       | GTFS-RT feeds (service alerts, trip updates, vehicle positions, nearby vehicles).          |
| `TRAFIKLAB_VALIDATE` | —                       | No       | Set to `"true"` to enable runtime response validation via Valibot schemas. Off by default. |

### Without API Keys

If no API keys are set, the server still starts and registers all tools. The 3 SL tools work normally. The Trafiklab and GTFS tools return helpful messages explaining how to get and configure keys.

---

## Development

### Build

The MCP server is compiled to JavaScript for Node.js compatibility, so it can be run via `npx` without requiring Bun.

```bash
# Build the MCP package (compiles src/ → dist/)
bun run --filter @transit-se/mcp build

# Build is also run automatically before npm publish via prepublishOnly
```

### Type-check

```bash
# Type-check just the MCP package
bun run --filter @transit-se/mcp tc

# Type-check everything (SDK + MCP)
bun run tc
```

### Run tests

```bash
# All tests (SDK + MCP)
bun test

# MCP tests only
bun test packages/mcp/
```

### Lint

```bash
bun run lint
```

### Format

```bash
bun run format
```

---

## How It Works

```
┌─────────────────┐    stdio     ┌──────────────────┐    HTTPS    ┌──────────────┐
│  Claude / IDE   │ ◄──────────► │  @transit-se/mcp │ ──────────► │  Trafiklab   │
│  (MCP Client)   │   JSON-RPC   │  (this package)  │   REST API  │  APIs        │
└─────────────────┘              └──────────────────┘             └──────────────┘
                                        │
                                        ▼
                                 @transit-se/sdk
                                 (TransitClient)
```

The MCP server is a thin bridge between AI assistants and the transit APIs:

1. **MCP Client** (Claude, Cursor, etc.) discovers the available tools via the MCP protocol
2. **Tool calls** arrive as JSON-RPC messages over stdin
3. **This server** validates parameters (via Zod schemas), calls the appropriate SDK method, and formats the response as human-readable text
4. **Formatted results** go back to the AI, which uses them to answer the user

### Why formatted text instead of raw JSON?

AI assistants work better with concise, structured text than massive JSON blobs. The formatters turn API responses into clean departure boards and station lists that the model can reason about efficiently.

---

## Project Structure

```
packages/mcp/
├── src/
│   ├── index.ts                              # Server entry — creates McpServer, registers tools, connects stdio
│   ├── index.test.ts                         # Server integration tests
│   ├── formatting.ts                         # Human-readable output formatters
│   ├── formatting.test.ts                    # Formatter tests
│   └── tools/
│       ├── sl/
│       │   ├── transport.ts                  # sl_departures, sl_sites
│       │   ├── transport.test.ts
│       │   ├── deviations.ts                 # sl_deviations
│       │   └── deviations.test.ts
│       ├── trafiklab/
│       │   ├── stop-lookup.ts                # trafiklab_search_stops
│       │   ├── stop-lookup.test.ts
│       │   ├── timetables.ts                 # trafiklab_get_departures, trafiklab_get_arrivals
│       │   └── timetables.test.ts
│       ├── gtfs/
│       │   ├── operators.ts                  # Shared GTFS operator list (re-exported from SDK)
│       │   ├── service-alerts.ts             # gtfs_service_alerts
│       │   ├── service-alerts.test.ts
│       │   ├── trip-updates.ts               # gtfs_trip_updates
│       │   ├── trip-updates.test.ts
│       │   ├── vehicle-positions.ts          # gtfs_vehicle_positions
│       │   └── vehicle-positions.test.ts
│       └── combined/
│           ├── nearby-vehicles.ts            # combined_nearby_vehicles
│           └── nearby-vehicles.test.ts
├── package.json
├── tsconfig.json
└── README.md                                 # This file
```

---

## License

MIT
