/**
 * Combined SL Nearby Vehicles API.
 *
 * Combines GTFS-RT vehicle positions with SL stop point data to find
 * vehicles near a given location and classify them by transport mode.
 *
 * For Stockholm, vehicle type is determined by matching each vehicle's
 * GPS position to the nearest SL stop point — each stop point belongs
 * to a stop area with a known type (METROSTN, BUSTERM, TRAMSTN, etc.).
 *
 * Requires a GTFS Sweden 3 API key for vehicle positions.
 * SL stop points are fetched without a key and cached for the
 * lifetime of the instance.
 */

import { TransitError } from '../../errors';
import type {
  CombinedSLNearbyVehicle,
  CombinedSLNearbyVehiclesParams,
  CombinedSLNearbyVehiclesResult,
  CombinedSLTransportMode,
} from '../../types/combined/nearby-vehicles';
import type { UsageStats } from '../../types/common';
import type { GtfsVehiclePosition } from '../../types/gtfs/vehicle-positions';
import type { SLSiteEntry } from '../../types/sl/transport';
import type { GtfsVehiclePositionsApi } from '../gtfs/vehicle-positions';
import type { SLTransportApi } from '../sl/transport';

const DEFAULT_RADIUS_KM = 1.0;
const MIN_RADIUS_KM = 0;
const MAX_RADIUS_KM = 20;

const STOP_AREA_TYPE_MAP: Record<string, CombinedSLTransportMode> = {
  METROSTN: 'metro',
  BUSTERM: 'bus',
  TRAMSTN: 'tram',
  RAILWSTN: 'train',
  SHIPBER: 'ship',
  FERRYBER: 'ferry',
};

interface StopPointEntry {
  lat: number;
  lon: number;
  name: string;
  designation?: string;
  type: string;
  mode: CombinedSLTransportMode;
}

export interface CombinedSLNearbyVehiclesApiOptions {
  /** GTFS-RT Vehicle Positions API instance. */
  vehiclePositionsApi: GtfsVehiclePositionsApi;
  /** SL Transport API instance (used for stop point lookups, no key needed). */
  slTransportApi: SLTransportApi;
}

export class CombinedSLNearbyVehiclesApi {
  private readonly gtfsApi: GtfsVehiclePositionsApi;
  private readonly slApi: SLTransportApi;
  private stopPointsCache: Array<StopPointEntry> | null = null;

  constructor(options: CombinedSLNearbyVehiclesApiOptions) {
    this.gtfsApi = options.vehiclePositionsApi;
    this.slApi = options.slTransportApi;
  }

  /**
   * Find vehicles near a Stockholm location with transport mode classification.
   *
   * Accepts a site name, site ID, or raw lat/lon coordinates. Fetches GTFS-RT
   * vehicle positions for SL, filters by radius, and classifies each vehicle
   * by matching it to the nearest SL stop point.
   *
   * @throws {TransitError} If the location cannot be resolved
   */
  async getNearbyVehicles(
    params: CombinedSLNearbyVehiclesParams,
  ): Promise<CombinedSLNearbyVehiclesResult> {
    const site = await this.resolveSite(params);
    const usesExplicitCoords = params.siteId == null && !params.siteName && params.latitude != null;
    const lat = usesExplicitCoords ? params.latitude! : site.lat;
    const lon = usesExplicitCoords ? params.longitude! : site.lon;
    const radiusKm = Math.min(
      MAX_RADIUS_KM,
      Math.max(MIN_RADIUS_KM, params.radiusKm ?? DEFAULT_RADIUS_KM),
    );

    const [vehicles, stopPoints] = await Promise.all([
      this.gtfsApi.getVehiclePositions('sl'),
      this.loadStopPoints(),
    ]);

    const radiusMeters = radiusKm * 1000;

    const nearbyStopPoints = stopPoints.filter(
      (sp) => haversineMeters(lat, lon, sp.lat, sp.lon) <= radiusMeters,
    );

    const nearbyVehicles = this.classifyVehicles(
      vehicles,
      nearbyStopPoints,
      lat,
      lon,
      radiusMeters,
    );

    const modes = [...new Set(nearbyVehicles.map((v) => v.transportMode))].filter(
      (m) => m !== 'unknown',
    ) as Array<CombinedSLTransportMode>;

    return {
      location: { name: site.name, siteId: site.id, latitude: lat, longitude: lon },
      radiusKm,
      vehicles: nearbyVehicles,
      activeModes: modes,
      timestamp: Math.floor(Date.now() / 1000),
    };
  }

  getUsage(): UsageStats {
    const gtfs = this.gtfsApi.getUsage();
    const sl = this.slApi.getUsage();
    return {
      totalRequests: gtfs.totalRequests + sl.totalRequests,
      byEndpoint: { ...gtfs.byEndpoint, ...sl.byEndpoint },
    };
  }

