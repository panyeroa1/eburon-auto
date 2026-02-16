/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { createClient } from '@supabase/supabase-js';
import { FunctionCall } from './state';
import { FunctionResponseScheduling } from '@google/genai';
import { create } from 'zustand';

// --- Local Storage & Configuration ---

interface MemoryState {
  supabaseUrl: string;
  supabaseKey: string;
  sessionId: string;
  setSupabaseConfig: (url: string, key: string) => void;
  initSession: () => void;
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  supabaseUrl: localStorage.getItem('eburon_supabase_url') || process.env.REACT_APP_SUPABASE_URL || '',
  supabaseKey: localStorage.getItem('eburon_supabase_key') || process.env.REACT_APP_SUPABASE_KEY || '',
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
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'The search query to find relevant past messages.',
        },
        limit: {
          type: 'INTEGER',
          description: 'Number of results to return (default 5).',
        }
      },
      required: ['query'],
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
}
