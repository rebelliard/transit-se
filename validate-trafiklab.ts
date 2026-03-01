import * as v from 'valibot';
import { TrafiklabStopLookupResponseSchema } from './packages/sdk/src/schemas/trafiklab/stop-lookup';
import {
  TrafiklabArrivalsResponseSchema,
  TrafiklabDeparturesResponseSchema,
} from './packages/sdk/src/schemas/trafiklab/timetables';

const API_KEY = process.env.TRAFIKLAB_API_KEY!;
const BASE = 'https://realtime-api.trafiklab.se/v1';

async function validate(label: string, url: string, schema: any) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    v.parse(schema, data);
    console.log(`✅ ${label}: PASS`);
  } catch (err: any) {
    console.log(`❌ ${label}: FAIL`);
    if (err.issues) {
      for (const issue of err.issues.slice(0, 5)) {
        console.log(`   ${issue.path?.map((p: any) => p.key).join('.')}: ${issue.message}`);
      }
    } else {
      console.log(`   ${err.message}`);
    }
  }
}

await validate(
  'Stop Lookup /name/T-Centralen',
  `${BASE}/stops/name/T-Centralen?key=${API_KEY}`,
  TrafiklabStopLookupResponseSchema,
);

await validate(
  'Stop Lookup /list (all)',
  `${BASE}/stops/list?key=${API_KEY}`,
  TrafiklabStopLookupResponseSchema,
);

await validate(
  'Departures /departures/740020749 (metro)',
  `${BASE}/departures/740020749?key=${API_KEY}`,
  TrafiklabDeparturesResponseSchema,
);

await validate(
  'Departures /departures/740000001 (train)',
  `${BASE}/departures/740000001?key=${API_KEY}`,
  TrafiklabDeparturesResponseSchema,
);

await validate(
  'Arrivals /arrivals/740020749 (metro)',
  `${BASE}/arrivals/740020749?key=${API_KEY}`,
  TrafiklabArrivalsResponseSchema,
);

await validate(
  'Arrivals /arrivals/740000001 (train)',
  `${BASE}/arrivals/740000001?key=${API_KEY}`,
  TrafiklabArrivalsResponseSchema,
);
