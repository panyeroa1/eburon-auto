import express from "express";
import cors from "cors";
import { ToolExecuteRequest } from "./tools.schemas";
import { toolRegistry } from "./tools.registry";

const app = express();
app.use(cors()); // Allow all CORS for sandbox
app.use(express.json({ limit: "10mb" }) as any);

function requireApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = (req as any).headers["authorization"];
  const auth = (Array.isArray(authHeader) ? authHeader[0] : authHeader) || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!process.env.TOOL_BROKER_API_KEY || token !== process.env.TOOL_BROKER_API_KEY) {
    return (res as any).status(401).json({ ok: false, error: "unauthorized" });
  }
  next();
}

app.post("/v1/tools/execute", requireApiKey, async (req, res) => {
  try {
    const parsed = ToolExecuteRequest.parse(req.body);
    const entry = (toolRegistry as any)[parsed.tool_name];
    if (!entry) return (res as any).status(400).json({ ok: false, error: "unknown_tool" });

    const validatedArgs = entry.validate(parsed.arguments);
    const result = await entry.execute(validatedArgs);

    return (res as any).json({
      ok: true,
      request_id: parsed.request_id,
      tool_name: parsed.tool_name,
      data: result?.data ?? result,
      logs: result?.logs ?? [],
      job_id: result?.job_id ?? null,
      error: null
    });
  } catch (e: any) {
    console.error("Tool execution error:", e);
    return (res as any).status(400).json({
      ok: false,
      error: e?.message || "bad_request",
      details: e?.issues || null
    });
  }
});

export function start() {
  const port = Number(process.env.PORT || 5040);
  app.listen(port, "0.0.0.0", () => console.log(`[tool-broker] listening on :${port}`));
}