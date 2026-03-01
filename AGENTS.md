# Agent Instructions

Guidelines for AI agents working on this repository.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Conventions](#conventions)
- [Key Commands](#key-commands)
- [Adding a New API](#adding-a-new-api)
- [Adding a New MCP Tool](#adding-a-new-mcp-tool)
- [Choosing Between SL and GTFS APIs](#choosing-between-sl-and-gtfs-apis)
- [Credentials](#credentials)
- [Token Usage](#token-usage)

## Project Overview

This is a Bun monorepo containing TypeScript packages for interacting with Swedish public transport APIs (Trafiklab). The primary focus is Stockholm (SL operator).

## Architecture

- **Monorepo** using Bun workspaces (`packages/*`)
- **`packages/sdk`** — Core SDK wrapping Trafiklab APIs
  - `src/api/sl/` — SL API classes (transport, deviations) + barrel `index.ts`
  - `src/api/trafiklab/` — Trafiklab API classes (stop-lookup, timetables) + barrel `index.ts`
  - `src/api/gtfs/` — GTFS-RT API classes (service-alerts, trip-updates, vehicle-positions) + barrel `index.ts`
  - `src/api/combined/` — Combined API classes (nearby-vehicles) + barrel `index.ts` — custom high-level APIs combining multiple data sources
  - `src/api/base.ts` — `BaseApi` base class (JSON APIs) with validation, usage tracking
  - `src/api/gtfs/base.ts` — `GtfsBaseApi` base class (protobuf APIs) with usage tracking
  - `src/types/sl/`, `src/types/trafiklab/`, `src/types/gtfs/`, `src/types/combined/` — TypeScript interfaces matching API response shapes
  - `src/schemas/sl/`, `src/schemas/trafiklab/` — Valibot schemas mirroring types for opt-in runtime validation
  - `src/client.ts` — `TransitClient` facade combining all APIs
  - `src/errors.ts` — Custom error hierarchy (`ValidationError`, `ApiResponseError`, etc.)
  - `src/__fixtures__/sl/`, `src/__fixtures__/trafiklab/`, `src/__fixtures__/gtfs/`, `src/__fixtures__/combined/` — Shared test fixtures
  - `dev/swagger.ts` — Swagger UI for interactive API exploration
  - Tests are **co-located** next to source files (e.g. `src/api/trafiklab/stop-lookup.test.ts`)
- **`packages/mcp`** — MCP server exposing the SDK as AI-callable tools
  - `src/tools/sl/` — SL tools (transport, deviations)
  - `src/tools/trafiklab/` — Trafiklab tools (stop-lookup, timetables)
  - `src/tools/gtfs/` — GTFS-RT tools (service-alerts, trip-updates, vehicle-positions)
  - `src/tools/combined/` — Combined tools (nearby-vehicles)
  - `src/formatting.ts` — Human-readable output formatters (text, not JSON)
  - `src/index.ts` — Server entry point (reads env vars, registers tools, connects stdio)
  - Tests are **co-located** next to source files
  - Depends on `@transit-se/sdk` (workspace) and `@modelcontextprotocol/sdk`

## Conventions

- **Runtime**: Bun (not Node.js). Use `bun` for all commands.
- **TypeScript**: Strict mode, ESM only, Bundler module resolution (extensionless imports)
- **Formatting**: Prettier (see `.prettierrc`). Pre-commit hook auto-formats staged files.
- **Linting**: ESLint with typescript-eslint (see `eslint.config.js`)
- **Testing**: `bun test`. Tests mock `globalThis.fetch` — never make real HTTP requests in tests. All `it()` descriptions must start with `should` (e.g. `it('should return departures')`). Use `@total-typescript/shoehorn` `fromPartial<T>()` for partial test mocks instead of `as any` or `as unknown as T`.
- **Types**: Match API response shapes exactly. Check Trafiklab docs if unsure. Always run `bun run tc` after making type changes.
- **Exports**: Only export top-level response types/schemas that consumers use directly (e.g. `SLDeparturesResponse`, `SLDeparturesResponseSchema`). Internal building-block types and schemas (sub-interfaces, enum types, helper schemas) should remain unexported — they are implementation details composed into the exported response types.
- **Schemas**: Every type file in `src/types/` has a matching Valibot schema in `src/schemas/`. Keep them in sync.
- **Validation**: Opt-in via `validate: true`. When enabled, `BaseApi.get()` parses responses through Valibot schemas and throws `ValidationError` on mismatch. When disabled (default), responses are cast to TypeScript types with zero overhead and no valibot dependency.
- **Arrays**: Use `Array<T>` syntax, not `T[]`. E.g. `Array<SLDeviationMessage>` instead of `SLDeviationMessage[]`.
- **Errors**: Use custom error classes from `src/errors.ts`, not bare `Error`.

## Key Commands

```bash
bun run tc       # Type-check all packages
bun run check    # Type-check + lint
bun run lint     # Lint all packages
bun run test     # Run all tests
bun run format   # Format with Prettier

bun run --filter @transit-se/sdk build     # Build SDK (tsc → dist/ with .js + .d.ts)
bun run --filter @transit-se/mcp build     # Build MCP (tsc → dist/ for Node.js compatibility)

bun run --filter @transit-se/mcp inspect   # Open MCP Inspector web UI
bun run --filter @transit-se/sdk inspect   # Open SDK Swagger UI
```

### MCP Inspector auth workaround

`@modelcontextprotocol/inspector` v0.21+ added proxy authentication to its Express backend. MCP SDK 1.27+ clients respond to the resulting 401 by initiating an OAuth flow and attempting `POST /register` on the inspector's Express server, which has no such route. This produces a confusing `"Invalid OAuth error response: … Cannot POST /register"` error on every tool call.

The `inspect` script already sets `DANGEROUSLY_OMIT_AUTH=1` to disable the proxy auth requirement. If running the inspector manually, add that variable:

```bash
DANGEROUSLY_OMIT_AUTH=1 npx @modelcontextprotocol/inspector -e TRAFIKLAB_API_KEY=your-key bun run src/index.ts
```

### Publishing

Both packages use `tsc` to build. The SDK emits JS + declaration files; the MCP emits JS only.

- **SDK**: `tsc -p tsconfig.build.json` (separate build config excludes tests/fixtures, sets `rootDir: "src"`)
- **MCP**: Same pattern. The build config also clears workspace `paths` so imports stay as `@transit-se/sdk/*` (resolved from `node_modules` at runtime, not rewritten to relative paths).
- **MCP bin**: Points to `dist/index.js` with a `#!/usr/bin/env node` shebang, so users can run it via `npx @transit-se/mcp` without needing Bun.
- Both packages have `prepublishOnly` scripts that run the build automatically before `npm publish`.
- **Pre-publish checks**: Always run `bun run check && bun run test` before publishing to catch type errors, lint issues, and test failures.
- **Publish order**: SDK first, then MCP. The MCP depends on `@transit-se/sdk`, so publish the SDK, then update the MCP's `@transit-se/sdk` dependency version in `packages/mcp/package.json` before publishing MCP.
- **Version bumping**: Each package has `version:patch`, `version:minor`, `version:major`, and `version:pre` scripts (e.g. `bun run --filter @transit-se/sdk version:patch`). These call `scripts/bump-version.ts` which updates `package.json` and prints the old → new version.
- **Changelogs**: Before publishing, update `packages/sdk/CHANGELOG.md` and/or `packages/mcp/CHANGELOG.md`. Add a new `## <version>` heading at the top (below `# Changelog`) with a bullet list summarizing the changes. If the MCP package only bumps its SDK dependency, note that (e.g. "Bump `@transit-se/sdk` to X.Y.Z (summary of SDK changes)").

## Adding a New API

1. Add types in `src/types/sl/`, `src/types/trafiklab/`, `src/types/gtfs/`, or `src/types/combined/`, re-export from `src/types/index.ts`
2. For JSON APIs: add Valibot schemas in `src/schemas/`. For protobuf APIs (GTFS-RT): skip schemas — protobuf is self-validating. For Combined APIs: skip schemas — they produce computed results, not raw API responses.
3. Create API class in `src/api/sl/`, `src/api/trafiklab/`, `src/api/gtfs/`, or `src/api/combined/` extending `BaseApi` (JSON), `GtfsBaseApi` (protobuf), or standalone (Combined orchestrators)
4. Export from the barrel `index.ts` in the same API folder
5. Add to `TransitClient` in `src/client.ts` (or keep standalone if it uses a separate API key or combines multiple sources)
6. Add test fixtures in `src/__fixtures__/sl/`, `src/__fixtures__/trafiklab/`, `src/__fixtures__/gtfs/`, or `src/__fixtures__/combined/`. Fixtures should use real data fetched from live APIs — not fabricated placeholder values. This ensures types and schemas stay aligned with actual response shapes.
7. Add tests co-located next to the API class (+ validation tests in `src/validation.test.ts` for JSON APIs)
8. Add the route to `packages/sdk/dev/swagger.ts`
9. Update README documentation

Naming conventions: prefix Trafiklab APIs with `Trafiklab` (e.g. `TrafiklabStopGroup`), SL APIs with `SL` (e.g. `SLSite`), GTFS APIs with `Gtfs` (e.g. `GtfsServiceAlert`), and Combined APIs with `CombinedSL` (e.g. `CombinedSLNearbyVehicle`). Files live in `sl/`, `trafiklab/`, `gtfs/`, or `combined/` subfolders — don't repeat the prefix in the filename (e.g. `api/gtfs/service-alerts.ts`, not `api/gtfs/gtfs-service-alerts.ts`).

## Adding a New MCP Tool

When a new SDK method is added, expose it in the MCP server:

1. Add the tool description to `API_DESCRIPTIONS` in `packages/sdk/src/utils/get-api-description.ts`
2. Add the tool in `packages/mcp/src/tools/sl/`, `packages/mcp/src/tools/trafiklab/`, `packages/mcp/src/tools/gtfs/`, or `packages/mcp/src/tools/combined/`
3. Add a formatter in `packages/mcp/src/formatting.ts` (return text, not JSON)
4. Add tests co-located next to the tool file
5. Add the route to `packages/sdk/dev/swagger.ts`
6. Update `packages/mcp/README.md` tool reference table

Tool design rules:

- **One tool = one SDK method.** Let the AI compose simple tools.
- **Descriptions should tell the AI when to use it** and what IDs it needs.
- **Formatters produce concise text**, not raw JSON. The AI reasons better with structured text.
- **SL tools (no key) must always be registered.** Key-requiring tools get placeholder stubs when no key is set.
- **Location queries mean the surrounding area.** When asked about disruptions/departures "at" or "around" a location, search broadly — not just the exact site IDs for that name. Include nearby stops, lines serving the area, and surrounding streets. The `sl_deviations` site_id filter only returns deviations tagged directly to those sites; many relevant disruptions (rerouted buses, skipped nearby stops, delays on lines heading there) won't appear. Prefer fetching all deviations (or filtering by transport mode) and scanning results for relevance, rather than filtering by site_id alone and risking a false "all clear."

## Choosing Between SL and GTFS APIs

- **For Stockholm (SL) disruptions**: always use `sl_deviations`. It requires no API key, returns richer structured data (affected lines, stops, categories), and is updated in real time.
- **For other Swedish operators** (Uppsala/UL, Skåne, Östgötatrafiken, etc.): use `gtfs_service_alerts`. It covers all operators with GTFS-RT support but requires a `TRAFIKLAB_GTFS_KEY`.
- **Don't use `gtfs_service_alerts` for SL** unless specifically asked — the SL-specific API is always better for Stockholm.

## Credentials

- **Never hardcode API keys.** Use `process.env.TRAFIKLAB_API_KEY` and `process.env.TRAFIKLAB_GTFS_KEY`.
- `.env` is gitignored. See `.env.example` for required variables.
- SL Transport and SL Deviations APIs do not require an API key.
- Each key maps to a specific Trafiklab product (enable them in your [Trafiklab project](https://developer.trafiklab.se)):
  - `TRAFIKLAB_API_KEY` → **Trafiklab Realtime APIs** (stop lookup, departures, arrivals)
  - `TRAFIKLAB_GTFS_KEY` → **GTFS Sweden 3 Realtime** (service alerts, trip updates, vehicle positions, combined nearby vehicles)

## Token Usage

The SDK tracks API call counts via `client.getUsage()`. Be mindful of Trafiklab rate limits (Bronze: 25/min, 100K/month).
