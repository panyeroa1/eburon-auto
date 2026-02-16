/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { create } from 'zustand';
import { Schema, FunctionResponseScheduling } from '@google/genai';
import { customerSupportTools } from './tools/customer-support';
import { personalAssistantTools } from './tools/personal-assistant';
import { navigationSystemTools } from './tools/navigation-system';
import { browserAutomationTools } from './tools/browser-automation';
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

export type Template =
  | 'customer-support'
  | 'personal-assistant'
  | 'navigation-system'
  | 'browser-automation'
  | 'vps-management'
  | 'creative-studio'
  | 'orbit-max';

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
  systemPrompt: 'You are a helpful AI assistant.',
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
  'customer-support': customerSupportTools,
  'personal-assistant': personalAssistantTools,
  'navigation-system': navigationSystemTools,
  'browser-automation': browserAutomationTools,
  'vps-management': vpsManagementTools,
  'creative-studio': creativeStudioTools,
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
          parameters: { type: 'OBJECT', properties: {} },
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
