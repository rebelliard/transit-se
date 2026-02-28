import * as v from 'valibot';

export * from './common';
export * from './sl/deviations';
export * from './sl/transport';
export * from './trafiklab/stop-lookup';
export * from './trafiklab/timetables';

/**
 * Wraps a Valibot schema into a parser function compatible with BaseApi.
 */
export function parser<const TSchema extends v.GenericSchema>(
  schema: TSchema,
): (data: unknown) => v.InferOutput<TSchema> {
  return (data: unknown) => v.parse(schema, data);
}
