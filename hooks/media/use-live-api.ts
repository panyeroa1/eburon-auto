/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GenAILiveClient } from '../../lib/genai-live-client';
import { LiveConnectConfig, Modality, LiveServerToolCall } from '@google/genai';
import { AudioStreamer } from '../../lib/audio-streamer';
import { audioContext } from '../../lib/utils';
import VolMeterWorket from '../../lib/worklets/vol-meter';
import { useLogStore, useSettings, useUI, useConnectionStore } from '@/lib/state';
import { executeRecallMemory } from '@/lib/memory';

export type UseLiveApiResults = {
  client: GenAILiveClient;
  setConfig: (config: LiveConnectConfig) => void;
  config: LiveConnectConfig;

  connect: () => Promise<void>;
  disconnect: () => void;
  connected: boolean;

  volume: number;
  
  // Audio output control
  isVolumeMuted: boolean;
  mute: () => void;
  unmute: () => void;
};

export function useLiveApi({
  apiKey,
}: {
  apiKey: string;
}): UseLiveApiResults {
  const { model } = useSettings();
  const { toolBrokerUrl, toolBrokerApiKey, ollamaUrl } = useConnectionStore();
  const client = useMemo(() => new GenAILiveClient(apiKey, model), [apiKey, model]);

  const audioStreamerRef = useRef<AudioStreamer | null>(null);

  const [volume, setVolume] = useState(0);
  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState<LiveConnectConfig>({});
  const [isVolumeMuted, setIsVolumeMuted] = useState(false);

  // register audio for streaming server -> speakers
  useEffect(() => {
    if (!audioStreamerRef.current) {
      audioContext({ id: 'audio-out' }).then((audioCtx: AudioContext) => {
        audioStreamerRef.current = new AudioStreamer(audioCtx);
        audioStreamerRef.current
          .addWorklet<any>('vumeter-out', VolMeterWorket, (ev: any) => {
            setVolume(ev.data.volume);
          })
          .then(() => {
            // Successfully added worklet
          })
          .catch(err => {
            console.error('Error adding worklet:', err);
          });
      });
    }
  }, [audioStreamerRef]);

  useEffect(() => {
    const onOpen = () => {
      setConnected(true);
    };

    const onClose = () => {
      setConnected(false);
    };

    const stopAudioStreamer = () => {
      if (audioStreamerRef.current) {
        audioStreamerRef.current.stop();
      }
    };

    const onAudio = (data: ArrayBuffer) => {
      if (audioStreamerRef.current) {
        audioStreamerRef.current.addPCM16(new Uint8Array(data));
      }
    };

    // Bind event listeners
    client.on('open', onOpen);
    client.on('close', onClose);
    client.on('interrupted', stopAudioStreamer);
    client.on('audio', onAudio);

    const onToolCall = async (toolCall: LiveServerToolCall) => {
      const functionResponses: any[] = [];

      for (const fc of toolCall.functionCalls) {
        // Log the function call trigger
        const triggerMessage = `Triggering function call: **${
          fc.name
        }**\n\`\`\`json\n${JSON.stringify(fc.args, null, 2)}\n\`\`\``;
        useLogStore.getState().addTurn({
          role: 'system',
          text: triggerMessage,
          isFinal: true,
        });

        // --- Google Service Mocks ---
        if (fc.name === 'google_calendar_read') {
            functionResponses.push({
                id: fc.id, name: fc.name,
                response: { result: JSON.stringify([
                    { id: '1', summary: 'Team Sync', startTime: new Date(Date.now() + 3600000).toISOString() },
                    { id: '2', summary: 'Lunch with Client', startTime: new Date(Date.now() + 86400000).toISOString() }
                ])}
            });
            continue;
        }
        if (fc.name === 'google_calendar_create') {
            functionResponses.push({
                id: fc.id, name: fc.name,
                response: { result: `Event created: ${fc.args.summary} at ${fc.args.startTime}` }
            });
            continue;
        }
        if (fc.name === 'gmail_read') {
            functionResponses.push({
                id: fc.id, name: fc.name,
                response: { result: JSON.stringify([
                    { id: '101', from: 'boss@company.com', subject: 'Project Update', snippet: 'Please review the attached...' },
                    { id: '102', from: 'newsletter@tech.com', subject: 'Weekly Digest', snippet: 'Top stories this week...' }
                ])}
            });
            continue;
        }
        if (fc.name === 'gmail_send') {
            functionResponses.push({
                id: fc.id, name: fc.name,
                response: { result: `Email sent to ${fc.args.to}` }
            });
            continue;
        }
        if (fc.name === 'google_drive_search') {
            functionResponses.push({
                id: fc.id, name: fc.name,
                response: { result: JSON.stringify([
                    { name: 'Project Specs v2', type: 'document', link: 'http://docs.google.com/...' },
                    { name: 'Q3 Budget', type: 'spreadsheet', link: 'http://sheets.google.com/...' }
                ])}
            });
            continue;
        }
        if (fc.name === 'google_docs_create') {
            functionResponses.push({
                id: fc.id, name: fc.name,
                response: { result: `Created Google Doc: "${fc.args.title}" (https://docs.google.com/document/d/mock-id)` }
            });
            continue;
        }
        if (fc.name === 'google_sheets_create') {
            functionResponses.push({
                id: fc.id, name: fc.name,
                response: { result: `Created Google Sheet: "${fc.args.title}" (https://docs.google.com/spreadsheets/d/mock-id)` }
            });
            continue;
        }
        if (fc.name === 'google_slides_create') {
            functionResponses.push({
                id: fc.id, name: fc.name,
                response: { result: `Created Google Slides: "${fc.args.title}" (https://docs.google.com/presentation/d/mock-id)` }
            });
            continue;
        }
        if (fc.name === 'google_keep_create') {
            functionResponses.push({
                id: fc.id, name: fc.name,
                response: { result: `Created Keep Note: "${fc.args.title || 'Untitled'}"` }
            });
            continue;
        }
        if (fc.name === 'youtube_search') {
             functionResponses.push({
                id: fc.id, name: fc.name,
                response: { result: `Found video: "Tech News Today" (http://youtube.com/watch?v=xyz)` }
            });
            continue;
        }
         if (fc.name === 'google_translate') {
             functionResponses.push({
                id: fc.id, name: fc.name,
                response: { result: `Translated to ${fc.args.targetLanguage}: [Simulated Translation]` }
            });
            continue;
        }

        // --- Slack Mock ---
        if (fc.name === 'slack_send_message') {
            functionResponses.push({
                id: fc.id, name: fc.name,
                response: { result: `Message sent to #${fc.args.channel}: "${fc.args.message}"` }
            });
            continue;
        }


        // --- Existing Tool Logic ---

        // Check if this is a Memory tool
        if (fc.name === 'recall_memory') {
           const response = await executeRecallMemory(fc.args);
           functionResponses.push({
             id: fc.id,
             name: fc.name,
             response: response
           });
           continue;
        }

        // Check if this is the Radar tool
        if (fc.name === 'scan_nearby') {
            const query = fc.args.query as string;
            const lat = fc.args.latitude as number | undefined;
            const lng = fc.args.longitude as number | undefined;
            
            // Simulate finding nearby points since we don't have a real Place Search backend in this demo
            const count = Math.floor(Math.random() * 3) + 3; // 3 to 5 points
            const points = [];
            for(let i=0; i<count; i++) {
                points.push({
                    label: `${query} ${i+1}`,
                    distance: 0.2 + Math.random() * 0.6, // 20% to 80% distance
                    angle: Math.random() * 360
                });
            }
            
            useUI.getState().setRadarPoints(points);
            useUI.getState().setRadarActive(true);

            let locMsg = "";
            if (typeof lat === 'number' && typeof lng === 'number') {
                locMsg = ` near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            }

            functionResponses.push({
             id: fc.id,
             name: fc.name,
             response: { result: `Found ${count} locations for ${query}${locMsg}. Displaying on radar.` }
           });
           continue;
        }

        // Check if this is a Local Model (Ollama) tool
        if (fc.name === 'call_local_model') {
           try {
             // Use the specific IP provided by the user (now from store)
             const modelName = fc.args.model || 'llama3';
             const prompt = fc.args.prompt;
             const system = fc.args.system;

             // Note: User must run Ollama with OLLAMA_ORIGINS="*" to allow browser access
             const response = await fetch(ollamaUrl, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                     model: modelName,
                     prompt: prompt,
                     system: system,
                     stream: false
                 })
             });

             if (!response.ok) {
                 const errorText = await response.text();
                 throw new Error(`Ollama API error (${response.status}): ${errorText}`);
             }

             const data = await response.json();
             functionResponses.push({
                 id: fc.id,
                 name: fc.name,
                 response: { result: data.response }
             });

           } catch (e: any) {
             console.warn("Local Model Tool Error (Ollama unavailable), failing back to simulation", e);
             
             // SIMULATION FALLBACK
             functionResponses.push({
                 id: fc.id,
                 name: fc.name,
                 response: { 
                     result: `[SIMULATION: Ollama Offline]\nGenerated code for "${fc.args.prompt}":\n\`\`\`python\nprint("Hello from OrbitMax simulation!")\n# Actual model at ${ollamaUrl} is unreachable.\n\`\`\`` 
                 }
             });
           }
           continue;
        }
        
        // Check if this is a VPS Command (SSH) tool
        if (fc.name === 'vps_run_command') {
            const command = fc.args.command;
            // Mock SSH execution using provided credentials
            const creds = "root@168.231.78.113";
            const pw = "Master120221@";
            
            functionResponses.push({
                id: fc.id,
                name: fc.name,
                response: { result: `[SSH ${creds}] Authenticated (pw: ***${pw.slice(-3)}). Executed: ${command}\nResult: (Simulated Success) Command executed successfully on remote host.` }
            });
            continue;
        }

        // Check if this is a VPS or Image tool that needs the broker
        const isBrokerTool = fc.name.startsWith('vps_') || fc.name.startsWith('image_') || fc.name.startsWith('browser_');

        if (isBrokerTool) {
          try {
            // Call the local tool broker using stored config
            const response = await fetch(toolBrokerUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${toolBrokerApiKey}`
              },
              body: JSON.stringify({
                tool_name: fc.name,
                arguments: fc.args,
                request_id: fc.id,
                session_id: 'session-' + Date.now()
              })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Broker error (${response.status}): ${errorText}`);
            }

            const result = await response.json();
            
            functionResponses.push({
              id: fc.id,
              name: fc.name,
              response: { result: result }
            });

          } catch (e: any) {
             console.warn("Tool Broker Error (Service unavailable), falling back to simulation", e);

             // SIMULATION FALLBACK for Broker Tools
             let mockResult: any = { result: "Action executed successfully (Simulated Backend)" };

             if (fc.name === 'vps_deploy_compose') {
                 mockResult = { 
                    result: `[SIMULATION] Deploying ${fc.args.app_id} (ref: ${fc.args.git_ref || 'latest'})...`,
                    logs: ["[SIMULATION] git pull origin main", "[SIMULATION] docker compose build", "[SIMULATION] docker compose up -d", "[SIMULATION] Deployment successful."] 
                 };
             } else if (fc.name === 'vps_get_status') {
                 mockResult = { result: { ps: `NAME      IMAGE     STATUS\n${fc.args.app_id}     latest    Up 42 minutes` } };
             } else if (fc.name.startsWith('image_')) {
                 // 1x1 Blue Pixel to prevent broken images
                 mockResult = { 
                     result: {
                         images: [{
                             mime: "image/png",
                             b64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMObbbAAAAABJRU5ErkJggg=="
                         }]
                     },
                     logs: ["[SIMULATION] Image generated successfully."]
                 };
             } else if (fc.name.startsWith('browser_')) {
                 mockResult = { result: `Browser command '${fc.name}' executed on mocked session.` };
             }

             functionResponses.push({
              id: fc.id,
              name: fc.name,
              response: mockResult
            });
          }

        } else {
            // Default mock response for other tools
            functionResponses.push({
              id: fc.id,
              name: fc.name,
              response: { result: 'ok' }, 
            });
        }
      }

      // Log the function call response
      if (functionResponses.length > 0) {
        const responseMessage = `Function call response:\n\`\`\`json\n${JSON.stringify(
          functionResponses,
          null,
          2,
        )}\n\`\`\``;
        useLogStore.getState().addTurn({
          role: 'system',
          text: responseMessage,
          isFinal: true,
        });
      }

      client.sendToolResponse({ functionResponses: functionResponses });
    };

    client.on('toolcall', onToolCall);

    return () => {
      // Clean up event listeners
      client.off('open', onOpen);
      client.off('close', onClose);
      client.off('interrupted', stopAudioStreamer);
      client.off('audio', onAudio);
      client.off('toolcall', onToolCall);
    };
  }, [client, toolBrokerUrl, toolBrokerApiKey, ollamaUrl]);

  const connect = useCallback(async () => {
    if (!config) {
      throw new Error('config has not been set');
    }
    client.disconnect();
    await client.connect(config);
  }, [client, config]);

  const disconnect = useCallback(async () => {
    client.disconnect();
    setConnected(false);
  }, [setConnected, client]);

  const mute = useCallback(() => {
    setIsVolumeMuted(true);
    if (audioStreamerRef.current) {
        audioStreamerRef.current.gain = 0;
    }
  }, []);

  const unmute = useCallback(() => {
    setIsVolumeMuted(false);
    if (audioStreamerRef.current) {
        audioStreamerRef.current.gain = 1;
    }
  }, []);

  return {
    client,
    config,
    setConfig,
    connect,
    connected,
    disconnect,
    volume,
    isVolumeMuted,
    mute,
    unmute
  };
}