import express from "express";
import { deployCompose, restartService, getStatus } from "./actions";

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

app.post("/v1/deploy/compose", requireRunnerToken, async (req, res) => {
  try {
    const out = await deployCompose(req.body);
    (res as any).json({ ok: true, ...out });
  } catch (e: any) {
    (res as any).status(400).json({ ok: false, error: e?.message || "deploy_failed" });
  }
});

app.post("/v1/service/restart", requireRunnerToken, async (req, res) => {
  try {
    const out = await restartService(req.body);
    (res as any).json({ ok: true, ...out });
  } catch (e: any) {
    (res as any).status(400).json({ ok: false, error: e?.message || "restart_failed" });
  }
});

app.post("/v1/status", requireRunnerToken, async (req, res) => {
  try {
    const out = await getStatus(req.body);
    (res as any).json({ ok: true, ...out });
  } catch (e: any) {
    (res as any).status(400).json({ ok: false, error: e?.message || "status_failed" });
  }
});

export function start() {
  const port = Number(process.env.PORT || 5055);
  // bind internal only:
  app.listen(port, "127.0.0.1", () => console.log(`[vps-runner] listening on 127.0.0.1:${port}`));
}