/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FunctionCall } from '../state';
import { FunctionResponseScheduling, Type } from '@google/genai';

export const localModelTools: FunctionCall[] = [
  {
    name: 'call_local_model',
    description: 'Executes a task using a local Ollama model. Useful for coding tasks, private data processing, or utilizing specific open-weights models like codellama.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        model: {
          type: Type.STRING,
          description: 'The model tag to use (e.g., "llama3", "codellama", "qwen2.5-coder"). Defaults to "llama3" if not specified.',
        },
        prompt: {
          type: Type.STRING,
          description: 'The task description, code request, or prompt for the local model.',
        },
        system: {
          type: Type.STRING,
          description: 'System instruction for the local model context (optional).',
        },
      },
      required: ['prompt'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
];