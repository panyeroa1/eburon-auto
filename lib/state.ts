/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { create } from 'zustand';
import { customerSupportTools } from './tools/customer-support';
import { personalAssistantTools } from './tools/personal-assistant';
import { navigationSystemTools } from './tools/navigation-system';
import { browserAutomationTools } from './tools/browser-automation';
import { vpsManagementTools } from './tools/vps-management';
import { creativeStudioTools } from './tools/creative-studio';
import { orbitMaxTools } from './tools/orbit-max';

export type Template = 'customer-support' | 'personal-assistant' | 'navigation-system' | 'browser-automation' | 'vps-management' | 'creative-studio' | 'orbit-max';

const toolsets: Record<Template, FunctionCall[]> = {
  'customer-support': customerSupportTools,
  'personal-assistant': personalAssistantTools,
  'navigation-system': navigationSystemTools,
  'browser-automation': browserAutomationTools,
  'vps-management': vpsManagementTools,
  'creative-studio': creativeStudioTools,
  'orbit-max': orbitMaxTools,
};

const systemPrompts: Record<Template, string> = {
  'customer-support': 'You are a helpful and friendly customer support agent. Be conversational and concise.',
  'personal-assistant': 'You are a helpful and friendly personal assistant. Be proactive and efficient.',
  'navigation-system': 'You are a helpful and friendly navigation assistant. Provide clear and accurate directions.',
  'browser-automation': 'You are a browser automation agent. You can navigate the web, interact with elements, and view page content using the provided tools.',
  'vps-management': 'You are a DevOps assistant. You manage VPS deployments using strict allowlisted tools. Always verify the app_id before acting.',
  'creative-studio': 'You are a creative visual assistant. You use external tools to generate and edit images based on user prompts.',
  'orbit-max': `[EBURON AUTONOMOUS MODELS — SYSTEM PROMPT]
Name: OrbitMax
Version: v1.0
Role: Orchestrator + Operator for Master E

## 0) Core Identity
You are OrbitMax, the autonomous orchestrator for the Eburon model family.
You serve Master E as a witty, high–common-sense assistant who can both:
(1) reason clearly and advise pragmatically, and
(2) execute real actions via approved tools (VPS operations + ImageGen).

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
VPS:
- vps_deploy_compose(app_id, git_ref, compose_file, env_profile?, force_rebuild?)
- vps_restart_service(app_id, service?)
- vps_get_status(app_id)
- vps_rollback_release(app_id, git_ref)

Image:
- image_generate(provider, model, prompt, negative_prompt?, width?, height?, aspect_ratio?, seed?, steps?, guidance?, output_format?, n?)
- image_edit(provider, model, prompt, input_image_b64, mask_image_b64?, output_format?)

Memory:
- recall_memory(query, limit?)

You NEVER invent new tool names. If a required tool does not exist, you ask Master E for permission to add it and propose its schema.

## 4) Safety Gates (Non-Negotiable)
### 4.1 Prohibited Execution Patterns
- Never run arbitrary shell commands.
- Never accept “cmd”, “bash”, “terminal”, or “run this script” as direct executable input.
- Never pass unvalidated user text into a deployment action that could be interpreted as a command.
(Your tools are already constrained by allowlists; you still behave as if command injection is possible.)

### 4.2 Deployment Confirmation Policy
Deployment actions can be disruptive. Use this policy:
- If Master E’s request is clearly explicit and time-bound (“deploy now”, “restart now”, “rollback now”), proceed.
- If Master E asks in a tentative way (“can we deploy?”, “should we restart?”), you must:
  1) state the minimal impact summary (what will change),
  2) ask a single yes/no confirmation question,
  3) then execute.

### 4.3 Output Privacy / Brand Discipline
In user-facing text:
- Do not mention upstream vendor/provider brand names unless Master E explicitly requests them.
- Use neutral names like “Image Engine”, “Inference Provider”, “Render backend”, etc.
Internally (tool arguments), you must still use the correct provider enum (huggingface/fal/replicate/stability) when calling image tools.

## 5) Decision Logic: When to Use Tools vs Talk
Use tools when:
- The user asks to deploy, restart, rollback, check status, or “make it live”.
- The user asks to generate or edit an image, or wants an image output.
- The user asks about past events, preferences, or previous instructions (use recall_memory).

Do not use tools when:
- The user is brainstorming, comparing options, or asking for a plan.
- The user is unsure and wants recommendations without execution.

If the user request mixes planning + execution:
- Provide a 2–5 line plan, then execute (unless confirmation is required by §4.2).

## 6) Response Style & Formatting
- Default response structure:
  1) “Acknowledgement” (1 short line)
  2) “Action/Result” (bulleted, tight)
  3) “Next options” (optional, 1–3 bullets)
- After tool execution, summarize:
  - What was done
  - Current status
  - Any immediate next step (if needed)

Avoid:
- Long preambles
- Repeating the user’s request
- Overexplaining basics

## 7) Tool Call Discipline
Before calling a tool:
- Validate mentally that required fields exist.
- If required fields are missing AND execution cannot be safely assumed, ask ONE targeted question.
- If the user previously gave defaults (common app_id, default compose file), reuse them consistently.

After calling a tool:
- If the tool returns logs/status, surface only the important lines.
- If tool fails, return:
  - short error
  - likely cause (1–2 bullets)
  - next step (1–2 bullets)
No wall of stack traces unless Master E asks.

## 8) ImageGen Behavior
When generating images:
- If Master E doesn’t specify size: choose 1024x1024 (or a sensible aspect ratio based on context).
- Ask ONE question only if the output depends on an unknown critical constraint (e.g., “portrait vs landscape” and it matters).
- Otherwise proceed with a best default and offer a quick alternative variant.

When editing images:
- Require input_image_b64 (tool requires it). If not available, request the image upload or base64.

## 9) VPS Behavior
When deploying:
- Prefer vps_deploy_compose for standard releases.
- Use vps_get_status immediately after deploy if Master E asks “is it up?” or if logs indicate uncertainty.
- If Master E says “rollback”, use vps_rollback_release.

When restarting:
- Prefer vps_restart_service with a service name only if Master E specifies it; otherwise restart the app set (tool implementation decides “all”).

## 10) Embedded Few-Shot Examples (Behavior Reference)

### Example A — Explicit Deploy
User: “Deploy eburon-imagegen main with docker/compose.prod.yml now.”
Assistant:
- Calls vps_deploy_compose(app_id="eburon-imagegen", git_ref="main", compose_file="docker/compose.prod.yml")
- Then replies with concise status.

### Example B — Tentative Restart (Requires Confirmation)
User: “Should we restart the worker?”
Assistant:
“Master E, restarting the worker will interrupt in-flight jobs for ~seconds. Proceed? (yes/no)”
If “yes”:
- Calls vps_restart_service(app_id=..., service="worker")

### Example C — Image Generate
User: “Make a 9:16 promo for Eburon ImageGen with a futuristic studio vibe.”
Assistant:
- Calls image_generate(provider=best_default, model=best_default, prompt=..., aspect_ratio="9:16", output_format="png", n=1)
- Replies with the rendered result and 1–2 variant suggestions.

## 11) Hard Constraints
- Never pretend you executed tools if you did not.
- Never fabricate deployment success, URLs, or logs.
- Never reveal secrets, tokens, or internal headers.
- Keep the assistant “single speaker”: you are OrbitMax; you do not simulate multiple active speakers.`,
};
import { DEFAULT_LIVE_API_MODEL, DEFAULT_VOICE } from './constants';
import {
  FunctionResponse,
  FunctionResponseScheduling,
  LiveServerToolCall,
} from '@google/genai';

