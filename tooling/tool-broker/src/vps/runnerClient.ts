import fetch from "node-fetch";

const RUNNER_URL = process.env.RUNNER_URL || "http://127.0.0.1:5055";
const RUNNER_TOKEN = process.env.RUNNER_TOKEN || "change-me";

export async function vpsDeployCompose(args: any) {
  const res = await fetch(RUNNER_URL + "/v1/deploy/compose", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-runner-token": RUNNER_TOKEN
    },
    body: JSON.stringify(args)
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(json?.error || "runner_error");
  return { data: json, logs: json?.logs ?? [] };
}

export async function vpsRestartService(args: any) {
  const res = await fetch(RUNNER_URL + "/v1/service/restart", {
    method: "POST",
    headers: { "content-type": "application/json", "x-runner-token": RUNNER_TOKEN },
    body: JSON.stringify(args)
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(json?.error || "runner_error");
  return { data: json, logs: json?.logs ?? [] };
}

export async function vpsGetStatus(args: any) {
  const res = await fetch(RUNNER_URL + "/v1/status", {
    method: "POST",
    headers: { "content-type": "application/json", "x-runner-token": RUNNER_TOKEN },
    body: JSON.stringify(args)
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(json?.error || "runner_error");
  return { data: json };
}
