import { parser } from '../../schemas/index';
import { SLDeviationMessagesArraySchema } from '../../schemas/sl/deviations';
import type { SLDeviationMessage, SLDeviationsParams } from '../../types/sl/deviations';
import { BaseApi, type BaseApiOptions } from '../base';

const BASE_URL = 'https://deviations.integration.sl.se/v1';

/**
 * Client for the SL Deviations API (`https://deviations.integration.sl.se/v1`).
 *
 * Provides service disruption messages for Stockholm's transit network —
 * covering elevator/escalator outages, track works, cancellations, and more.
 * Does **not** require an API key.
 *
 * @see https://www.trafiklab.se/api/our-apis/sl/deviations/
 */
export class SLDeviationsApi extends BaseApi {
  constructor(options?: Partial<Omit<BaseApiOptions, 'apiKey'>>) {
    super({ baseUrl: options?.baseUrl ?? BASE_URL, validate: options?.validate });
  }

  /**
   * Get deviation messages for SL's transit network.
   *
   * All parameters are optional — omitting them returns all current deviations.
   *
   * @param params - Filter options (future, siteIds, lineIds, transportModes, transportAuthority)
   * @returns Array of deviation messages sorted by the API's default order
   */
  async getDeviations(params?: SLDeviationsParams): Promise<Array<SLDeviationMessage>> {
    const path = this.buildPath(params);
    return this.get<Array<SLDeviationMessage>>(
      path,
      undefined,
      parser(SLDeviationMessagesArraySchema),
    );
  }

  private buildPath(params?: SLDeviationsParams): string {
    const qs = new URLSearchParams();

    if (params?.future !== undefined) {
      qs.set('future', String(params.future));
    }
    for (const id of params?.siteIds ?? []) {
      qs.append('site', String(id));
    }
    for (const id of params?.lineIds ?? []) {
      qs.append('line', String(id));
    }
    for (const mode of params?.transportModes ?? []) {
      qs.append('transport_mode', mode);
    }
    if (params?.transportAuthority !== undefined) {
      qs.set('transport_authority', String(params.transportAuthority));
    }

    const queryString = qs.toString();
    return queryString ? `/messages?${queryString}` : '/messages';
  }
}
