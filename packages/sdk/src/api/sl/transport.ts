import { parser } from '../../schemas/index';
import {
  SLDeparturesResponseSchema,
  SLLinesResponseSchema,
  SLSitesArraySchema,
  SLStopPointsFullArraySchema,
  SLTransportAuthoritiesArraySchema,
} from '../../schemas/sl/transport';
import type {
  SLDeparturesResponse,
  SLLinesResponse,
  SLSite,
  SLSiteEntry,
  SLStopPointFull,
  SLTransportAuthority,
} from '../../types/sl/transport';
import { BaseApi, type BaseApiOptions } from '../base';

const BASE_URL = 'https://transport.integration.sl.se/v1';

/**
 * Default SL transport authority ID.
 */
const SL_TRANSPORT_AUTHORITY_ID = '1';

/**
 * Client for the SL Transport API (`https://transport.integration.sl.se/v1`).
 *
 * Provides lines, sites, departures, and stop points for Stockholm's transit network.
 * Does **not** require an API key.
 *
 * @see https://www.trafiklab.se/api/our-apis/sl/transport/
 */
export class SLTransportApi extends BaseApi {
  private readonly transportAuthorityId: string;
  private sitesPromise: Promise<Array<SLSiteEntry>> | null = null;
  private byId: Map<number, SLSiteEntry> | null = null;
  private byName: Map<string, SLSiteEntry> | null = null;

  constructor(
    options?: Partial<Omit<BaseApiOptions, 'apiKey'>> & { transportAuthorityId?: string },
  ) {
    super({ baseUrl: options?.baseUrl ?? BASE_URL, validate: options?.validate });
    this.transportAuthorityId = options?.transportAuthorityId ?? SL_TRANSPORT_AUTHORITY_ID;
  }

  /**
   * Get all sites (stations/stop areas).
   *
   * @param expand - Include stop area IDs in the response
   * @returns List of SL sites
   */
  async getSites(expand = false): Promise<Array<SLSite>> {
    const params: Record<string, string> = {};
    if (expand) {
      params.expand = 'true';
    }
    return this.get<Array<SLSite>>('/sites', params, parser(SLSitesArraySchema));
  }

  /**
   * Get departures from a specific site.
   *
   * Note: Site IDs from SL Stop Lookup (format `3BA1CDEFG`) need the prefix removed.
   * For example, `300109001` becomes `9001`.
   *
   * @param siteId - Numeric site identifier (e.g. 9192 for Slussen)
   * @returns Departures and any stop-level deviations
   */
  async getDepartures(siteId: number): Promise<SLDeparturesResponse> {
    return this.get<SLDeparturesResponse>(
      `/sites/${siteId}/departures`,
      undefined,
      parser(SLDeparturesResponseSchema),
    );
  }

  /**
   * Get all transit lines, grouped by transport mode.
   *
   * @returns Lines grouped by mode (metro, tram, train, bus, ship, ferry, taxi)
   */
  async getLines(): Promise<SLLinesResponse> {
    return this.get<SLLinesResponse>(
      '/lines',
      { transport_authority_id: this.transportAuthorityId },
      parser(SLLinesResponseSchema),
    );
  }

  /**
   * Get all stop points (platforms, quays, etc.).
   *
   * @returns List of stop points with full details
   */
  async getStopPoints(): Promise<Array<SLStopPointFull>> {
    return this.get<Array<SLStopPointFull>>(
      '/stop-points',
      undefined,
      parser(SLStopPointsFullArraySchema),
    );
  }

  /**
   * Get all transport authorities.
   *
   * @returns List of transport authorities
   */
  async getTransportAuthorities(): Promise<Array<SLTransportAuthority>> {
    return this.get<Array<SLTransportAuthority>>(
      '/transport-authorities',
      undefined,
      parser(SLTransportAuthoritiesArraySchema),
    );
  }

  // ─── Cached site lookups ────────────────────────────────────────────

  /**
   * Get all sites as lightweight entries, fetched once and cached
   * for the lifetime of this instance.
   *
   * @returns Cached array of site entries sorted by ID
   */
  async getCachedSites(): Promise<Array<SLSiteEntry>> {
    if (!this.sitesPromise) {
      this.sitesPromise = this.getSites()
        .then((raw) => {
          const entries = raw
            .filter((s) => typeof s.lat === 'number' && typeof s.lon === 'number')
            .map((s) => ({ id: s.id, name: s.name, lat: s.lat, lon: s.lon }))
            .sort((a, b) => a.id - b.id);

          this.byId = new Map();
          this.byName = new Map();
          for (const entry of entries) {
            this.byId.set(entry.id, entry);
            this.byName.set(entry.name.toLowerCase(), entry);
          }

          return entries;
        })
        .catch((err) => {
          this.sitesPromise = null;
          throw err;
        });
    }
    return this.sitesPromise;
  }

  /**
   * Look up a cached site by its numeric ID.
   *
   * @param id - Site ID (e.g. 9192)
   * @returns The matching site, or `undefined` if not found
   */
  async getSiteById(id: number): Promise<SLSiteEntry | undefined> {
    await this.getCachedSites();
    return this.byId!.get(id);
  }

  /**
   * Look up a cached site by exact name (case-insensitive).
   *
   * @param name - Site name (e.g. "Slussen" or "slussen")
   * @returns The matching site, or `undefined` if no exact match
   */
  async getSiteByName(name: string): Promise<SLSiteEntry | undefined> {
    await this.getCachedSites();
    return this.byName!.get(name.toLowerCase());
  }

  /**
   * Search cached sites by name substring (case-insensitive).
   *
   * @param query - Partial name to search for (e.g. "central")
   * @returns Array of matching sites (may be empty)
   */
  async searchSitesByName(query: string): Promise<Array<SLSiteEntry>> {
    const sites = await this.getCachedSites();
    const lower = query.toLowerCase();
    return sites.filter((site) => site.name.toLowerCase().includes(lower));
  }
}
