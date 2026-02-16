import { 
  ImageGenerateArgs, ImageEditArgs, 
  VpsDeployComposeArgs, VpsRestartServiceArgs, VpsGetStatusArgs,
  VpsRollbackReleaseArgs, VpsGetLogsArgs, VpsSystemStatsArgs,
  VpsReadFileArgs, VpsListDirectoryArgs, VpsRunCommandArgs,
  VpsExecuteCommandArgs,
  OllamaPullArgs, OllamaListArgs, OllamaPsArgs, OllamaRmArgs
} from "./tools.schemas";
import { imageGenerate, imageEdit } from "./adapters";
import { 
  vpsDeployCompose, vpsRestartService, vpsGetStatus,
  vpsRollbackRelease, vpsGetLogs, vpsSystemStats,
  vpsReadFile, vpsListDirectory, vpsRunCommand, vpsExecuteCommand,
  ollamaPull, ollamaList, ollamaPs, ollamaRm
} from "./vps/runnerClient";

export const toolRegistry = {
  image_generate: {
    validate: (args: any) => ImageGenerateArgs.parse(args),
    execute: (args: any) => imageGenerate(args)
  },
  image_edit: {
    validate: (args: any) => ImageEditArgs.parse(args),
    execute: (args: any) => imageEdit(args)
  },
  vps_deploy_compose: {
    validate: (args: any) => VpsDeployComposeArgs.parse(args),
    execute: (args: any) => vpsDeployCompose(args)
  },
  vps_rollback_release: {
    validate: (args: any) => VpsRollbackReleaseArgs.parse(args),
    execute: (args: any) => vpsRollbackRelease(args)
  },
  vps_restart_service: {
    validate: (args: any) => VpsRestartServiceArgs.parse(args),
    execute: (args: any) => vpsRestartService(args)
  },
  vps_get_status: {
    validate: (args: any) => VpsGetStatusArgs.parse(args),
    execute: (args: any) => vpsGetStatus(args)
  },
  vps_get_logs: {
    validate: (args: any) => VpsGetLogsArgs.parse(args),
    execute: (args: any) => vpsGetLogs(args)
  },
  vps_system_stats: {
    validate: (args: any) => VpsSystemStatsArgs.parse(args),
    execute: (args: any) => vpsSystemStats(args)
  },
  vps_read_file: {
    validate: (args: any) => VpsReadFileArgs.parse(args),
    execute: (args: any) => vpsReadFile(args)
  },
  vps_list_directory: {
    validate: (args: any) => VpsListDirectoryArgs.parse(args),
    execute: (args: any) => vpsListDirectory(args)
  },
  vps_run_command: {
    validate: (args: any) => VpsRunCommandArgs.parse(args),
    execute: (args: any) => vpsRunCommand(args)
  },
  vps_execute_command: {
    validate: (args: any) => VpsExecuteCommandArgs.parse(args),
    execute: (args: any) => vpsExecuteCommand(args)
  },
  ollama_pull: {
    validate: (args: any) => OllamaPullArgs.parse(args),
    execute: (args: any) => ollamaPull(args)
  },
  ollama_list: {
    validate: (args: any) => OllamaListArgs.parse(args),
    execute: (args: any) => ollamaList(args)
  },
  ollama_ps: {
    validate: (args: any) => OllamaPsArgs.parse(args),
    execute: (args: any) => ollamaPs(args)
  },
  ollama_rm: {
    validate: (args: any) => OllamaRmArgs.parse(args),
    execute: (args: any) => ollamaRm(args)
  }
} as const;

export type ToolName = keyof typeof toolRegistry;