import { ImageGenerateArgs, VpsDeployComposeArgs, VpsRestartServiceArgs, VpsGetStatusArgs } from "./tools.schemas";
import { imageGenerate } from "./adapters";
import { vpsDeployCompose, vpsRestartService, vpsGetStatus } from "./vps/runnerClient";

export const toolRegistry = {
  image_generate: {
    validate: (args: any) => ImageGenerateArgs.parse(args),
    execute: (args: any) => imageGenerate(args)
  },
  vps_deploy_compose: {
    validate: (args: any) => VpsDeployComposeArgs.parse(args),
    execute: (args: any) => vpsDeployCompose(args)
  },
  vps_restart_service: {
    validate: (args: any) => VpsRestartServiceArgs.parse(args),
    execute: (args: any) => vpsRestartService(args)
  },
  vps_get_status: {
    validate: (args: any) => VpsGetStatusArgs.parse(args),
    execute: (args: any) => vpsGetStatus(args)
  }
} as const;

export type ToolName = keyof typeof toolRegistry;
