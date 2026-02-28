import * as v from 'valibot';
import { AlertSchema, coordinatesEntries, TransportModeSchema } from '../common';

export const TrafiklabTimetableStopSchema = v.object({
  ...coordinatesEntries,
  id: v.string(),
  name: v.string(),
  transport_modes: v.array(TransportModeSchema),
  alerts: v.array(AlertSchema),
});

export const TrafiklabRouteEndpointSchema = v.object({
  id: v.string(),
  name: v.string(),
});

export const TrafiklabRouteSchema = v.object({
  name: v.string(),
  designation: v.string(),
  transport_mode: TransportModeSchema,
  transport_mode_code: v.number(),
  direction: v.string(),
  origin: TrafiklabRouteEndpointSchema,
  destination: TrafiklabRouteEndpointSchema,
});

export const TrafiklabTripInfoSchema = v.object({
  trip_id: v.string(),
  start_date: v.string(),
  technical_number: v.number(),
});

export const TrafiklabPlatformSchema = v.object({
  id: v.string(),
  designation: v.string(),
});

export const TrafiklabCallAtLocationSchema = v.object({
  scheduled: v.string(),
  realtime: v.string(),
  delay: v.number(),
  canceled: v.boolean(),
  route: TrafiklabRouteSchema,
  trip: TrafiklabTripInfoSchema,
  stop: TrafiklabTimetableStopSchema,
  scheduled_platform: v.nullable(TrafiklabPlatformSchema),
  realtime_platform: v.nullable(TrafiklabPlatformSchema),
  alerts: v.array(AlertSchema),
  is_realtime: v.boolean(),
});

export const TrafiklabTimetablesQuerySchema = v.object({
  queryTime: v.string(),
  query: v.string(),
});

export const TrafiklabDeparturesResponseSchema = v.object({
  timestamp: v.string(),
  query: TrafiklabTimetablesQuerySchema,
  stops: v.array(TrafiklabTimetableStopSchema),
  departures: v.array(TrafiklabCallAtLocationSchema),
});

export const TrafiklabArrivalsResponseSchema = v.object({
  timestamp: v.string(),
  query: TrafiklabTimetablesQuerySchema,
  stops: v.array(TrafiklabTimetableStopSchema),
  arrivals: v.array(TrafiklabCallAtLocationSchema),
});
