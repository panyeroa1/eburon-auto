import { z } from "zod";

export const ToolExecuteRequest = z.object({
  tool_name: z.string().min(1),
  arguments: z.record(z.string(), z.any()),
  request_id: z.string().min(6),
  session_id: z.string().min(1)
});

export type ToolExecuteRequestT = z.infer<typeof ToolExecuteRequest>;

export const ImageGenerateArgs = z.object({
  provider: z.enum(["huggingface", "fal", "replicate", "stability", "heartsync"]),
  model: z.string().min(1),
  prompt: z.string().min(1),
  negative_prompt: z.string().optional(),
  width: z.number().int().min(64).max(2048).optional(),
  height: z.number().int().min(64).max(2048).optional(),
  aspect_ratio: z.string().optional(),
  seed: z.number().int().optional(),
  steps: z.number().int().min(1).max(80).optional(),
  guidance: z.number().min(0).max(30).optional(),
  output_format: z.enum(["png", "jpeg", "webp"]).optional(),
  n: z.number().int().min(1).max(4).optional()
});

export const ImageEditArgs = z.object({
  provider: z.enum(["huggingface", "fal", "replicate", "stability", "heartsync"]),
  model: z.string().min(1),
  prompt: z.string().min(1),
  input_image_b64: z.string().min(1),
  mask_image_b64: z.string().optional(),
  output_format: z.enum(["png", "jpeg", "webp"]).optional()
});

export const VpsDeployComposeArgs = z.object({
  app_id: z.string().min(1),
  git_ref: z.string().min(1).max(80),
  compose_file: z.string().min(1),
  env_profile: z.string().optional(),
  force_rebuild: z.boolean().optional()
});

export const VpsRestartServiceArgs = z.object({
  app_id: z.string().min(1),
  service: z.string().optional()
});

export const VpsGetStatusArgs = z.object({
  app_id: z.string().min(1)
});
