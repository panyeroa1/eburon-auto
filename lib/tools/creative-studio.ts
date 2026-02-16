import { FunctionCall } from '../state';
import { FunctionResponseScheduling } from '@google/genai';

export const creativeStudioTools: FunctionCall[] = [
  {
    name: 'image_generate',
    description: 'Generate an image using a selected provider/model. Returns base64 or URL.',
    parameters: {
      type: 'OBJECT',
      properties: {
        provider: {
          type: 'STRING',
          enum: ['huggingface', 'fal', 'replicate', 'stability', 'heartsync']
        },
        model: { type: 'STRING' },
        prompt: { type: 'STRING' },
        negative_prompt: { type: 'STRING' },
        width: { type: 'INTEGER' },
        height: { type: 'INTEGER' },
        aspect_ratio: { type: 'STRING' },
        seed: { type: 'INTEGER' },
        steps: { type: 'INTEGER' },
        guidance: { type: 'NUMBER' },
        output_format: { type: 'STRING', enum: ['png', 'jpeg', 'webp'] },
        n: { type: 'INTEGER' }
      },
      required: ['provider', 'model', 'prompt']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'image_edit',
    description: 'Edit an existing image using a prompt and optional mask (inpainting/editing).',
    parameters: {
      type: 'OBJECT',
      properties: {
        provider: {
          type: 'STRING',
          enum: ['huggingface', 'fal', 'replicate', 'stability', 'heartsync']
        },
        model: { type: 'STRING' },
        prompt: { type: 'STRING' },
        input_image_b64: { type: 'STRING', description: 'Base64 encoded input image string' },
        mask_image_b64: { type: 'STRING', description: 'Base64 encoded mask image string (optional)' },
        output_format: { type: 'STRING', enum: ['png', 'jpeg', 'webp'] }
      },
      required: ['provider', 'model', 'prompt', 'input_image_b64']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  }
];
