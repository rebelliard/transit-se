import * as v from 'valibot';

const SLDeviationTransportModeSchema = v.picklist([
  'BUS',
  'METRO',
  'TRAM',
  'TRAIN',
  'SHIP',
  'FERRY',
  'TAXI',
]);

const SLDeviationPublishSchema = v.object({
  from: v.string(),
  upto: v.string(),
});

const SLDeviationPrioritySchema = v.object({
  importance_level: v.number(),
  influence_level: v.number(),
  urgency_level: v.number(),
});

const SLDeviationMessageVariantSchema = v.object({
  header: v.string(),
  details: v.string(),
  scope_alias: v.string(),
  language: v.string(),
  weblink: v.optional(v.string()),
});

const SLDeviationStopPointSchema = v.object({
  id: v.number(),
  name: v.string(),
});

const SLDeviationStopAreaSchema = v.object({
  id: v.number(),
  name: v.string(),
  type: v.string(),
  transport_authority: v.number(),
  stop_points: v.optional(v.array(SLDeviationStopPointSchema)),
});

const SLDeviationLineSchema = v.object({
  id: v.number(),
  transport_authority: v.number(),
  designation: v.string(),
  transport_mode: SLDeviationTransportModeSchema,
  name: v.string(),
  group_of_lines: v.string(),
});

const SLDeviationScopeSchema = v.object({
  stop_areas: v.optional(v.array(SLDeviationStopAreaSchema)),
  lines: v.optional(v.array(SLDeviationLineSchema)),
});

const SLDeviationCategorySchema = v.object({
  group: v.string(),
  type: v.string(),
});

const SLDeviationMessageSchema = v.object({
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
