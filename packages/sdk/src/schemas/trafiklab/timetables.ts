import * as v from 'valibot';
import { coordinatesEntries, TransportModeSchema } from '../common';

const TrafiklabAlertSchema = v.object({
  type: v.string(),
  title: v.string(),
  text: v.string(),
});

const TrafiklabTimetableStopSchema = v.object({
  ...coordinatesEntries,
  id: v.string(),
  name: v.string(),
  transport_modes: v.array(TransportModeSchema),
  alerts: v.array(TrafiklabAlertSchema),
});

const TrafiklabCallStopSchema = v.object({
  ...coordinatesEntries,
  id: v.string(),
  name: v.string(),
});

const TrafiklabRouteEndpointSchema = v.object({
  id: v.string(),
  name: v.string(),
});

const TrafiklabRouteSchema = v.object({
  name: v.nullable(v.string()),
  designation: v.string(),
  transport_mode: TransportModeSchema,
  transport_mode_code: v.number(),
  direction: v.string(),
  origin: TrafiklabRouteEndpointSchema,
  destination: TrafiklabRouteEndpointSchema,
});

const TrafiklabTripInfoSchema = v.object({
  trip_id: v.string(),
  start_date: v.string(),
  technical_number: v.number(),
});

const TrafiklabPlatformSchema = v.object({
  id: v.string(),
  designation: v.string(),
});

const TrafiklabAgencySchema = v.object({
  id: v.string(),
  name: v.string(),
  operator: v.string(),
});

const TrafiklabCallAtLocationSchema = v.object({
  scheduled: v.string(),
  realtime: v.string(),
  delay: v.number(),
  canceled: v.boolean(),
  route: TrafiklabRouteSchema,
  trip: TrafiklabTripInfoSchema,
  agency: v.optional(TrafiklabAgencySchema),
  stop: TrafiklabCallStopSchema,
  scheduled_platform: v.nullable(TrafiklabPlatformSchema),
  realtime_platform: v.nullable(TrafiklabPlatformSchema),
  alerts: v.array(TrafiklabAlertSchema),
  is_realtime: v.boolean(),
});

const TrafiklabTimetablesQuerySchema = v.object({
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
