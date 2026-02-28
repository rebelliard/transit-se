import * as v from 'valibot';

export const SLTransportModeSchema = v.picklist([
  'metro',
  'tram',
  'train',
  'bus',
  'ship',
  'ferry',
  'taxi',
]);

export const ValidityPeriodSchema = v.object({
  from: v.string(),
  to: v.optional(v.string()),
});

export const SLTransportAuthorityRefSchema = v.object({
  id: v.number(),
  name: v.string(),
});

export const SLContractorSchema = v.object({
  id: v.number(),
  name: v.string(),
});

export const SLTransportAuthoritySchema = v.object({
  id: v.number(),
  gid: v.number(),
  name: v.string(),
  formal_name: v.string(),
  code: v.string(),
  street: v.string(),
  postal_code: v.number(),
  city: v.string(),
  country: v.string(),
  valid: ValidityPeriodSchema,
});

export const SLLineSchema = v.object({
  id: v.number(),
  gid: v.number(),
  name: v.string(),
  designation: v.string(),
  transport_mode: SLTransportModeSchema,
  group_of_lines: v.string(),
  transport_authority: SLTransportAuthorityRefSchema,
  contractor: SLContractorSchema,
  valid: ValidityPeriodSchema,
});

export const SLLinesResponseSchema = v.object({
  metro: v.array(SLLineSchema),
  tram: v.array(SLLineSchema),
  train: v.array(SLLineSchema),
  bus: v.array(SLLineSchema),
  ship: v.array(SLLineSchema),
  ferry: v.array(SLLineSchema),
  taxi: v.array(SLLineSchema),
});

export const SLSiteSchema = v.object({
  id: v.number(),
  gid: v.number(),
  name: v.string(),
  abbreviation: v.string(),
  lat: v.number(),
  lon: v.number(),
  stop_areas: v.optional(v.array(v.number())),
  valid: ValidityPeriodSchema,
});

export const SLStopAreaSchema = v.object({
  id: v.number(),
  name: v.string(),
  sname: v.string(),
  type: v.string(),
});

export const SLStopPointSchema = v.object({
  id: v.number(),
  name: v.string(),
  designation: v.string(),
});

export const SLStopPointFullSchema = v.object({
  id: v.number(),
  gid: v.number(),
  pattern_point_gid: v.number(),
  name: v.string(),
  sname: v.string(),
  designation: v.string(),
  local_num: v.number(),
  type: v.string(),
  has_entrance: v.boolean(),
  lat: v.number(),
  lon: v.number(),
  door_orientation: v.number(),
  transport_authority: SLTransportAuthorityRefSchema,
  stop_area: SLStopAreaSchema,
  valid: ValidityPeriodSchema,
});

export const SLDeviationSchema = v.object({
  importance: v.number(),
  consequence: v.string(),
  message: v.string(),
});

export const SLJourneySchema = v.object({
  id: v.number(),
  state: v.string(),
  prediction_state: v.string(),
  passenger_level: v.string(),
});

export const SLDepartureLineSchema = v.object({
  id: v.number(),
  designation: v.string(),
  transport_mode: SLTransportModeSchema,
  group_of_lines: v.string(),
});

export const SLDepartureSchema = v.object({
  direction: v.string(),
  direction_code: v.number(),
  via: v.string(),
  destination: v.string(),
  state: v.string(),
  scheduled: v.string(),
  expected: v.string(),
  display: v.string(),
  journey: SLJourneySchema,
  stop_area: SLStopAreaSchema,
  stop_point: SLStopPointSchema,
  line: SLDepartureLineSchema,
  deviations: v.array(SLDeviationSchema),
});

export const SLStopDeviationSchema = v.object({
  importance: v.number(),
  consequence: v.string(),
  message: v.string(),
});

export const SLDeparturesResponseSchema = v.object({
  departures: v.array(SLDepartureSchema),
  stop_deviations: v.array(SLStopDeviationSchema),
});

/**
 * Pre-defined array schemas for endpoints that return arrays.
 */
export const SLSitesArraySchema = v.array(SLSiteSchema);
export const SLStopPointsFullArraySchema = v.array(SLStopPointFullSchema);
export const SLTransportAuthoritiesArraySchema = v.array(SLTransportAuthoritySchema);
