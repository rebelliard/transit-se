import { ApiKeyMissingError } from '../../errors';
import { parser } from '../../schemas/index';
import { TrafiklabStopLookupResponseSchema } from '../../schemas/trafiklab/stop-lookup';
import type { TrafiklabStopLookupResponse } from '../../types/trafiklab/stop-lookup';
import { BaseApi, type BaseApiOptions } from '../base';

const BASE_URL = 'https://realtime-api.trafiklab.se/v1/stops';

/**
 * Client for the Trafiklab Stop Lookup API (`https://realtime-api.trafiklab.se/v1/stops`).
 *
 * Provides stop search and listing for Swedish public transport.
 * Requires an API key.
 *
 * @see https://www.trafiklab.se/api/our-apis/trafiklab-realtime-apis/stop-lookup/
 */
export class TrafiklabStopLookupApi extends BaseApi {
  constructor(options: Omit<BaseApiOptions, 'baseUrl'> & { baseUrl?: string }) {
    if (!options.apiKey) {
      throw new ApiKeyMissingError();
    }
    super({
      baseUrl: options.baseUrl ?? BASE_URL,
      apiKey: options.apiKey,
      validate: options.validate,
    });
  }

  /**
   * Search for stops by name.
   *
   * Results are sorted by highest daily departure frequency.
   *
   * @param query - Search term (minimum 1 character)
   * @returns Matching stop groups
   */
  async searchByName(query: string): Promise<TrafiklabStopLookupResponse> {
    return this.get<TrafiklabStopLookupResponse>(
      `/name/${encodeURIComponent(query)}`,
      undefined,
      parser(TrafiklabStopLookupResponseSchema),
    );
  }

  /**
   * List all stops.
   *
   * Returns every stop sorted by daily departure frequency.
   *
   * @returns All stop groups
   */
  async listAll(): Promise<TrafiklabStopLookupResponse> {
    return this.get<TrafiklabStopLookupResponse>(
      '/list',
      undefined,
      parser(TrafiklabStopLookupResponseSchema),
    );
  }
}
