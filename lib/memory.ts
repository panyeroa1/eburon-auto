/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { createClient } from '@supabase/supabase-js';
import { FunctionCall } from './state';
import { FunctionResponseScheduling, Type } from '@google/genai';
import { create } from 'zustand';

// --- Local Storage & Configuration ---

interface MemoryState {
  supabaseUrl: string;
  supabaseKey: string;
  sessionId: string;
  setSupabaseConfig: (url: string, key: string) => void;
  initSession: () => void;
}

// User provided credentials:
// URL: https://xscdwdnjujpkczfhqrgu.supabase.co
// Key: sb_publishable_bboPqK7xbTCp7kTpWOFavw_w0Vucd4T

export const useMemoryStore = create<MemoryState>((set, get) => ({
  supabaseUrl: localStorage.getItem('eburon_supabase_url') || process.env.REACT_APP_SUPABASE_URL || 'https://xscdwdnjujpkczfhqrgu.supabase.co',
  supabaseKey: localStorage.getItem('eburon_supabase_key') || process.env.REACT_APP_SUPABASE_KEY || 'sb_publishable_bboPqK7xbTCp7kTpWOFavw_w0Vucd4T',
  sessionId: localStorage.getItem('eburon_session_id') || `session-${Date.now()}`,
  
  setSupabaseConfig: (url: string, key: string) => {
    localStorage.setItem('eburon_supabase_url', url);
    localStorage.setItem('eburon_supabase_key', key);
    set({ supabaseUrl: url, supabaseKey: key });
  },

  initSession: () => {
    let sid = localStorage.getItem('eburon_session_id');
    if (!sid) {
      sid = `session-${Date.now()}`;
      localStorage.setItem('eburon_session_id', sid);
    }
    set({ sessionId: sid });
  }
}));

// Initialize session immediately
useMemoryStore.getState().initSession();


// --- Supabase Client Helper ---

function getSupabase() {
  const { supabaseUrl, supabaseKey } = useMemoryStore.getState();
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

// --- Persistence Actions ---

/**
 * Save a message to Supabase 'messages' table.
 * 
 * Required SQL Schema:
 * create table messages (
 *   id uuid default gen_random_uuid() primary key,
 *   session_id text not null,
 *   role text not null,
 *   content text not null,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 */
export async function saveMessage(role: string, content: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { sessionId } = useMemoryStore.getState();
  
  try {
    const { error } = await supabase.from('messages').insert({
      session_id: sessionId,
      role,
      content
    });
    if (error) console.error('Failed to save message to memory:', error);
  } catch (err) {
    console.error('Supabase error:', err);
  }
}

// --- Tools ---

export const memoryTools: FunctionCall[] = [
  {
    name: 'recall_memory',
    description: 'Searches long-term memory (past conversations) for details. Use this to recall facts, user preferences, or previous instructions.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'The search query to find relevant past messages.',
        },
        limit: {
          type: Type.INTEGER,
          description: 'Number of results to return (default 5).',
        }
      },
      required: ['query'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'save_memory',
    description: 'Explicitly saves a specific fact, note, or preference to long-term memory. Use this when the user asks you to remember something specific.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        content: {
          type: Type.STRING,
          description: 'The fact or information to save.',
        },
        category: {
          type: Type.STRING,
          description: 'Optional category (e.g., preference, fact, task).',
        }
      },
      required: ['content'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  }
];

// --- Tool Execution Logic ---

// This would typically be called by the Tool Broker or Client, 
// but since we are running client-side for this sandbox, we export a helper.

export async function executeRecallMemory(args: any) {
  const supabase = getSupabase();
  if (!supabase) {
    return { result: "Memory unavailable: Supabase credentials not configured." };
  }

  const limit = args.limit || 5;
  const query = args.query;

  try {
    // Simple text search using ilike. 
    // For production, use pg_vector and embeddings.
    const { data, error } = await supabase
      .from('messages')
      .select('role, content, created_at')
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { error: `Memory recall failed: ${error.message}` };
    }

    if (!data || data.length === 0) {
      return { result: "No relevant memories found." };
    }

    return { 
      result: data.map(m => `[${new Date(m.created_at).toLocaleString()}] ${m.role}: ${m.content}`).join('\n') 
    };
  } catch (e: any) {
    console.error("Memory execution exception:", e);
    return { error: `Memory recall execution failed: ${e.message}` };
  }
}

export async function executeSaveMemory(args: any) {
  const content = args.content;
  const category = args.category || 'general';
  
  try {
    // We use a specific role 'memory' to distinguish these explicit saves 
    // from general chat logs, though recall_memory searches everything.
    await saveMessage('memory', `[${category}] ${content}`);
    return { result: "Memory saved successfully." };
  } catch (e: any) {
    return { error: `Memory save failed: ${e.message}` };
  }
}
