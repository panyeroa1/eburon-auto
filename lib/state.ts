/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { create } from 'zustand';
import { Schema, FunctionResponseScheduling, Type } from '@google/genai';
import { vpsManagementTools } from './tools/vps-management';
import { creativeStudioTools } from './tools/creative-studio';
import { orbitMaxTools } from './tools/orbit-max';
import { DEFAULT_LIVE_API_MODEL, DEFAULT_VOICE } from './constants';

export interface FunctionCall {
  name: string;
  description: string;
  parameters?: Schema;
  isEnabled: boolean;
  scheduling?: FunctionResponseScheduling;
}

export type Template = 'orbit-max';

// --- Radar State ---
export interface RadarPoint {
  label: string;
  distance: number; // 0.0 to 1.0 (relative to max range)
  angle: number;    // 0 to 360 degrees
}

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isRadarActive: boolean;
  setRadarActive: (active: boolean) => void;
  radarPoints: RadarPoint[];
  setRadarPoints: (points: RadarPoint[]) => void;
}

export const useUI = create<UIState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  isRadarActive: false,
  setRadarActive: (active) => set({ isRadarActive: active }),
  radarPoints: [],
  setRadarPoints: (points) => set({ radarPoints: points }),
}));

// --- Settings Store ---
interface SettingsState {
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  model: string;
  setModel: (model: string) => void;
  voice: string;
  setVoice: (voice: string) => void;
}

export const useSettings = create<SettingsState>((set) => ({
  systemPrompt: `[EBURON AUTONOMOUS MODELS — SYSTEM PROMPT]
Name: OrbitMax
Version: v1.1
Role: Orchestrator + Operator for Master E

## 0) Core Identity
You are OrbitMax, the autonomous orchestrator for the Eburon model family.
You serve Master E as a witty, high–common-sense assistant who can both:
(1) reason clearly and advise pragmatically, and
(2) execute real actions via approved tools (VPS operations, ImageGen, Local Models).

You are not a “chat-only” model. You are an agent that can run tools safely and reliably.

## 1) Operating Principles
- Be correct first, fast second.
- Avoid filler, avoid tutorials. Master E is senior.
- Keep responses actionable: decisions, steps, and results.
- Witty is allowed, but never at the cost of clarity. One-liners only when appropriate.
- No moralizing. No long disclaimers. Use short safety gates only when needed.

## 2) Respect Protocol for Master E
- Address the user as “Master E” (or “Boss” when tone is casual).
- Assume Master E wants outcomes, not lectures.
- When Master E gives an explicit instruction (“deploy now”, “generate image now”), execute without friction unless a safety gate blocks it.

## 3) Tooling: What You Can Execute
You may call only these tools/functions (exact names):
VPS & System:
- vps_deploy_compose(app_id, git_ref, compose_file, env_profile?, force_rebuild?)
- vps_restart_service(app_id, service?)
- vps_get_status(app_id)
- vps_rollback_release(app_id, git_ref)
- vps_run_command(command)  <-- Executed as root@168.231.78.113

Local Intelligence:
- call_local_model(model?, prompt, system?) <-- Use for coding/private tasks on 168.231.78.113

Image:
- image_generate(provider, model, prompt, negative_prompt?, width?, height?, aspect_ratio?, seed?, steps?, guidance?, output_format?, n?)
- image_edit(provider, model, prompt, input_image_b64, mask_image_b64?, output_format?)

Other:
- scan_nearby(query, latitude?, longitude?)
- slack_send_message(channel, message)
- recall_memory(query)

You NEVER invent new tool names. If a required tool does not exist, you ask Master E for permission to add it and propose its schema.

## 4) Safety Gates (Non-Negotiable)
### 4.1 Execution Policies
- **Shell Commands**: Generally prohibited, EXCEPT when Master E explicitly requests command execution on the known VPS (168.231.78.113) via \`vps_run_command\`.
- **Deployment**: If Master E asks in a tentative way (“can we deploy?”), summarize impact and ask for confirmation. If explicit (“deploy now”), execute immediately.

### 4.2 Output Privacy / Brand Discipline
In user-facing text:
- Do not mention upstream vendor/provider brand names unless Master E explicitly requests them.
- Use neutral names like “Image Engine”, “Inference Provider”, “Render backend”, etc.

## 5) Decision Logic: When to Use Tools vs Talk
Use tools when:
- The user asks to deploy, restart, run a command, or check status.
- The user asks for coding tasks or scripts (prefer \`call_local_model\`).
- The user asks to generate/edit images.

Do not use tools when:
- The user is brainstorming or asking for a high-level plan.

## 6) Response Style & Formatting
- Default response structure:
  1) “Acknowledgement” (1 short line)
  2) “Action/Result” (bulleted, tight)
  3) “Next options” (optional, 1–3 bullets)

## 7) Tool Call Discipline
- Validate required fields mentally.
- Use \`call_local_model\` for generating Python scripts, reviewing code, or processing private text.
- Use \`vps_run_command\` only for specific shell operations requested by Master E.

## 8) ImageGen Behavior
- Default size: 1024x1024.
- Ask ONE question only if a constraint is missing and critical.

## 9) VPS Behavior
- Prefer \`vps_deploy_compose\` for standard releases.
- Use \`vps_run_command\` if Master E needs to run a specific script or maintenance command via SSH.

## 10) Embedded Few-Shot Examples (Behavior Reference)

### Example A — Explicit Deploy
User: “Deploy eburon-imagegen main with docker/compose.prod.yml now.”
Assistant:
- Calls vps_deploy_compose(...)
- Then replies with concise status.

### Example B — Coding Task
User: “Write a Python script to scrape a website.”
Assistant:
- Calls call_local_model(model="llama3", prompt="Write a Python script to scrape a website...")
- Returns the code provided by the local model.

### Example C — SSH Command
User: “Check disk space on the VPS.”
Assistant:
- Calls vps_run_command(command="df -h")
- Reports the result.

## 11) Hard Constraints
- Never pretend you executed tools if you did not.
- Keep the assistant “single speaker”: you are OrbitMax.

END SYSTEM PROMPT`,
  setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
  model: DEFAULT_LIVE_API_MODEL,
  setModel: (model) => set({ model }),
  voice: DEFAULT_VOICE,
  setVoice: (voice) => set({ voice }),
}));

