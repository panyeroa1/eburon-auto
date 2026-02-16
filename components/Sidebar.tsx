/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { FunctionCall, useSettings, useUI, useTools, useConnectionStore } from '@/lib/state';
import c from 'classnames';
import { DEFAULT_LIVE_API_MODEL, AVAILABLE_VOICES, AVAILABLE_LANGUAGES } from '@/lib/constants';
import { useLiveAPIContext } from '@/contexts/LiveAPIContext';
import { useState, useEffect } from 'react';
import ToolEditorModal from './ToolEditorModal';
import { useMemoryStore } from '@/lib/memory';

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useUI();
  const { systemPrompt, voice, language, localModel, setSystemPrompt, setVoice, setLanguage, setLocalModel } =
    useSettings();
  const { tools, toggleTool, addTool, removeTool, updateTool } = useTools();
  const { connected } = useLiveAPIContext();
  const { supabaseUrl, supabaseKey, setSupabaseConfig } = useMemoryStore();
  const { toolBrokerUrl, toolBrokerApiKey, ollamaUrl, setToolBrokerUrl, setToolBrokerApiKey, setOllamaUrl } = useConnectionStore();

  const [editingTool, setEditingTool] = useState<FunctionCall | null>(null);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);

  // Fetch Ollama models when URL changes or component mounts
  useEffect(() => {
    async function fetchModels() {
      try {
        // Assume ollamaUrl is base (e.g. http://168.231.78.113/api)
        // Adjust path if user provided full generate path
        const baseUrl = ollamaUrl.replace('/generate', '');
        const res = await fetch(`${baseUrl}/tags`);
        if (res.ok) {
          const data = await res.json();
          // Ollama /api/tags returns { models: [ { name: "model:tag" }, ... ] }
          if (data.models && Array.isArray(data.models)) {
            const names = data.models.map((m: any) => m.name);
            setOllamaModels(names);
            // Ensure selected model is in list, if not set first
            if (names.length > 0 && !names.includes(localModel)) {
               setLocalModel(names[0]);
            }
          }
        }
      } catch (e) {
        console.warn("Failed to fetch Ollama models:", e);
        // Fallback or keep existing
      }
    }
    
    if (ollamaUrl) {
      fetchModels();
    }
  }, [ollamaUrl, localModel, setLocalModel]);

  const handleSaveTool = (updatedTool: FunctionCall) => {
    if (editingTool) {
      updateTool(editingTool.name, updatedTool);
    }
    setEditingTool(null);
  };

  return (
    <>
      <aside className={c('sidebar', { open: isSidebarOpen })}>
        <div className="sidebar-header">
          <h3>Settings</h3>
          <button onClick={toggleSidebar} className="close-button">
            <span className="icon">close</span>
          </button>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-section">
            <h4 className="sidebar-section-title">Server Configuration</h4>
            <label>
              Tool Broker URL
              <input
                 type="text"
                 value={toolBrokerUrl}
                 onChange={(e) => setToolBrokerUrl(e.target.value)}
                 placeholder="http://localhost:5040/v1/tools/execute"
              />
            </label>
            <label>
              Tool Broker API Key
              <input
                 type="password"
                 value={toolBrokerApiKey}
                 onChange={(e) => setToolBrokerApiKey(e.target.value)}
                 placeholder="Authorization Bearer Token"
              />
            </label>
            <label>
              Ollama Base URL
              <input
                 type="text"
                 value={ollamaUrl}
                 onChange={(e) => setOllamaUrl(e.target.value)}
                 placeholder="http://168.231.78.113/api"
              />
            </label>
          </div>
          <div className="sidebar-section">
            <h4 className="sidebar-section-title">Memory & Persistence</h4>
            <label>
              Supabase URL
              <input
                 type="text"
                 value={supabaseUrl}
                 onChange={(e) => setSupabaseConfig(e.target.value, supabaseKey)}
                 placeholder="https://xyz.supabase.co"
              />
            </label>
            <label>
              Supabase Key
              <input
                 type="password"
                 value={supabaseKey}
                 onChange={(e) => setSupabaseConfig(supabaseUrl, e.target.value)}
                 placeholder="public-anon-key"
              />
            </label>
          </div>
          <div className="sidebar-section">
            <h4 className="sidebar-section-title">Agent Config</h4>
            <fieldset disabled={connected}>
              <label>
                Language
                <select value={language} onChange={e => setLanguage(e.target.value)}>
                   {AVAILABLE_LANGUAGES.map(l => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                   ))}
                </select>
              </label>
              <label>
                System Prompt
                <textarea
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  rows={10}
                  placeholder="Describe the role and personality of the AI..."
                />
              </label>
              <label>
                Local Model (Ollama)
                <select value={localModel} onChange={e => setLocalModel(e.target.value)}>
                  {ollamaModels.length > 0 ? (
                    ollamaModels.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))
                  ) : (
                    <option value="llama3:latest">llama3:latest (Default)</option>
                  )}
                </select>
                <div style={{fontSize: '0.8em', color: 'gray', marginTop: '4px'}}>
                   Used for 'call_local_model' tasks on VPS.
                </div>
              </label>
              <label>
                Voice
                <select value={voice} onChange={e => setVoice(e.target.value)}>
                  {AVAILABLE_VOICES.map(v => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>
          </div>
          <div className="sidebar-section">
            <h4 className="sidebar-section-title">Tools</h4>
            <div className="tools-list">
              {tools.map(tool => (
                <div key={tool.name} className="tool-item">
                  <label className="tool-checkbox-wrapper">
                    <input
                      type="checkbox"
                      id={`tool-checkbox-${tool.name}`}
                      checked={tool.isEnabled}
                      onChange={() => toggleTool(tool.name)}
                      disabled={connected}
                    />
                    <span className="checkbox-visual"></span>
                  </label>
                  <label
                    htmlFor={`tool-checkbox-${tool.name}`}
                    className="tool-name-text"
                  >
                    {tool.name}
                  </label>
                  <div className="tool-actions">
                    <button
                      onClick={() => setEditingTool(tool)}
                      disabled={connected}
                      aria-label={`Edit ${tool.name}`}
                    >
                      <span className="icon">edit</span>
                    </button>
                    <button
                      onClick={() => removeTool(tool.name)}
                      disabled={connected}
                      aria-label={`Delete ${tool.name}`}
                    >
                      <span className="icon">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addTool}
              className="add-tool-button"
              disabled={connected}
            >
              <span className="icon">add</span> Add function call
            </button>
          </div>
        </div>
      </aside>
      {editingTool && (
        <ToolEditorModal
          tool={editingTool}
          onClose={() => setEditingTool(null)}
          onSave={handleSaveTool}
        />
      )}
    </>
  );
}