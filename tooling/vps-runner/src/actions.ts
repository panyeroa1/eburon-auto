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

  logs.push(`[SIMULATION] cd ${cwd}`);
  logs.push(`[SIMULATION] git fetch --all --tags`);
  logs.push(`[SIMULATION] git checkout ${args.git_ref}`);
  
  logs.push(`[SIMULATION] docker compose -f ${args.compose_file} pull`);
  logs.push(`[SIMULATION] docker compose -f ${args.compose_file} up -d --remove-orphans`);

  return { ok: true, logs, status: "deployed" };
}

export async function rollbackRelease(args: { app_id: string; git_ref: string; }) {
    const cfg = getAppConfig(args.app_id);
    assertSafeRef(args.git_ref);
    const cwd = cfg.repo_path;
    const logs: string[] = [];

    logs.push(`[SIMULATION] Rolling back ${args.app_id} to ${args.git_ref}`);
    logs.push(`[SIMULATION] cd ${cwd}`);
    logs.push(`[SIMULATION] git checkout ${args.git_ref}`);
    // Assuming default compose file if not specified, or just generic up
    logs.push(`[SIMULATION] docker compose up -d`);
    
    return { ok: true, logs, status: "rolled_back" };
}

export async function restartService(args: { app_id: string; service?: string }) {
  const cfg = getAppConfig(args.app_id);
  if (args.service && cfg.services_allowlist && !cfg.services_allowlist.includes(args.service)) {
    throw new Error("service_not_allowlisted");
  }
  return { ok: true, logs: [`[SIMULATION] docker compose restart ${args.service ?? "(all)"}`] };
}

export async function getStatus(args: { app_id: string }) {
  getAppConfig(args.app_id); 
  return { ok: true, data: { ps: "NAME      IMAGE     COMMAND   SERVICE   CREATED         STATUS         PORTS\nweb-1     nginx     ...       web       2 minutes ago   Up 2 minutes   80/tcp" } };
}

export async function getLogs(args: { app_id: string; service?: string; lines?: number }) {
  getAppConfig(args.app_id);
  return { ok: true, logs: `[2024-05-21 12:00:00] [INFO] Service ${args.service || 'app'} started.\n[2024-05-21 12:01:00] [INFO] Handling request...` };
}

export async function getSystemStats(args: {}) {
  // Real implementation would use 'uptime', 'free', 'df'
  return { ok: true, stats: "Uptime: 14 days.\nLoad: 0.25 0.18 0.15\nMem: 4GB/16GB\nDisk: 40% used." };
}

export async function readFile(args: { file_path: string }) {
  // Security: In real app, validate path against allowlist or chroot
  return { ok: true, content: `# Simulated content of ${args.file_path}\nKEY=VALUE\n` };
}

export async function listDirectory(args: { path: string }) {
  // Security: Validate path
  return { ok: true, files: ["docker-compose.yml", ".env", "src/"] };
}

export async function runCommand(args: { command: string }) {
  // DANGEROUS: In production this must be heavily restricted
  return { ok: true, logs: [`[SIMULATION] Executing: ${args.command}`, "Done."] };
}