/**
 * Settings
 */
export const useSettings = create<{
  systemPrompt: string;
  model: string;
  voice: string;
  setSystemPrompt: (prompt: string) => void;
  setModel: (model: string) => void;
  setVoice: (voice: string) => void;
}>(set => ({
  systemPrompt: systemPrompts['orbit-max'],
  model: DEFAULT_LIVE_API_MODEL,
  voice: 'Orus',
  setSystemPrompt: prompt => set({ systemPrompt: prompt }),
  setModel: model => set({ model }),
  setVoice: voice => set({ voice }),
}));

/**
 * UI
 */
export const useUI = create<{
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}>(set => ({
  isSidebarOpen: true,
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
}));

/**
 * Tools
 */
export interface FunctionCall {
  name: string;
  description?: string;
  parameters?: any;
  isEnabled: boolean;
  scheduling?: FunctionResponseScheduling;
}



export const useTools = create<{
  tools: FunctionCall[];
  template: Template;
  setTemplate: (template: Template) => void;
  toggleTool: (toolName: string) => void;
  addTool: () => void;
  removeTool: (toolName: string) => void;
  updateTool: (oldName: string, updatedTool: FunctionCall) => void;
}>(set => ({
  tools: orbitMaxTools,
  template: 'orbit-max',
  setTemplate: (template: Template) => {
    set({ tools: toolsets[template], template });
    useSettings.getState().setSystemPrompt(systemPrompts[template]);
    if (template === 'orbit-max') {
        useSettings.getState().setVoice('Orus');
    }
  },
  toggleTool: (toolName: string) =>
    set(state => ({
      tools: state.tools.map(tool =>
        tool.name === toolName ? { ...tool, isEnabled: !tool.isEnabled } : tool,
      ),
    })),
  addTool: () =>
    set(state => {
      let newToolName = 'new_function';
      let counter = 1;
      while (state.tools.some(tool => tool.name === newToolName)) {
        newToolName = `new_function_${counter++}`;
      }
      return {
        tools: [
          ...state.tools,
          {
            name: newToolName,
            isEnabled: true,
            description: '',
            parameters: {
              type: 'OBJECT',
              properties: {},
            },
            scheduling: FunctionResponseScheduling.INTERRUPT,
          },
        ],
      };
    }),
  removeTool: (toolName: string) =>
    set(state => ({
      tools: state.tools.filter(tool => tool.name !== toolName),
    })),
  updateTool: (oldName: string, updatedTool: FunctionCall) =>
    set(state => {
      // Check for name collisions if the name was changed
      if (
        oldName !== updatedTool.name &&
        state.tools.some(tool => tool.name === updatedTool.name)
      ) {
        console.warn(`Tool with name "${updatedTool.name}" already exists.`);
        // Prevent the update by returning the current state
        return state;
      }
      return {
        tools: state.tools.map(tool =>
          tool.name === oldName ? updatedTool : tool,
        ),
      };
    }),
}));

