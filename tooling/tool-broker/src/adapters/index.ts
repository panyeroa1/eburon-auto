import { imageGenerateHF } from "./huggingface";

export async function imageGenerate(args: any) {
  switch (args.provider) {
    case "huggingface":
      return imageGenerateHF(args);
    case "fal":
    case "replicate":
    case "stability":
        throw new Error(`Provider ${args.provider} not yet implemented in sandbox.`);
    default:
      throw new Error("unsupported_provider");
  }
}
