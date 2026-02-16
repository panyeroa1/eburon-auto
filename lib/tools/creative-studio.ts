import { FunctionCall } from '../state';
import { FunctionResponseScheduling, Type } from '@google/genai';

export const creativeStudioTools: FunctionCall[] = [
  {
    name: 'image_generate',
    description: 'Generate an image using a selected provider/model. Returns base64 or URL.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        provider: {
          type: Type.STRING,
          enum: ['huggingface', 'fal', 'replicate', 'stability', 'heartsync']
        },
        model: { type: Type.STRING },
        prompt: { type: Type.STRING },
        negative_prompt: { type: Type.STRING },
        width: { type: Type.INTEGER },
        height: { type: Type.INTEGER },
        aspect_ratio: { type: Type.STRING },
        seed: { type: Type.INTEGER },
        steps: { type: Type.INTEGER },
        guidance: { type: Type.NUMBER },
        output_format: { type: Type.STRING, enum: ['png', 'jpeg', 'webp'] },
        n: { type: Type.INTEGER }
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
      type: Type.OBJECT,
      properties: {
        provider: {
          type: Type.STRING,
          enum: ['huggingface', 'fal', 'replicate', 'stability', 'heartsync']
        },
        model: { type: Type.STRING },
        prompt: { type: Type.STRING },
        input_image_b64: { type: Type.STRING, description: 'Base64 encoded input image string' },
        mask_image_b64: { type: Type.STRING, description: 'Base64 encoded mask image string (optional)' },
        output_format: { type: Type.STRING, enum: ['png', 'jpeg', 'webp'] }
      },
      required: ['provider', 'model', 'prompt', 'input_image_b64']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  }
];