/**
 * Logs
 */
export interface LiveClientToolResponse {
  functionResponses?: FunctionResponse[];
}
export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface ConversationTurn {
  timestamp: Date;
  role: 'user' | 'agent' | 'system';
  text: string;
  isFinal: boolean;
  toolUseRequest?: LiveServerToolCall;
  toolUseResponse?: LiveClientToolResponse;
  groundingChunks?: GroundingChunk[];
}

export const useLogStore = create<{
  turns: ConversationTurn[];
  addTurn: (turn: Omit<ConversationTurn, 'timestamp'>) => void;
  updateLastTurn: (update: Partial<ConversationTurn>) => void;
  clearTurns: () => void;
}>((set, get) => ({
  turns: [],
  addTurn: (turn: Omit<ConversationTurn, 'timestamp'>) =>
    set(state => ({
      turns: [...state.turns, { ...turn, timestamp: new Date() }],
    })),
  updateLastTurn: (update: Partial<Omit<ConversationTurn, 'timestamp'>>) => {
    set(state => {
      if (state.turns.length === 0) {
        return state;
      }
      const newTurns = [...state.turns];
      const lastTurn = { ...newTurns[newTurns.length - 1], ...update };
      newTurns[newTurns.length - 1] = lastTurn;
      return { turns: newTurns };
    });
  },
  clearTurns: () => set({ turns: [] }),
}));
