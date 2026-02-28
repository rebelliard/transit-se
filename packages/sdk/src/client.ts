import { SLDeviationsApi } from './api/sl/deviations';
import { SLTransportApi } from './api/sl/transport';
import { TrafiklabStopLookupApi } from './api/trafiklab/stop-lookup';
import { TrafiklabTimetablesApi } from './api/trafiklab/timetables';
import { ApiKeyMissingError } from './errors';
import type { Operator, UsageStats } from './types/common';

/**
 * Configuration for the TransitClient.
 */
export interface TransitClientOptions {
  /**
   * API key for Trafiklab Realtime APIs (Stop Lookup, Timetables).
   * Get one at https://developer.trafiklab.se
   */
  apiKey: string;

  /**
   * Operator to target. Defaults to `'SL'` (Stockholm).
   * Other operators may be supported by the Trafiklab APIs.
   */
  operator?: Operator;

  /**
   * When `true`, all API responses are validated against Valibot schemas at runtime.
   * Requires `valibot` to be installed (`bun add valibot`).
   * Throws `ValidationError` if a response doesn't match the expected shape.
   *
   * @default false
   */
  validate?: boolean;
}

/**
 * Main entry point for the Trafiklab SDK.
 *
 * Provides access to:
 * - `stops` — Stop Lookup API (search & list stops)
 * - `timetables` — Timetables API (departures & arrivals)
 * - `sl` — SL Transport API (Stockholm-specific, no API key needed)
 * - `deviations` — SL Deviations API (service alerts, no API key needed)
 *
 * @example
 * ```ts
 * const client = new TransitClient({ apiKey: process.env.TRAFIKLAB_API_KEY! });
 *
 * const stops = await client.stops.searchByName('T-Centralen');
 * const departures = await client.timetables.getDepartures('740000001');
 * const slDepartures = await client.sl.getDepartures(9001);
 * const alerts = await client.deviations.getDeviations({ transportModes: ['METRO'] });
 * ```
 */
export class TransitClient {
  /**
   * Stop Lookup API — search and list stops.
   */
  readonly stops: TrafiklabStopLookupApi;

  /**
   * Timetables API — departures and arrivals.
   */
  readonly timetables: TrafiklabTimetablesApi;

  /**
   * SL Transport API — Stockholm-specific lines, sites, and departures.
   */
  readonly sl: SLTransportApi;

  /**
   * SL Deviations API — service alerts and disruptions. No API key needed.
   */
  readonly deviations: SLDeviationsApi;

  readonly operator: Operator;

  constructor(options: TransitClientOptions) {
    if (!options.apiKey) {
      throw new ApiKeyMissingError();
    }

    this.operator = options.operator ?? 'SL';
    const validate = options.validate;
    this.stops = new TrafiklabStopLookupApi({ apiKey: options.apiKey, validate });
    this.timetables = new TrafiklabTimetablesApi({ apiKey: options.apiKey, validate });
    this.sl = new SLTransportApi({ validate });
    this.deviations = new SLDeviationsApi({ validate });
  }

  /**
   * Get aggregated usage statistics across all API instances.
   *
   * @returns Combined request counts by endpoint
   */
  getUsage(): UsageStats {
    const apis = [this.stops, this.timetables, this.sl, this.deviations];
    const combined: UsageStats = { totalRequests: 0, byEndpoint: {} };

    for (const api of apis) {
      const usage = api.getUsage();
      combined.totalRequests += usage.totalRequests;
      for (const [endpoint, count] of Object.entries(usage.byEndpoint)) {
        combined.byEndpoint[endpoint] = (combined.byEndpoint[endpoint] ?? 0) + count;
      }
    }

    return combined;
  }
}
