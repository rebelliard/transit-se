# Transit SE

Monorepo for Swedish public transport tools, built on [Trafiklab](https://www.trafiklab.se/) APIs.

## Supported APIs

| API                                                                                                                                            | What it does                                      | Auth                 | Coverage  | Update frequency |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------- | --------- | ---------------- |
| [**SL Transport**](https://www.trafiklab.se/api/our-apis/sl/transport/)                                                                        | Departures, sites, lines, stop points             | None                 | Stockholm | Real-time        |
| [**SL Deviations**](https://www.trafiklab.se/api/our-apis/sl/deviations/)                                                                      | Disruptions, reroutes, maintenance                | None                 | Stockholm | Real-time        |
| [**Trafiklab Stops**](https://www.trafiklab.se/api/our-apis/trafiklab-realtime-apis/stop-lookup/)                                              | Search stops by name, list all stops              | `TRAFIKLAB_API_KEY`  | Sweden    | Static           |
| [**Trafiklab Timetables**](https://www.trafiklab.se/api/our-apis/trafiklab-realtime-apis/timetables/)                                          | Departures and arrivals with delays               | `TRAFIKLAB_API_KEY`  | Sweden    | Real-time        |
| [**GTFS-RT Alerts**](https://www.trafiklab.se/api/gtfs-datasets/gtfs-sweden/realtime-specification/#/GTFS-RT/fetchServiceAlerts)               | Service alerts (disruptions, reroutes)            | `TRAFIKLAB_GTFS_KEY` | Sweden    | ~15 sec          |
| [**GTFS-RT Trip Updates**](https://www.trafiklab.se/api/gtfs-datasets/gtfs-sweden/realtime-specification/#/GTFS-RT/fetchTripUpdates)           | Per-trip delays, cancellations, predictions       | `TRAFIKLAB_GTFS_KEY` | Sweden    | ~15 sec          |
| [**GTFS-RT Vehicle Positions**](https://www.trafiklab.se/api/gtfs-datasets/gtfs-sweden/realtime-specification/#/GTFS-RT/fetchVehiclePositions) | Live GPS, speed, bearing, occupancy               | `TRAFIKLAB_GTFS_KEY` | Sweden    | ~3 sec           |
| **Combined Nearby**                                                                                                                            | Vehicles near a location with mode classification | `TRAFIKLAB_GTFS_KEY` | Stockholm | Real-time        |

> Stockholm (SL) APIs work without any keys. For other Swedish operators (Uppsala, Skane, etc.), use the GTFS-RT APIs.

## Packages

| Package           | Description                                       | Docs                               |
| ----------------- | ------------------------------------------------- | ---------------------------------- |
| `@transit-se/sdk` | TypeScript SDK for Trafiklab realtime APIs        | [README](./packages/sdk/README.md) |
| `@transit-se/mcp` | MCP server — exposes the SDK as AI-callable tools | [README](./packages/mcp/README.md) |

## Quick Start

### SDK

```typescript
import { TransitClient } from '@transit-se/sdk';

const client = new TransitClient({ apiKey: process.env.TRAFIKLAB_API_KEY! });

const stops = await client.stops.searchByName('T-Centralen');
const deps = await client.timetables.getDepartures('740000001');
const slDeps = await client.sl.getDepartures(9192); // no key needed
```

See the [SDK README](./packages/sdk/README.md) for the full API reference.

### MCP Server

Add to your MCP client config (no installation required):

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

See the [MCP README](./packages/mcp/README.md) for detailed setup instructions for Claude Desktop, Claude Code, and Cursor.

## Credentials

The **SL** APIs (Transport, Deviations) work without any API key. The other APIs each require a Trafiklab key:

| Key                  | Trafiklab product       | Unlocks                                                          |
| -------------------- | ----------------------- | ---------------------------------------------------------------- |
| `TRAFIKLAB_API_KEY`  | Trafiklab Realtime APIs | Stop Lookup, Timetables                                          |
| `TRAFIKLAB_GTFS_KEY` | GTFS Sweden 3 Realtime  | Service Alerts, Trip Updates, Vehicle Positions, Nearby Vehicles |

1. Sign up at [developer.trafiklab.se](https://developer.trafiklab.se)
2. Create a project and enable the API products you need
3. Copy your API keys from the project dashboard

```bash
cp .env.example .env
# Edit .env and paste your keys
```

## Development

```bash
git clone git@github.com:rebelliard/transit-se.git
cd transit-se
bun install
```

| Command                                    | Description                   |
| ------------------------------------------ | ----------------------------- |
| `bun run check`                            | Type-check + lint             |
| `bun run test`                             | Run all tests                 |
| `bun run --filter @transit-se/mcp inspect` | Open the MCP Inspector web UI |
| `bun run --filter @transit-se/sdk inspect` | Open the SDK Swagger UI       |

## License

MIT — Data provided by [Trafiklab.se](https://www.trafiklab.se/) under [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).
