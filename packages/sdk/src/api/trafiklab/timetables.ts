import { ApiKeyMissingError } from '../../errors';
import { parser } from '../../schemas/index';
import {
  TrafiklabArrivalsResponseSchema,
  TrafiklabDeparturesResponseSchema,
} from '../../schemas/trafiklab/timetables';
import type {
  TrafiklabArrivalsResponse,
  TrafiklabDeparturesResponse,
} from '../../types/trafiklab/timetables';
import { BaseApi, type BaseApiOptions } from '../base';

const BASE_URL = 'https://realtime-api.trafiklab.se/v1';

/**
 * Client for the Trafiklab Timetables API (`https://realtime-api.trafiklab.se/v1`).
 *
 * Provides departure and arrival data for stops across Sweden.
 * Returns 60 minutes of data from the requested time.
 * Requires an API key.
 *
 * @see https://www.trafiklab.se/api/our-apis/trafiklab-realtime-apis/timetables/
 */
export class TrafiklabTimetablesApi extends BaseApi {
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
   * Get departures from a stop.
   *
   * @param areaId - Rikshållplats or meta-stop ID (e.g. "740000001")
   * @param time - Optional lookup time in `YYYY-MM-DDTHH:mm` format. Defaults to now.
   * @returns Departures for the next 60 minutes
   */
  async getDepartures(areaId: string, time?: string): Promise<TrafiklabDeparturesResponse> {
    const path = time ? `/departures/${areaId}/${time}` : `/departures/${areaId}`;
    return this.get<TrafiklabDeparturesResponse>(
      path,
      undefined,
      parser(TrafiklabDeparturesResponseSchema),
    );
  }

  /**
   * Get arrivals at a stop.
   *
   * @param areaId - Rikshållplats or meta-stop ID (e.g. "740000001")
   * @param time - Optional lookup time in `YYYY-MM-DDTHH:mm` format. Defaults to now.
   * @returns Arrivals for the next 60 minutes
   */
  async getArrivals(areaId: string, time?: string): Promise<TrafiklabArrivalsResponse> {
    const path = time ? `/arrivals/${areaId}/${time}` : `/arrivals/${areaId}`;
    return this.get<TrafiklabArrivalsResponse>(
      path,
      undefined,
      parser(TrafiklabArrivalsResponseSchema),
    );
  }
}
