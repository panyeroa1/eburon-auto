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
import { useLogStore, useSettings } from '@/lib/state';
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

        // Check if this is a Local Model (Ollama) tool
        if (fc.name === 'call_local_model') {
           try {
             const ollamaUrl = 'http://127.0.0.1:11434/api/generate';
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
             console.error("Local Model Tool Error", e);
             functionResponses.push({
                 id: fc.id,
                 name: fc.name,
                 response: { error: "Failed to call local model. Ensure Ollama is running (http://127.0.0.1:11434) with CORS enabled (OLLAMA_ORIGINS='*'). Details: " + e.message }
             });
           }
           continue;
        }

        // Check if this is a VPS or Image tool that needs the broker
        const isBrokerTool = fc.name.startsWith('vps_') || fc.name.startsWith('image_');

        if (isBrokerTool) {
          try {
            // Call the local tool broker
            // NOTE: In a real app, the API Key for the broker should be secure. 
            // Here we use the default "change-me" from the .env.example or a known local key.
            const response = await fetch('http://localhost:5040/v1/tools/execute', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer change-me'
              },
              body: JSON.stringify({
                tool_name: fc.name,
                arguments: fc.args,
                request_id: fc.id,
                session_id: 'session-' + Date.now()
              })
            });
            
            const result = await response.json();
            
            functionResponses.push({
              id: fc.id,
              name: fc.name,
              response: { result: result }
            });

          } catch (e: any) {
             console.error("Tool Broker Error", e);
             functionResponses.push({
              id: fc.id,
              name: fc.name,
              response: { error: e.message }
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
  }, [client]);

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
