import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { ApiResponseError } from '../../errors';
import type { UsageStats } from '../../types/common';

const { FeedMessage } = GtfsRealtimeBindings.transit_realtime;

export interface GtfsBaseApiOptions {
  apiKey: string;
  baseUrl?: string;
}

/**
 * Shared fetch logic for GTFS-Realtime protobuf APIs.
 *
 * Unlike {@link BaseApi} (which handles JSON), this base fetches
 * binary protobuf feeds and decodes them using gtfs-realtime-bindings.
 */
export class GtfsBaseApi {
  protected readonly apiKey: string;
  protected readonly baseUrl: string;
  private readonly _usage: { total: number; byEndpoint: Record<string, number> } = {
    total: 0,
    byEndpoint: {},
  };

  constructor(options: GtfsBaseApiOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? 'https://opendata.samtrafiken.se/gtfs-rt-sweden').replace(
      /\/$/,
      '',
    );
  }

  /**
   * Fetch a GTFS-RT protobuf feed and decode it into a FeedMessage.
   */
  protected async fetchFeed(
    path: string,
  ): Promise<GtfsRealtimeBindings.transit_realtime.FeedMessage> {
    const url = `${this.baseUrl}${path}?key=${this.apiKey}`;

    const endpointKey = path.split('?')[0];
    this._usage.total++;
    this._usage.byEndpoint[endpointKey] = (this._usage.byEndpoint[endpointKey] ?? 0) + 1;

    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.text().catch(() => undefined);
      throw new ApiResponseError(response.status, path, body);
    }

    const buffer = await response.arrayBuffer();
    return FeedMessage.decode(new Uint8Array(buffer));
  }

  getUsage(): UsageStats {
    return {
      totalRequests: this._usage.total,
      byEndpoint: { ...this._usage.byEndpoint },
    };
  }
}