  private async resolveSite(params: CombinedSLNearbyVehiclesParams): Promise<SLSiteEntry> {
    if (params.siteId != null) {
      const site = await this.slApi.getSiteById(params.siteId);
      if (!site) {
        throw new TransitError(`No SL site found with ID ${params.siteId}`);
      }
      return site;
    }

    if (params.siteName) {
      const site =
        (await this.slApi.getSiteByName(params.siteName)) ??
        (await this.slApi.searchSitesByName(params.siteName))[0];
      if (!site) {
        throw new TransitError(`No SL site found matching "${params.siteName}"`);
      }
      return site;
    }

    if (params.latitude != null && params.longitude != null) {
      return this.findNearestSite(params.latitude, params.longitude);
    }

    throw new TransitError('Provide at least one of: siteId, siteName, or latitude + longitude');
  }

  private async loadStopPoints(): Promise<Array<StopPointEntry>> {
    if (this.stopPointsCache) {
      return this.stopPointsCache;
    }

    const raw = await this.slApi.getStopPoints();
    this.stopPointsCache = raw.map((sp) => ({
      lat: sp.lat,
      lon: sp.lon,
      name: sp.name,
      designation: sp.designation || undefined,
      type: sp.stop_area.type,
      mode: STOP_AREA_TYPE_MAP[sp.stop_area.type] ?? 'unknown',
    }));

    return this.stopPointsCache;
  }

  private async findNearestSite(lat: number, lon: number): Promise<SLSiteEntry> {
    const sites = await this.slApi.getCachedSites();
    let best: SLSiteEntry | undefined;
    let bestDist = Infinity;

    for (const site of sites) {
      const d = haversineMeters(lat, lon, site.lat, site.lon);
      if (d < bestDist) {
        bestDist = d;
        best = site;
      }
    }

    if (!best) {
      throw new TransitError('No SL sites available');
    }
    return best;
  }

  private classifyVehicles(
    vehicles: Array<GtfsVehiclePosition>,
    nearbyStopPoints: Array<StopPointEntry>,
    centerLat: number,
    centerLon: number,
    radiusMeters: number,
  ): Array<CombinedSLNearbyVehicle> {
    return vehicles
      .filter(
        (v) =>
          v.position != null &&
          haversineMeters(centerLat, centerLon, v.position.latitude, v.position.longitude) <=
            radiusMeters,
      )
      .map((v) => {
        const pos = v.position!;
        const distMeters = Math.round(
          haversineMeters(centerLat, centerLon, pos.latitude, pos.longitude),
        );

        const nearest = findNearestStopPoint(pos.latitude, pos.longitude, nearbyStopPoints);

        const result: CombinedSLNearbyVehicle = {
          id: v.id,
          transportMode: nearest?.mode ?? 'unknown',
          position: {
            latitude: pos.latitude,
            longitude: pos.longitude,
            bearing: pos.bearing,
            speed: pos.speed != null && pos.speed >= 0 ? pos.speed : undefined,
          },
          distanceMeters: distMeters,
        };

        if (v.vehicle?.id) {
          result.vehicleId = v.vehicle.id;
        }
        if (v.vehicle?.label) {
          result.vehicleLabel = v.vehicle.label;
        }
        if (v.currentStatus) {
          result.currentStatus = v.currentStatus;
        }
        if (v.timestamp) {
          result.timestamp = v.timestamp;
        }

        if (v.trip) {
          result.trip = {
            tripId: v.trip.tripId,
            routeId: v.trip.routeId,
            directionId: v.trip.directionId,
            startTime: v.trip.startTime,
            startDate: v.trip.startDate,
          };
        }

        if (nearest) {
          result.nearestStopPoint = {
            name: nearest.entry.name,
            designation: nearest.entry.designation,
            type: nearest.entry.type,
            distanceMeters: nearest.distMeters,
          };
        }

        if (v.congestionLevel && v.congestionLevel !== 'UNKNOWN_CONGESTION_LEVEL') {
          result.congestionLevel = v.congestionLevel;
        }
        if (v.occupancyStatus && v.occupancyStatus !== 'NO_DATA_AVAILABLE') {
          result.occupancyStatus = v.occupancyStatus;
        }
        if (v.occupancyPercentage != null && v.occupancyPercentage > 0) {
          result.occupancyPercentage = v.occupancyPercentage;
        }

        return result;
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }
}

// ─── Geo helpers ─────────────────────────────────────────────────────

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestStopPoint(
  lat: number,
  lon: number,
  stopPoints: Array<StopPointEntry>,
): { entry: StopPointEntry; distMeters: number; mode: CombinedSLTransportMode } | undefined {
  if (stopPoints.length === 0) {
    return undefined;
  }

  let best: StopPointEntry | undefined;
  let bestDist = Infinity;

  for (const sp of stopPoints) {
    const d = haversineMeters(lat, lon, sp.lat, sp.lon);
    if (d < bestDist) {
      bestDist = d;
      best = sp;
    }
  }

  if (!best) {
    return undefined;
  }

  return {
    entry: best,
    distMeters: Math.round(bestDist),
    mode: best.mode,
  };
}
