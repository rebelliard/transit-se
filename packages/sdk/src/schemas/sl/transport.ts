import * as v from 'valibot';

const SLTransportModeSchema = v.picklist([
  'METRO',
  'TRAM',
  'TRAIN',
  'BUS',
  'SHIP',
  'FERRY',
  'TAXI',
]);

const ValidityPeriodSchema = v.object({
  from: v.string(),
  to: v.optional(v.string()),
});

const SLTransportAuthorityRefSchema = v.object({
  id: v.number(),
  name: v.string(),
});

const SLContractorSchema = v.object({
  id: v.number(),
  name: v.string(),
});

const SLTransportAuthoritySchema = v.object({
  id: v.number(),
  gid: v.number(),
  name: v.string(),
  formal_name: v.optional(v.string()),
  code: v.string(),
  street: v.optional(v.string()),
  postal_code: v.optional(v.number()),
  city: v.optional(v.string()),
  country: v.optional(v.string()),
  valid: ValidityPeriodSchema,
});

const SLGroupOfLinesSchema = v.picklist([
  'Tunnelbanans blå linje',
  'Tunnelbanans gröna linje',
  'Tunnelbanans röda linje',
  'Pendeltåg',
  'Spårväg City',
  'Tvärbanan',
  'Lidingöbanan',
  'Nockebybanan',
  'Roslagsbanan',
  'Saltsjöbanan',
  'Blåbuss',
  'Närtrafiken',
  'Ersättningsbuss',
  'Pendelbåt',
]);

const SLLineSchema = v.object({
  id: v.number(),
  gid: v.number(),
  name: v.string(),
  designation: v.string(),
  transport_mode: SLTransportModeSchema,
  group_of_lines: v.optional(SLGroupOfLinesSchema),
  transport_authority: SLTransportAuthorityRefSchema,
  contractor: v.optional(SLContractorSchema),
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

const SLSiteSchema = v.object({
  id: v.number(),
  gid: v.number(),
  name: v.string(),
  alias: v.optional(v.array(v.string())),
  note: v.optional(v.string()),
  abbreviation: v.optional(v.string()),
  lat: v.number(),
  lon: v.number(),
  stop_areas: v.optional(v.array(v.number())),
  valid: ValidityPeriodSchema,
});

const SLStopAreaSchema = v.object({
  id: v.number(),
  name: v.string(),
  sname: v.optional(v.string()),
  type: v.string(),
});

const SLStopPointSchema = v.object({
  id: v.number(),
  name: v.string(),
  designation: v.optional(v.string()),
});

const SLStopPointFullSchema = v.object({
  id: v.number(),
  gid: v.number(),
  pattern_point_gid: v.number(),
  name: v.string(),
  sname: v.string(),
  designation: v.optional(v.string()),
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

const SLDeviationSchema = v.object({
  importance_level: v.number(),
  consequence: v.string(),
  message: v.string(),
});

const SLJourneySchema = v.object({
  id: v.number(),
  state: v.string(),
  prediction_state: v.optional(v.string()),
});

const SLDepartureLineSchema = v.object({
  id: v.number(),
  designation: v.string(),
  transport_authority_id: v.optional(v.number()),
  transport_mode: SLTransportModeSchema,
  group_of_lines: v.optional(SLGroupOfLinesSchema),
});

const SLDepartureSchema = v.object({
  direction: v.string(),
  direction_code: v.number(),
  via: v.optional(v.string()),
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

const SLStopDeviationSchema = v.object({
  id: v.number(),
  importance_level: v.number(),
  message: v.string(),
  scope: v.optional(
    v.object({
      stop_areas: v.optional(
        v.array(v.object({ id: v.number(), name: v.string(), type: v.string() })),
      ),
      stop_points: v.optional(
        v.array(
          v.object({ id: v.number(), name: v.string(), designation: v.optional(v.string()) }),
        ),
      ),
      lines: v.optional(
        v.array(
          v.object({
            id: v.number(),
            designation: v.string(),
            transport_authority_id: v.number(),
            transport_mode: SLTransportModeSchema,
            group_of_lines: v.optional(v.string()),
          }),
        ),
      ),
    }),
  ),
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
