/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FunctionCall } from '../state';
import { FunctionResponseScheduling } from '@google/genai';

export const radarTools: FunctionCall[] = [
  {
    name: 'scan_nearby',
    description: 'Scans the user\'s surroundings for places matching a query and displays them on the radar.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'The type of place to search for (e.g., "coffee", "parking").',
        },
      },
      required: ['query'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
];
