import fetch from "node-fetch";

export async function imageGenerateHF(args: any) {
  const token = process.env.HF_TOKEN;
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
