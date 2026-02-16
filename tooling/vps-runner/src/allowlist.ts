import fs from "node:fs";
import path from "node:path";

type AppConfig = {
  repo_path: string;
  compose_file_allowlist: string[];
  services_allowlist?: string[];
  healthcheck_url?: string;
};

type Allowlist = { apps: Record<string, AppConfig> };

export function loadAllowlist(): Allowlist {
  const p = process.env.APPS_JSON_PATH || path.join(__dirname, "../config/apps.json");
  if (!fs.existsSync(p)) {
      console.warn(`Allowlist file not found at ${p}. Creating default.`);
      return { apps: {} };
  }
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

export function getAppConfig(app_id: string): AppConfig {
  const allowlist = loadAllowlist();
  const cfg = allowlist.apps[app_id];
  if (!cfg) throw new Error("app_not_allowlisted");
  return cfg;
}
