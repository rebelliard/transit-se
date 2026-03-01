import * as v from 'valibot';

export const TransportModeSchema = v.picklist(['BUS', 'TRAIN', 'TRAM', 'METRO', 'TAXI', 'BOAT']);

/**
 * Shared coordinate entries — spread into schemas that extend coordinates.
 */
export const coordinatesEntries = {
  lat: v.number(),
  lon: v.number(),
};
