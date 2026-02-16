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
  {
    name: 'ollama_pull',
    description: 'Pull a model from the Ollama library on the VPS.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        model: { type: Type.STRING, description: 'Model tag to pull (e.g. llama3, mistral)' }
      },
      required: ['model']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'ollama_list',
    description: 'List models available locally on the VPS Ollama instance.',
    parameters: { type: Type.OBJECT, properties: {} },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'ollama_ps',
    description: 'List currently running models on the VPS Ollama instance.',
    parameters: { type: Type.OBJECT, properties: {} },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'ollama_rm',
    description: 'Remove a model from the VPS Ollama instance.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        model: { type: Type.STRING }
      },
      required: ['model']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  }
];