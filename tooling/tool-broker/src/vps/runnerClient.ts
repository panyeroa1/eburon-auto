import fetch from "node-fetch";

const RUNNER_URL = process.env.RUNNER_URL || "http://127.0.0.1:5055";
const RUNNER_TOKEN = process.env.RUNNER_TOKEN || "change-me";

async function post(endpoint: string, args: any) {
  const res = await fetch(RUNNER_URL + endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-runner-token": RUNNER_TOKEN
    },
    body: JSON.stringify(args)
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(json?.error || "runner_error");
  return json;
}

export async function vpsDeployCompose(args: any) {
  const json = await post("/v1/deploy/compose", args);
  return { data: json, logs: json?.logs ?? [] };
}

export async function vpsRollbackRelease(args: any) {
  const json = await post("/v1/deploy/rollback", args);
  return { data: json, logs: json?.logs ?? [] };
}

export async function vpsRestartService(args: any) {
  const json = await post("/v1/service/restart", args);
  return { data: json, logs: json?.logs ?? [] };
}

export async function vpsGetStatus(args: any) {
  const json = await post("/v1/status", args);
  return { data: json };
}

export async function vpsGetLogs(args: any) {
  const json = await post("/v1/logs", args);
  return { data: json };
}

export async function vpsSystemStats(args: any) {
  const json = await post("/v1/system/stats", args);
  return { data: json };
}

export async function vpsReadFile(args: any) {
  const json = await post("/v1/file/read", args);
  return { data: json };
}

export async function vpsListDirectory(args: any) {
  const json = await post("/v1/file/list", args);
  return { data: json };
}

export async function vpsRunCommand(args: any) {
  const json = await post("/v1/system/command", args);
  return { data: json, logs: json?.logs ?? [] };
}

export async function vpsExecuteCommand(args: any) {
  const json = await post("/v1/system/execute", args);
  return { data: json, logs: json?.logs ?? [] };
}

export async function ollamaPull(args: any) {
  const json = await post("/v1/ollama/pull", args);
  return { data: json, logs: json?.logs ?? [] };
}

export async function ollamaList(args: any) {
  const json = await post("/v1/ollama/list", args);
  return { data: json };
}

export async function ollamaPs(args: any) {
  const json = await post("/v1/ollama/ps", args);
  return { data: json };
}

export async function ollamaRm(args: any) {
  const json = await post("/v1/ollama/rm", args);
  return { data: json };
}