import type { SLDeviationMessage } from '../../types/sl/deviations';

/**
 * A single red-line deviation (elevator outage at Skärholmen).
 */
export const slDeviationElevator: SLDeviationMessage = {
  version: 1,
  created: '2026-02-27T13:59:11.923+01:00',
  deviation_case_id: 10444305,
  publish: {
    from: '2026-02-27T13:59:11.920+01:00',
    upto: '2026-03-06T23:30:00.000+01:00',
  },
  priority: {
    importance_level: 2,
    influence_level: 3,
    urgency_level: 1,
  },
  message_variants: [
    {
      header: 'Avstängd hiss vid Skärholmen',
      details:
        'Hissen vid Skärholmen, entrén mot Bussterminalen, är avstängd på grund av tekniskt fel.',
      scope_alias: 'Tunnelbanans röda linje 13',
      language: 'sv',
    },
  ],
  scope: {
    stop_areas: [
      {
        id: 2711,
        name: 'Skärholmen',
        type: 'METROSTN',
        transport_authority: 1,
      },
    ],
    lines: [
      {
        id: 13,
        transport_authority: 1,
        designation: '13',
        transport_mode: 'METRO',
        name: 'Röda linjen',
        group_of_lines: 'tunnelbanans röda linje',
      },
    ],
  },
  categories: [
    {
      group: 'FACILITY',
      type: 'LIFT',
    },
  ],
};

/**
 * A multi-line deviation affecting lines 13 and 14 (escalator works at T-Centralen).
 */
export const slDeviationEscalator: SLDeviationMessage = {
  version: 2,
  created: '2026-02-27T16:16:20.69+01:00',
  deviation_case_id: 10420969,
  publish: {
    from: '2026-03-02T04:30:00.000+01:00',
    upto: '2026-06-30T02:00:00.000+02:00',
  },
  priority: {
    importance_level: 2,
    influence_level: 3,
    urgency_level: 1,
  },
  message_variants: [
    {
      header: 'T-Centralen: Utbyte av rulltrappor begränsar framkomligheten',
      details:
        'Rulltrapporna mellan biljetthallen mot Sergels torg och plattformen för Röda linjen ska bytas ut.',
      scope_alias: 'Tunnelbanans röda linje 13, 14',
      language: 'sv',
    },
  ],
  scope: {
    stop_areas: [
      {
        id: 1051,
        name: 'T-Centralen',
        type: 'METROSTN',
        transport_authority: 1,
      },
    ],
    lines: [
      {
        id: 14,
        transport_authority: 1,
        designation: '14',
        transport_mode: 'METRO',
        name: 'Röda linjen',
        group_of_lines: 'tunnelbanans röda linje',
      },
      {
        id: 13,
        transport_authority: 1,
        designation: '13',
        transport_mode: 'METRO',
        name: 'Röda linjen',
        group_of_lines: 'tunnelbanans röda linje',
      },
    ],
  },
  categories: [
    {
      group: 'FACILITY',
      type: 'ESCALATOR',
    },
  ],
};

/**
 * A deviation with no categories and no stop_areas (line-scope only).
 */
export const slDeviationLineOnly: SLDeviationMessage = {
  version: 1,
  created: '2026-01-01T08:00:00.000+01:00',
  deviation_case_id: 9000001,
  publish: {
    from: '2026-01-01T08:00:00.000+01:00',
    upto: '2026-02-01T08:00:00.000+01:00',
  },
  priority: {
    importance_level: 1,
    influence_level: 2,
    urgency_level: 2,
  },
  message_variants: [
    {
      header: 'Reduced frequency on line 17',
      details: 'Line 17 runs every 10 minutes instead of every 5 minutes.',
      scope_alias: 'Tunnelbanans gröna linje 17',
      language: 'sv',
    },
  ],
  scope: {
    lines: [
      {
        id: 17,
        transport_authority: 1,
        designation: '17',
        transport_mode: 'METRO',
        name: 'Gröna linjen',
        group_of_lines: 'tunnelbanans gröna linje',
      },
    ],
  },
};

/**
 * Array fixture — two deviations on the red metro line.
 */
export const slDeviationsResponse: Array<SLDeviationMessage> = [
  slDeviationElevator,
  slDeviationEscalator,
];

/**
 * Empty response (no active deviations).
 */
export const slDeviationsEmptyResponse: Array<SLDeviationMessage> = [];
