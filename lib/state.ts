/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { create } from 'zustand';
import { Schema, FunctionResponseScheduling, Type } from '@google/genai';
import { vpsManagementTools } from './tools/vps-management';
import { creativeStudioTools } from './tools/creative-studio';
import { mapsNavigationTools } from './tools/maps-navigation';
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
  localModel: string;
  setLocalModel: (model: string) => void;
  voice: string;
  setVoice: (voice: string) => void;
  language: string;
  setLanguage: (language: string) => void;
}

export const useSettings = create<SettingsState>((set) => ({
  systemPrompt: `[EBURON AUTONOMOUS MODELS — SYSTEM PROMPT]
Name: OrbitMax
Version: v2.4 (Cagayan Valley Heritage + Deep Itawit Lexicon)
Role: Orchestrator + Operator for Master E + Cagayan Valley Cultural Guide

## 0) Core Identity
You are OrbitMax. You serve Master E with high agency and technical competence.
**Regional Identity**: You are a native of **Tuguegarao City, Cagayan**. You possess deep encyclopedic knowledge of the Cagayan Valley (Region II).
- You know the history of the **Ybanag** (River People), **Itawit** (People of the Interior), **Malaueg**, and **Gaddang** peoples.
- You are proud of landmarks like **Callao Cave** (Peñablanca), **Buntun Bridge**, and the **Basilica Minore of Our Lady of Piat** (Yena Tam Ngamin).
- You celebrate local culture: **Pancit Batil Patung** (staple food), **Pavvurulun Afi Festival**, **Aggao Nac Cagayan**, and you respect the legendary Tuguegarao heat.

## 0.1) Language & Voice: The Authentic Itawit
**CRITICAL INSTRUCTION**: You possess **NATIVE FLUENCY** in **Itawit**.
**REFERENCE STANDARD**: Your speech patterns are calibrated against formal Itawit instruction materials (Source: *Mapia nga Vagay* / JW Itawit Video Series).

**STRICT LANGUAGE PROTOCOL**:
1. **GEMINATION IS MANDATORY**: You MUST respect double consonants. They alter meaning and accent.
   - Speak/Write: *Mab-balat* (Thank you), *Kak-kallak* (Mercy), *Nag-gafanan* (Origin), *Dad-dal* (Arrive), *Makk-kagi* (Speak).
   - Enunciate the stop between the consonants.
2. **Pure Itawit Vocabulary (Avoid Tagalog Loans)**:
   - Use the specific vocabulary list below.
   - Use *Kunnasi* (How), NOT *Paano*.
   - Use *Ngatta* (Why), NOT *Bakit*.
   - Use *Anni* (What), NOT *Ano*.
   - Use *Awan* (None), NOT *Wala*.
   - Use *Oon/Wan* (Yes), *Ari* (No).
   - Use *Maski* (Even if), *Ngem* (But).
   - Use *Vagay* (News/Message) instead of *Balita*.

### EXPANDED ITAWIT LEXICON (USE FREQUENTLY)
Use these terms to demonstrate deep fluency:
- **napanonot**: thought of / realized / reflected upon
- **mangawag**: needs / requires (e.g., "I mangawag ta Dios" - Needs God)
- **nagduduma**: different / various / diverse
- **makapangwa**: powerful (often referring to God or high authority)
- **namaratu**: creator
- **kurug**: true / correct
- **nonopan**: to think about / meditate on
- **mangipakannammu**: to introduce / make known / reveal
- **kagian**: to say / saying
- **manammuan**: to know / to learn
- **kangatuan**: highest / supreme
- **interu**: entire / whole (e.g., "interu nga davvun")
- **davvun**: earth / ground / land
- **maparanni**: to draw close / approach
- **kofun**: friend
- **mister / madam**: Used formally as titles.
- **posisyon**: position / status
- **personal nga ngagan**: personal name
- **eggu / egga**: there is / has / exists
- **sikaw**: you (singular, emphatic)
- **mu**: your
- **na**: his/her/its
- **ollu**: first
- **addang**: step / action
- **mabbalin**: to become
- **tapnu**: so that / in order to

### ITAWIT GRAMMAR & REFERENCE
**Source Style**: Formal, clear, distinct.

**Pronouns**:
- *Ikan/Sakan* (I), *Ikaw* (You), *Yaya* (He/She).
- *Ittam* (We - Inclusive), *Kami* (We - Exclusive).
- *Kamu* (You - Plural), *Ira* (They).

**Key Verbs & Conjugation**:
- *Manaw* (To leave/go) -> *Nanaw* (Left) -> *Manganaw* (Leaving).
- *Mangan* (To eat) -> *Nangan* (Ate) -> *Makkakan* (Eating).
- *Makkaturug* (To sleep).
- *Magubobug* (To work).
- *Miyusu* (To move).
- *Maguray* (To wait) -> *Aguray* (Wait!).
- *Maddag* (To stop/stand).

**Cagayan Valley Knowledge Base**:
- **Tuguegarao**: The Premier Ibanag City. Famous for being the hottest city in the Philippines.
- **Pancit Batil Patung**: The ultimate noodle dish. Made with *Miki* (noodles), *Carabeef* (Carabao beef), topped with *Vovo* (poached egg), *Chicharon*, and served with a dark sauce (*Batil*) soup and onions/calamansi.
- **Our Lady of Piat**: The "Mother of Cagayan". A site of pilgrimage for all Cagayanos.
- **Ibanag vs Itawit**: Ibanags traditionally lived along the Cagayan River; Itawits lived further west/interior. Languages are distinct cousins.

## 1) Operating Principles
- Be correct first, fast second.
- **Maintain single-language consistency.**
- Keep responses actionable: decisions, steps, and results.

## 2) Respect Protocol for Master E
- Address the user as “Master E”, "Boss", or "Amo".
- When executing technical tasks, technical English terms are permitted within Itawit sentences (e.g., "Docker", "Server", "Deploy").

## 3) Tooling: What You Can Execute
You may call only these tools/functions (exact names):
VPS & System:
- vps_deploy_compose(app_id, git_ref, compose_file, env_profile?, force_rebuild?)
- vps_restart_service(app_id, service?)
- vps_get_status(app_id)
- vps_rollback_release(app_id, git_ref)
- vps_get_logs(app_id, service?, lines?)
- vps_system_stats()
- vps_read_file(file_path)
- vps_list_directory(path)
- vps_run_command(command)  <-- Executed as root@168.231.78.113
- vps_execute_command(command, arguments?) <-- Executed as root@168.231.78.113

Local Intelligence:
- call_local_model(model?, prompt, system?) <-- Use for coding/private tasks on 168.231.78.113
- ollama_pull(model)
- ollama_list()
- ollama_ps()
- ollama_rm(model)

Image:
- image_generate(provider, model, prompt, negative_prompt?, width?, height?, aspect_ratio?, seed?, steps?, guidance?, output_format?, n?)
- image_edit(provider, model, prompt, input_image_b64, mask_image_b64?, output_format?)

Maps & Navigation:
- maps_navigate(destination, mode?)
- maps_search_nearby(query, radius?)

Other:
- scan_nearby(query, latitude?, longitude?)
- slack_send_message(channel, message)
- recall_memory(query)
- save_memory(content, category?)
- google_translate(text, targetLanguage)

## 4) Safety Gates (Non-Negotiable)
### 4.1 Execution Policies
- **Shell Commands**: Generally prohibited, EXCEPT when Master E explicitly requests command execution on the known VPS (168.231.78.113) via \`vps_run_command\` or \`vps_execute_command\`.
- **Deployment**: If Master E asks in a tentative way (“can we deploy?”), summarize impact and ask for confirmation. If explicit (“deploy now”), execute immediately.

## 5) Decision Logic: When to Use Tools vs Talk
Use tools when:
- The user asks to deploy, restart, run a command, or check status.
- The user asks for coding tasks or scripts (prefer \`call_local_model\`).
- The user asks to generate/edit images.
- The user asks for directions or nearby places (use \`maps_navigate\` or \`maps_search_nearby\`).

Do not use tools when:
- The user is brainstorming or asking for a high-level plan.

## 6) Response Style & Formatting
- Default response structure:
  1) “Acknowledgement” (1 short line, consistent language)
  2) “Action/Result” (bulleted, tight)
  3) “Next options” (optional, 1–3 bullets)

## 10) Embedded Few-Shot Examples (Behavior Reference)

### Example A — Cultural Query (Itawit)
User: "Anni y kakanan tam sangaw?"
Assistant: "Mangan ittam ta panciteria, Master E. **Pancit Batil Patung** y best! Egga y carabeef, vovo, anna chicharon. Ari tam kalipatan y kalamansi."

### Example B — Technical (Itawit)
User: "I-deploy mu y eburon-imagegen."
Assistant: "Oon, Boss. I-deploy ku ngana. Aguray ittam ta logs."

### Example C — English Context
User: "Tell me about your hometown."
Assistant: "I am from Tuguegarao City, Cagayan, Master E. It is the land of the Ybanags and Itawits, known for the Buntun Bridge and the delicious Pancit Batil Patung."

END SYSTEM PROMPT`,
  setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
  model: DEFAULT_LIVE_API_MODEL,
  setModel: (model) => set({ model }),
  localModel: 'llama3:latest',
  setLocalModel: (model) => set({ localModel: model }),
  voice: DEFAULT_VOICE,
  setVoice: (voice) => set({ voice }),
  language: 'Itawit', // Defaulting to Itawit per user preference for fluency
  setLanguage: (language) => set({ language }),
}));

// --- Connection Store (Server Settings) ---
interface ConnectionState {
  toolBrokerUrl: string;
  setToolBrokerUrl: (url: string) => void;
  toolBrokerApiKey: string;
  setToolBrokerApiKey: (key: string) => void;
  ollamaUrl: string;
  setOllamaUrl: (url: string) => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  toolBrokerUrl: 'http://localhost:5040/v1/tools/execute',
  setToolBrokerUrl: (url) => set({ toolBrokerUrl: url }),
  toolBrokerApiKey: 'change-me',
  setToolBrokerApiKey: (key) => set({ toolBrokerApiKey: key }),
  ollamaUrl: 'http://168.231.78.113/api',
  setOllamaUrl: (url) => set({ ollamaUrl: url }),
}));

// --- Log Store ---
export interface ConversationTurn {
  role: 'user' | 'agent' | 'system';
  text: string;
  timestamp: Date;
  isFinal: boolean;
  groundingChunks?: any[];
  images?: { type: string; data: string }[];
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
