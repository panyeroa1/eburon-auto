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
          enum: ['huggingface', 'fal', 'replicate', 'stability', 'heartsync'],
          description: 'The image provider service to use.'
        },
        model: { 
          type: Type.STRING,
          description: 'The specific model ID to use for generation.'
        },
        prompt: { 
          type: Type.STRING,
          description: 'The text prompt describing the image to generate.'
        },
        negative_prompt: { 
          type: Type.STRING,
          description: 'Items to exclude from the image.'
        },
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
          enum: ['huggingface', 'fal', 'replicate', 'stability', 'heartsync'],
          description: 'The image provider service to use for editing.'
        },
        model: { 
          type: Type.STRING,
          description: 'The specific model ID to use for editing.'
        },
        prompt: { 
          type: Type.STRING,
          description: 'The text prompt describing the desired edit.'
        },
        input_image_b64: { 
          type: Type.STRING, 
          description: 'Base64 encoded string of the source image to be edited.' 
        },
        mask_image_b64: { 
          type: Type.STRING, 
          description: 'Optional Base64 encoded string of the mask image (white pixels = edit area).' 
        },
        output_format: { 
          type: Type.STRING, 
          enum: ['png', 'jpeg', 'webp'],
          description: 'The output format of the edited image.'
        }
      },
      required: ['provider', 'model', 'prompt', 'input_image_b64']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  }
];
