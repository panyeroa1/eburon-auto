import fetch from "node-fetch";

const FALLBACK_HF_TOKEN = "hf_xqeYtTMWgorafSvYGsARfokzAOBwtzjbiRb";

export async function imageGenerateHF(args: any) {
  const token = process.env.HF_TOKEN || FALLBACK_HF_TOKEN;
  if (!token) throw new Error("HF_TOKEN_MISSING");

  // Default to a popular model if generic provided, otherwise use specific
  const modelId = args.model === "default" ? "stabilityai/stable-diffusion-xl-base-1.0" : args.model;
  
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${modelId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: args.prompt,
        parameters: {
            negative_prompt: args.negative_prompt,
            num_inference_steps: args.steps || 25,
            width: args.width || 1024,
            height: args.height || 1024,
            guidance_scale: args.guidance || 7.5,
        }
      }),
    }
  );

  if (!response.ok) {
     const err = await response.text();
     throw new Error(`HF Error: ${err}`);
  }

  const blob = await response.arrayBuffer();
  const b64 = Buffer.from(blob).toString("base64");
  
  return {
    data: {
      kind: "image",
      images: [{ mime: "image/jpeg", b64: b64 }],
    },
    logs: [`Generated image with model ${modelId}`]
  };
}

export async function imageEditHF(args: any) {
  const token = process.env.HF_TOKEN || FALLBACK_HF_TOKEN;
  if (!token) throw new Error("HF_TOKEN_MISSING");

  const modelId = args.model;
  
  // NOTE: HF Inference API parameters for image-to-image/inpainting vary by model type.
  // This is a generic implementation assuming a model that accepts standard inputs.
  // Real-world usage often requires sending raw binary with specific headers or multipart forms 
  // depending on the exact pipeline type (e.g. diffusers vs others).
  
  const payload: any = {
    inputs: args.prompt,
    image: args.input_image_b64,
    parameters: {}
  };

  if (args.mask_image_b64) {
      payload.mask = args.mask_image_b64;
  }

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${modelId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
     const err = await response.text();
     throw new Error(`HF Edit Error: ${err}`);
  }

  const blob = await response.arrayBuffer();
  const b64 = Buffer.from(blob).toString("base64");

  return {
    data: {
      kind: "image",
      images: [{ mime: "image/jpeg", b64: b64 }],
    },
    logs: [`Edited image with model ${modelId}`]
  };
}