import * as v from 'valibot';
import { coordinatesEntries, TransportModeSchema } from '../common';

const TrafiklabStopSchema = v.object({
  ...coordinatesEntries,
  id: v.string(),
  name: v.string(),
});

const TrafiklabAreaTypeSchema = v.picklist(['META_STOP', 'RIKSHALLPLATS']);

const TrafiklabStopGroupSchema = v.object({
  id: v.string(),
  name: v.string(),
  area_type: TrafiklabAreaTypeSchema,
  average_daily_stop_times: v.number(),
  transport_modes: v.array(TransportModeSchema),
  stops: v.array(TrafiklabStopSchema),
});

const TrafiklabStopLookupQuerySchema = v.object({
  queryTime: v.string(),
  query: v.nullable(v.string()),
});

export const TrafiklabStopLookupResponseSchema = v.object({
  timestamp: v.string(),
  query: TrafiklabStopLookupQuerySchema,
  stop_groups: v.array(TrafiklabStopGroupSchema),
});
