import express from "express";
import { 
  deployCompose, restartService, getStatus, rollbackRelease, 
  getLogs, getSystemStats, readFile, listDirectory, runCommand,
  executeCommand,
  ollamaPull, ollamaList, ollamaPs, ollamaRm
} from "./actions";

const app = express();
app.use(express.json({ limit: "2mb" }) as any);

function requireRunnerToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const tokenHeader = (req as any).headers["x-runner-token"];
  const token = (Array.isArray(tokenHeader) ? tokenHeader[0] : tokenHeader) || "";
  if (!process.env.RUNNER_TOKEN || token !== process.env.RUNNER_TOKEN) {
    return (res as any).status(401).json({ ok: false, error: "unauthorized" });
  }
  next();
}

const wrap = (fn: Function) => async (req: any, res: any) => {
  try {
    const out = await fn(req.body);
    res.json({ ok: true, ...out });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message || "action_failed" });
  }
};

app.post("/v1/deploy/compose", requireRunnerToken, wrap(deployCompose));
app.post("/v1/deploy/rollback", requireRunnerToken, wrap(rollbackRelease));
app.post("/v1/service/restart", requireRunnerToken, wrap(restartService));
app.post("/v1/status", requireRunnerToken, wrap(getStatus));
app.post("/v1/logs", requireRunnerToken, wrap(getLogs));
app.post("/v1/system/stats", requireRunnerToken, wrap(getSystemStats));
app.post("/v1/file/read", requireRunnerToken, wrap(readFile));
app.post("/v1/file/list", requireRunnerToken, wrap(listDirectory));
app.post("/v1/system/command", requireRunnerToken, wrap(runCommand));
app.post("/v1/system/execute", requireRunnerToken, wrap(executeCommand));

// Ollama Routes
app.post("/v1/ollama/pull", requireRunnerToken, wrap(ollamaPull));
app.post("/v1/ollama/list", requireRunnerToken, wrap(ollamaList));
app.post("/v1/ollama/ps", requireRunnerToken, wrap(ollamaPs));
app.post("/v1/ollama/rm", requireRunnerToken, wrap(ollamaRm));

export function start() {
  const port = Number(process.env.PORT || 5055);
  // bind internal only:
  app.listen(port, "127.0.0.1", () => console.log(`[vps-runner] listening on 127.0.0.1:${port}`));
}