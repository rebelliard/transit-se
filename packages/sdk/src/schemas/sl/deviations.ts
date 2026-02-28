import * as v from 'valibot';

export const SLDeviationTransportModeSchema = v.picklist([
  'BUS',
  'METRO',
  'TRAM',
  'TRAIN',
  'SHIP',
  'FERRY',
  'TAXI',
]);

export const SLDeviationPublishSchema = v.object({
  from: v.string(),
  upto: v.string(),
});

export const SLDeviationPrioritySchema = v.object({
  importance_level: v.number(),
  influence_level: v.number(),
  urgency_level: v.number(),
});

export const SLDeviationMessageVariantSchema = v.object({
  header: v.string(),
  details: v.string(),
  scope_alias: v.string(),
  language: v.string(),
  weblink: v.optional(v.string()),
});

export const SLDeviationStopPointSchema = v.object({
  id: v.number(),
  name: v.string(),
});

export const SLDeviationStopAreaSchema = v.object({
  id: v.number(),
  name: v.string(),
  type: v.string(),
  transport_authority: v.number(),
  stop_points: v.optional(v.array(SLDeviationStopPointSchema)),
});

export const SLDeviationLineSchema = v.object({
  id: v.number(),
  transport_authority: v.number(),
  designation: v.string(),
  transport_mode: SLDeviationTransportModeSchema,
  name: v.string(),
  group_of_lines: v.string(),
});

export const SLDeviationScopeSchema = v.object({
  stop_areas: v.optional(v.array(SLDeviationStopAreaSchema)),
  lines: v.optional(v.array(SLDeviationLineSchema)),
});

export const SLDeviationCategorySchema = v.object({
  group: v.string(),
  type: v.string(),
});

export const SLDeviationMessageSchema = v.object({
  version: v.number(),
  created: v.string(),
  modified: v.optional(v.string()),
  deviation_case_id: v.number(),
  publish: SLDeviationPublishSchema,
  priority: SLDeviationPrioritySchema,
  message_variants: v.array(SLDeviationMessageVariantSchema),
  scope: SLDeviationScopeSchema,
  categories: v.optional(v.array(SLDeviationCategorySchema)),
});

export const SLDeviationMessagesArraySchema = v.array(SLDeviationMessageSchema);
