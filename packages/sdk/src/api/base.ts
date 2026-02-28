import { ApiResponseError, ValidationError } from '../errors';
import type { UsageStats } from '../types/common';

export interface BaseApiOptions {
  baseUrl: string;
  apiKey?: string;
  /**
   * When `true`, API responses are validated against Valibot schemas at runtime.
   * Requires `valibot` to be installed as a peer dependency.
   * Throws `ValidationError` if the response doesn't match the expected shape.
   *
   * @default false
   */
  validate?: boolean;
}

/**
 * A function that validates unknown data and returns the expected type.
 */
type SchemaParser<T> = (data: unknown) => T;

/**
 * Shared HTTP logic for all API classes.
 * Handles fetch, error mapping, usage tracking, and optional Valibot validation.
 */
export class BaseApi {
  protected readonly baseUrl: string;
  protected readonly apiKey?: string;
  protected readonly validate: boolean;
  private readonly _usage: { total: number; byEndpoint: Record<string, number> } = {
    total: 0,
    byEndpoint: {},
  };

  constructor(options: BaseApiOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.apiKey = options.apiKey;
    this.validate = options.validate ?? false;
  }

  /**
   * Make a GET request and return parsed JSON.
   * If `validate` is enabled and a `parse` function is provided, the response is validated through it.
   */
  protected async get<T>(
    path: string,
    params?: Record<string, string>,
    parse?: SchemaParser<T>,
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (this.apiKey) {
      url.searchParams.set('key', this.apiKey);
    }
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    const endpointKey = path.split('?')[0];
    this._usage.total++;
    this._usage.byEndpoint[endpointKey] = (this._usage.byEndpoint[endpointKey] ?? 0) + 1;

    const response = await fetch(url.toString());

    if (!response.ok) {
      const body = await response.text().catch(() => undefined);
      throw new ApiResponseError(response.status, url.pathname, body);
    }

    const json: unknown = await response.json();

    if (this.validate && parse) {
      try {
        return parse(json);
      } catch (cause) {
        throw new ValidationError(url.pathname, cause);
      }
    }

    return json as T;
  }

  /**
   * Get usage statistics for this API instance.
   */
  getUsage(): UsageStats {
    return {
      totalRequests: this._usage.total,
      byEndpoint: { ...this._usage.byEndpoint },
    };
  }
}
