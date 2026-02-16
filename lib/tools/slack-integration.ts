/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FunctionResponseScheduling, Type } from '@google/genai';
import { FunctionCall } from '../state';

export const slackIntegrationTools: FunctionCall[] = [
  {
    name: 'slack_send_message',
    description: 'Send a message to a specific Slack channel.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        channel: {
          type: Type.STRING,
          description: 'The channel name (e.g., "general", "alerts") or ID.',
        },
        message: {
          type: Type.STRING,
          description: 'The message content to send.',
        },
      },
      required: ['channel', 'message'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
];