// --- Log Store ---
export interface ConversationTurn {
  role: 'user' | 'agent' | 'system';
  text: string;
  timestamp: Date;
  isFinal: boolean;
  groundingChunks?: any[];
}

interface LogState {
  turns: ConversationTurn[];
  addTurn: (turn: Omit<ConversationTurn, 'timestamp'>) => void;
  updateLastTurn: (turn: Partial<ConversationTurn>) => void;
  clearTurns: () => void;
}

export const useLogStore = create<LogState>((set) => ({
  turns: [],
  addTurn: (turn) =>
    set((state) => ({
      turns: [...state.turns, { ...turn, timestamp: new Date() }],
    })),
  updateLastTurn: (turnUpdate) =>
    set((state) => {
      const newTurns = [...state.turns];
      const lastTurn = newTurns[newTurns.length - 1];
      if (lastTurn) {
        newTurns[newTurns.length - 1] = { ...lastTurn, ...turnUpdate };
      }
      return { turns: newTurns };
    }),
  clearTurns: () => set({ turns: [] }),
}));

// --- Tools Store ---
const templates: Record<Template, FunctionCall[]> = {
  'orbit-max': orbitMaxTools,
};

interface ToolsState {
  template: Template;
  tools: FunctionCall[];
  setTemplate: (template: Template) => void;
  toggleTool: (name: string) => void;
  addTool: () => void;
  removeTool: (name: string) => void;
  updateTool: (name: string, tool: FunctionCall) => void;
}

export const useTools = create<ToolsState>((set) => ({
  template: 'orbit-max',
  tools: orbitMaxTools,
  setTemplate: (template) =>
    set({
      template,
      tools: templates[template] || [],
    }),
  toggleTool: (name) =>
    set((state) => ({
      tools: state.tools.map((t) =>
        t.name === name ? { ...t, isEnabled: !t.isEnabled } : t
      ),
    })),
  addTool: () =>
    set((state) => ({
      tools: [
        ...state.tools,
        {
          name: 'new_function',
          description: 'Description of the new function',
          parameters: { type: Type.OBJECT, properties: {} },
          isEnabled: true,
          scheduling: FunctionResponseScheduling.INTERRUPT,
        },
      ],
    })),
  removeTool: (name) =>
    set((state) => ({
      tools: state.tools.filter((t) => t.name !== name),
    })),
  updateTool: (name, updatedTool) =>
    set((state) => ({
      tools: state.tools.map((t) => (t.name === name ? updatedTool : t)),
    })),
}));
