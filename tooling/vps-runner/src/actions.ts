import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getAppConfig } from "./allowlist";

const execFileAsync = promisify(execFile);

function assertSafeRef(git_ref: string) {
  if (!/^[a-zA-Z0-9._/-]{1,80}$/.test(git_ref)) throw new Error("invalid_git_ref");
}

export async function deployCompose(args: { app_id: string; git_ref: string; compose_file: string; env_profile?: string; force_rebuild?: boolean; }) {
  const cfg = getAppConfig(args.app_id);
  if (!cfg.compose_file_allowlist.includes(args.compose_file)) throw new Error("compose_file_not_allowlisted");
  assertSafeRef(args.git_ref);

  const cwd = cfg.repo_path;
  const logs: string[] = [];

  // In a real environment, we would actually run these commands. 
  // For the sandbox, we'll mock successful execution if the checks pass.
  logs.push(`[SIMULATION] cd ${cwd}`);
  logs.push(`[SIMULATION] git fetch --all --tags`);
  logs.push(`[SIMULATION] git checkout ${args.git_ref}`);
  
  logs.push(`[SIMULATION] docker compose -f ${args.compose_file} pull`);
  logs.push(`[SIMULATION] docker compose -f ${args.compose_file} up -d --remove-orphans`);

  // To run real commands, uncomment:
  /*
  await execFileAsync("git", ["fetch", "--all", "--tags"], { cwd });
  await execFileAsync("git", ["checkout", args.git_ref], { cwd });
  // ... rest of docker logic
  */

  return { ok: true, logs, status: "deployed" };
}

export async function restartService(args: { app_id: string; service?: string }) {
  const cfg = getAppConfig(args.app_id);
  if (args.service && cfg.services_allowlist && !cfg.services_allowlist.includes(args.service)) {
    throw new Error("service_not_allowlisted");
  }
  // Mock
  return { ok: true, logs: [`[SIMULATION] docker compose restart ${args.service ?? "(all)"}`] };
}

export async function getStatus(args: { app_id: string }) {
  getAppConfig(args.app_id); // validate app exists
  // Mock status
  return { ok: true, data: { ps: "NAME      IMAGE     COMMAND   SERVICE   CREATED         STATUS         PORTS\nweb-1     nginx     ...       web       2 minutes ago   Up 2 minutes   80/tcp" } };
}
