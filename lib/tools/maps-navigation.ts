/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FunctionResponseScheduling, Type } from '@google/genai';
import { FunctionCall } from '../state';

export const mapsNavigationTools: FunctionCall[] = [
  {
    name: 'maps_navigate',
    description: 'Calculates a route to a destination and launches navigation.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        destination: {
          type: Type.STRING,
          description: 'The target location, address, or landmark.',
        },
        mode: {
          type: Type.STRING,
          enum: ['driving', 'walking', 'cycling', 'transit'],
          description: 'Travel mode (optional, defaults to driving).',
        },
      },
      required: ['destination'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'maps_search_nearby',
    description: 'Searches for places or points of interest near the user\'s current location.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'What to look for (e.g., "coffee shops", "gas station").',
        },
        radius: {
          type: Type.NUMBER,
          description: 'Search radius in meters (optional, default 1000).',
        },
      },
      required: ['query'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
];