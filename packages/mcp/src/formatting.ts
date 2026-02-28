/**
 * Human-readable formatters for SDK responses.
 *
 * These turn raw API data into concise text that AI assistants can
 * reason about efficiently. Raw JSON is large and noisy — formatted
 * text lets the model focus on the information that matters.
 */

import type { CombinedSLNearbyVehiclesResult } from '@transit-se/sdk/combined';
import type { GtfsServiceAlert, GtfsTripUpdate, GtfsVehiclePosition } from '@transit-se/sdk/gtfs';
import { GTFS_OPERATOR_NAMES } from '@transit-se/sdk/gtfs';
import type { SLDeparturesResponse, SLDeviationMessage, SLSiteEntry } from '@transit-se/sdk/sl';
import type {
  TrafiklabArrivalsResponse,
  TrafiklabCallAtLocation,
  TrafiklabDeparturesResponse,
  TrafiklabStopLookupResponse,
} from '@transit-se/sdk/trafiklab';

// ─── Helpers ────────────────────────────────────────────────────────

function time(iso: string): string {
  return new Date(iso).toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function delayTag(seconds: number): string {
  if (seconds <= 0) {
    return '';
  }
  const mins = Math.round(seconds / 60);
  return ` (+${mins} min late)`;
}

// ─── Stop Lookup ────────────────────────────────────────────────────

export function formatTrafiklabStopLookup(res: TrafiklabStopLookupResponse): string {
  if (res.stop_groups.length === 0) {
    return 'No stops found.';
  }

  const lines: Array<string> = [`Found ${res.stop_groups.length} stop(s):\n`];

  for (const group of res.stop_groups) {
    lines.push(`  ${group.name} (ID: ${group.id})`);
    lines.push(`    Type: ${group.area_type}`);
    lines.push(`    Modes: ${group.transport_modes.join(', ')}`);
    lines.push(`    Avg. daily departures: ${group.average_daily_stop_times}`);
    if (group.stops.length > 0) {
      lines.push(`    Child stops:`);
      for (const stop of group.stops) {
        lines.push(`      - ${stop.name} (${stop.id}) @ ${stop.lat}, ${stop.lon}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ─── Timetable Departures / Arrivals ────────────────────────────────

function formatCallAtLocation(
  entry: TrafiklabCallAtLocation,
  _label: 'departs' | 'arrives',
): string {
  const sched = time(entry.scheduled);
  const real = time(entry.realtime);
  const delay = delayTag(entry.delay);
  const canceled = entry.canceled ? ' [CANCELED]' : '';
  const rt = entry.is_realtime ? '' : ' (scheduled only)';
  const platform = entry.realtime_platform?.designation ?? entry.scheduled_platform?.designation;
  const platStr = platform ? `  Platform ${platform}` : '';
  const alerts =
    entry.alerts.length > 0
      ? '\n      Alerts: ' + entry.alerts.map((a) => a.header).join('; ')
      : '';

  const routeName = entry.route.name ? `${entry.route.name} | ` : '';

  return (
    `  ${real}${delay}${canceled}  Line ${entry.route.designation} → ${entry.route.direction}` +
    `${platStr}${rt}` +
    `\n      ${routeName}Scheduled: ${sched} | ${entry.stop.name}` +
    alerts
  );
}

export function formatTrafiklabDepartures(res: TrafiklabDeparturesResponse): string {
  if (res.departures.length === 0) {
    return `No departures found for stop ${res.query.query}.`;
  }

  const stopName = res.stops[0]?.name ?? res.query.query;
  const lines: Array<string> = [
    `Departures from ${stopName} (${res.departures.length} results):\n`,
  ];

  // Show stop-level alerts
  for (const stop of res.stops) {
    for (const alert of stop.alerts) {
      lines.push(`  ⚠ ${alert.header}: ${alert.details}`);
    }
  }

  for (const dep of res.departures) {
    lines.push(formatCallAtLocation(dep, 'departs'));
  }

  return lines.join('\n');
}

export function formatTrafiklabArrivals(res: TrafiklabArrivalsResponse): string {
  if (res.arrivals.length === 0) {
    return `No arrivals found for stop ${res.query.query}.`;
  }

  const stopName = res.stops[0]?.name ?? res.query.query;
  const lines: Array<string> = [`Arrivals at ${stopName} (${res.arrivals.length} results):\n`];

  for (const stop of res.stops) {
    for (const alert of stop.alerts) {
      lines.push(`  ⚠ ${alert.header}: ${alert.details}`);
    }
  }

  for (const arr of res.arrivals) {
    lines.push(formatCallAtLocation(arr, 'arrives'));
  }

  return lines.join('\n');
}

// ─── SL Departures ──────────────────────────────────────────────────

export function formatSLDepartures(res: SLDeparturesResponse, siteId: number): string {
  if (res.departures.length === 0) {
    return `No departures found for SL site ${siteId}.`;
  }

  const stopName = res.departures[0]?.stop_area.name ?? `site ${siteId}`;
  const lines: Array<string> = [
    `SL Departures from ${stopName} (${res.departures.length} results):\n`,
  ];

  // Stop-level deviations
  for (const dev of res.stop_deviations) {
    lines.push(`  ⚠ ${dev.message}`);
  }

  for (const dep of res.departures) {
    const mode = dep.line.transport_mode.toUpperCase();
    const deviations =
      dep.deviations.length > 0
        ? '\n      Disruptions: ' + dep.deviations.map((d) => d.message).join('; ')
        : '';
    const passenger =
      dep.journey.passenger_level !== 'UNKNOWN' ? `  Crowding: ${dep.journey.passenger_level}` : '';

    lines.push(
      `  ${dep.display.padEnd(8)} ${mode} ${dep.line.designation} → ${dep.destination}` +
        `  (Platform ${dep.stop_point.designation})${passenger}` +
        deviations,
    );
  }

  return lines.join('\n');
}

// ─── SL Sites (cached) ─────────────────────────────────────────────

export function formatSLSites(sites: Array<SLSiteEntry>, query?: string): string {
  if (sites.length === 0) {
    return query ? `No SL sites matching "${query}".` : 'No SL sites found.';
  }

  const header = query
    ? `SL sites matching "${query}" (${sites.length} results):`
    : `All SL sites (${sites.length} total):`;

  const lines: Array<string> = [header, ''];
  const display = sites.slice(0, 100); // cap to avoid huge output

  for (const site of display) {
    lines.push(`  ${site.name} (ID: ${site.id}) @ ${site.lat}, ${site.lon}`);
  }

  if (sites.length > 100) {
    lines.push(`\n  ... and ${sites.length - 100} more. Use a search query to narrow results.`);
  }

  return lines.join('\n');
}

// ─── SL Deviations ──────────────────────────────────────────────────

export function formatSLDeviations(messages: Array<SLDeviationMessage>, context?: string): string {
  if (messages.length === 0) {
    return context
      ? `No service deviations found for ${context}.`
      : 'No active service deviations.';
  }

  const header = context
    ? `Service deviations for ${context} (${messages.length}):`
    : `Service deviations (${messages.length}):`;

  const lines: Array<string> = [header, ''];

  for (const msg of messages) {
    const variant = msg.message_variants[0];
    if (!variant) {
      continue;
    }

    const affectedLines =
      msg.scope.lines?.map((l) => `${l.name} ${l.designation}`).join(', ') ?? '';
    const affectedStops = msg.scope.stop_areas?.map((s) => s.name).join(', ') ?? '';
    const until = new Date(msg.publish.upto).toLocaleDateString('sv-SE');
    const categoryTags =
      msg.categories && msg.categories.length > 0
        ? ` [${msg.categories.map((c) => c.type).join(', ')}]`
        : '';

    lines.push(`  ${variant.header}${categoryTags}`);
    lines.push(`    ${variant.details.replace(/\n+/g, ' ').trim()}`);
    if (affectedStops) {
      lines.push(`    Affects: ${affectedStops}`);
    }
    if (affectedLines) {
      lines.push(`    Lines: ${affectedLines}`);
    }
    lines.push(`    Until: ${until}`);
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

// ─── GTFS Trip Updates ──────────────────────────────────────────────

export function formatGtfsTripUpdates(updates: Array<GtfsTripUpdate>, operator: string): string {
  const operatorName = GTFS_OPERATOR_NAMES[operator] ?? operator;

  if (updates.length === 0) {
    return `No active trip updates for ${operatorName}.`;
  }

  const lines: Array<string> = [`Trip updates for ${operatorName} (${updates.length}):\n`];

  for (const tu of updates) {
    const route = tu.trip.routeId ? `Route ${tu.trip.routeId}` : 'Unknown route';
    const tripId = tu.trip.tripId ? ` (trip ${tu.trip.tripId})` : '';
    const status =
      tu.trip.scheduleRelationship !== 'SCHEDULED' ? ` [${tu.trip.scheduleRelationship}]` : '';
    const delayStr =
      tu.delay != null ? ` — ${tu.delay > 0 ? '+' : ''}${Math.round(tu.delay / 60)} min` : '';

    lines.push(`  ${route}${tripId}${status}${delayStr}`);

    if (tu.vehicle) {
      const vLabel = tu.vehicle.label ?? tu.vehicle.id ?? 'unknown';
      lines.push(`    Vehicle: ${vLabel}`);
    }

    if (tu.trip.startTime) {
      const date = tu.trip.startDate
        ? `${tu.trip.startDate.slice(0, 4)}-${tu.trip.startDate.slice(4, 6)}-${tu.trip.startDate.slice(6, 8)} `
        : '';
      lines.push(`    Departure: ${date}${tu.trip.startTime}`);
    }

    if (tu.stopTimeUpdates.length > 0) {
      const skipped = tu.stopTimeUpdates.filter((s) => s.scheduleRelationship === 'SKIPPED');
      const delayed = tu.stopTimeUpdates.filter(
        (s) =>
          s.scheduleRelationship === 'SCHEDULED' &&
          (s.arrival?.delay ?? s.departure?.delay ?? 0) > 0,
      );

      if (skipped.length > 0) {
        const stopIds = skipped.map((s) => s.stopId ?? `#${s.stopSequence}`).join(', ');
        lines.push(`    Skipped stops: ${stopIds}`);
      }

      if (delayed.length > 0) {
        const maxDelay = Math.max(
          ...delayed.map((s) => Math.max(s.arrival?.delay ?? 0, s.departure?.delay ?? 0)),
        );
        lines.push(`    ${delayed.length} stop(s) delayed, max +${Math.round(maxDelay / 60)} min`);
      }

      const nextStop = tu.stopTimeUpdates.find((s) => s.scheduleRelationship === 'SCHEDULED');
      if (nextStop) {
        const stopLabel = nextStop.stopId ?? `stop #${nextStop.stopSequence}`;
        const arrDelay = nextStop.arrival?.delay;
        const depDelay = nextStop.departure?.delay;
        const stopDelay = arrDelay ?? depDelay;
        const stopDelayStr =
          stopDelay != null
            ? ` (${stopDelay > 0 ? '+' : ''}${Math.round(stopDelay / 60)} min)`
            : '';
        lines.push(`    Next: ${stopLabel}${stopDelayStr}`);
      }
    }

    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

// ─── GTFS Vehicle Positions ─────────────────────────────────────────

export function formatGtfsVehiclePositions(
  positions: Array<GtfsVehiclePosition>,
  operator: string,
): string {
  const operatorName = GTFS_OPERATOR_NAMES[operator] ?? operator;

  if (positions.length === 0) {
    return `No active vehicles for ${operatorName}.`;
  }

  const lines: Array<string> = [`Vehicle positions for ${operatorName} (${positions.length}):\n`];

  for (const vp of positions) {
    const route = vp.trip?.routeId ? `Route ${vp.trip.routeId}` : 'Unknown route';
    const vehicleLabel = vp.vehicle?.label ?? vp.vehicle?.id ?? 'unknown vehicle';
    const status = vp.currentStatus ? ` [${vp.currentStatus.replace(/_/g, ' ')}]` : '';

    lines.push(`  ${route} — ${vehicleLabel}${status}`);

    if (vp.position) {
      const bearing = vp.position.bearing != null ? ` bearing ${vp.position.bearing}°` : '';
      const speed =
        vp.position.speed != null ? ` at ${Math.round(vp.position.speed * 3.6)} km/h` : '';
      lines.push(
        `    Position: ${vp.position.latitude.toFixed(4)}, ${vp.position.longitude.toFixed(4)}${bearing}${speed}`,
      );
    }

    if (vp.stopId) {
      lines.push(
        `    Stop: ${vp.stopId}${vp.currentStopSequence != null ? ` (seq ${vp.currentStopSequence})` : ''}`,
      );
    }

    if (vp.occupancyStatus && vp.occupancyStatus !== 'NO_DATA_AVAILABLE') {
      const pct = vp.occupancyPercentage != null ? ` (${vp.occupancyPercentage}%)` : '';
      lines.push(`    Occupancy: ${vp.occupancyStatus.replace(/_/g, ' ').toLowerCase()}${pct}`);
    }

    if (vp.congestionLevel && vp.congestionLevel !== 'UNKNOWN_CONGESTION_LEVEL') {
      lines.push(`    Congestion: ${vp.congestionLevel.replace(/_/g, ' ').toLowerCase()}`);
    }

    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

// ─── GTFS Service Alerts ────────────────────────────────────────────

export function formatGtfsServiceAlerts(alerts: Array<GtfsServiceAlert>, operator: string): string {
  const operatorName = GTFS_OPERATOR_NAMES[operator] ?? operator;

  if (alerts.length === 0) {
    return `No active service alerts for ${operatorName}.`;
  }

  const lines: Array<string> = [`Service alerts for ${operatorName} (${alerts.length}):\n`];

  for (const alert of alerts) {
    const header = alert.headerText ?? '(no title)';
    const effect = alert.effect !== 'UNKNOWN_EFFECT' ? ` [${alert.effect}]` : '';
    const cause = alert.cause !== 'UNKNOWN_CAUSE' ? ` (${alert.cause})` : '';

    lines.push(`  ${header}${effect}`);

    if (alert.descriptionText) {
      lines.push(`    ${alert.descriptionText.replace(/\n+/g, ' ').trim()}`);
    }

    if (alert.cause !== 'UNKNOWN_CAUSE') {
      lines.push(`    Cause: ${alert.cause.replace(/_/g, ' ').toLowerCase()}${cause ? '' : ''}`);
    }

    const entities = alert.informedEntities;
    if (entities.length > 0) {
      const routes = entities
        .filter((e): e is typeof e & { routeId: string } => !!e.routeId)
        .map((e) => e.routeId);
      const stops = entities
        .filter((e): e is typeof e & { stopId: string } => !!e.stopId)
        .map((e) => e.stopId);
      if (routes.length > 0) {
        lines.push(`    Routes: ${[...new Set(routes)].join(', ')}`);
      }
      if (stops.length > 0) {
        lines.push(`    Stops: ${[...new Set(stops)].join(', ')}`);
      }
    }

    if (alert.activePeriods.length > 0) {
      const period = alert.activePeriods[0];
      const from = period.start ? new Date(period.start * 1000).toLocaleDateString('sv-SE') : '?';
      const to = period.end ? new Date(period.end * 1000).toLocaleDateString('sv-SE') : 'ongoing';
      lines.push(`    Period: ${from} → ${to}`);
    }

    if (alert.url) {
      lines.push(`    Info: ${alert.url}`);
    }

    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

// ─── Combined SL Nearby Vehicles ────────────────────────────────────

export function formatCombinedSLNearbyVehicles(result: CombinedSLNearbyVehiclesResult): string {
  const { location, radiusKm, vehicles, activeModes } = result;

  if (vehicles.length === 0) {
    return `No vehicles found within ${radiusKm} km of ${location.name}.`;
  }

  const lines: Array<string> = [
    `Vehicles near ${location.name} (ID: ${location.siteId}) — ${vehicles.length} within ${radiusKm} km`,
    `Active modes: ${activeModes.join(', ')}`,
    '',
  ];

  for (const v of vehicles) {
    const mode = v.transportMode.toUpperCase().padEnd(7);
    const dist =
      v.distanceMeters < 1000
        ? `${v.distanceMeters} m`
        : `${(v.distanceMeters / 1000).toFixed(2)} km`;
    const label = v.vehicleLabel ?? v.vehicleId ?? '—';
    const speed = v.position.speed != null ? `${Math.round(v.position.speed * 3.6)} km/h` : '—';
    const bearing = v.position.bearing != null ? `${v.position.bearing}°` : '—';
    const status = v.currentStatus?.replace(/_/g, ' ') ?? '—';
    const ts = v.timestamp
      ? new Date(v.timestamp * 1000).toLocaleTimeString('sv-SE', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';
    const trip = v.trip?.tripId ? `trip ${v.trip.tripId}` : '';
    const stopPt = v.nearestStopPoint
      ? `near ${v.nearestStopPoint.name}${v.nearestStopPoint.designation ? ` (${v.nearestStopPoint.designation})` : ''}`
      : '';

    lines.push(
      `  ${mode} ${dist.padEnd(8)} ${label}` +
        `  ${status}  speed ${speed}  bearing ${bearing}  updated ${ts}`,
    );
    const details = [stopPt, trip].filter(Boolean);
    if (details.length > 0) {
      lines.push(`           ${details.join(' | ')}`);
    }
  }

  return lines.join('\n');
}
