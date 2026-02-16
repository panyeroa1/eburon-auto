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

import cn from 'classnames';

import { memo, ReactNode, useEffect, useRef, useState, useCallback } from 'react';
import { AudioRecorder } from '../../../lib/audio-recorder';
import { useLogStore, useUI } from '@/lib/state';

import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';

export type ControlTrayProps = {
  children?: ReactNode;
};

function ControlTray({ children }: ControlTrayProps) {
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const connectButtonRef = useRef<HTMLButtonElement>(null);

  const { client, connected, connect, disconnect, isVolumeMuted, mute, unmute } = useLiveAPIContext();
  const { isRadarActive, setRadarActive } = useUI();

  useEffect(() => {
    if (!connected && connectButtonRef.current) {
      connectButtonRef.current.focus();
    }
  }, [connected]);

  useEffect(() => {
    if (!connected) {
      setMuted(false);
      setVideoEnabled(false);
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
      }
      setRadarActive(false);
    }
  }, [connected, setRadarActive]);

  // Handle Audio Input
  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([
        {
          mimeType: 'audio/pcm;rate=16000',
          data: base64,
        },
      ]);
    };
    if (connected && !muted && audioRecorder) {
      audioRecorder.on('data', onData);
      // FIX: Handle start() promise rejection to prevent runtime crash on NetworkError/NotAllowedError
      audioRecorder.start().catch((err: any) => {
        console.error("Audio Recorder failed to start:", err);
      });
    } else {
      audioRecorder.stop();
    }
    return () => {
      audioRecorder.off('data', onData);
    };
  }, [connected, client, muted, audioRecorder]);

  // Handle Video Input
  const toggleVideo = useCallback(async () => {
    if (videoEnabled) {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
      }
      setVideoEnabled(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoStream(stream);
        setVideoEnabled(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
  }, [videoEnabled, videoStream]);

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  useEffect(() => {
    if (!connected || !videoEnabled || !videoRef.current || !canvasRef.current) return;

    const interval = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
        
        client.sendRealtimeInput([
          {
            mimeType: 'image/jpeg',
            data: base64,
          }
        ]);
      }
    }, 1000 / 5); // 5 FPS

    return () => clearInterval(interval);
  }, [connected, videoEnabled, client]);

  // Handle Speaker Mute
  const toggleSpeaker = () => {
    if (isVolumeMuted) {
      unmute();
    } else {
      mute();
    }
  };

  const handleMicClick = () => {
    if (connected) {
      setMuted(!muted);
    } else {
      connect();
    }
  };

  // Handle Radar Scan
  const handleRadarScan = () => {
    if (!connected) return;
    setRadarActive(true);
    // Send a prompt to the agent to look around
    client.send([{ text: "Scan my surroundings and tell me what is near me. Use the map." }]);
    
    // Add to log manually
    useLogStore.getState().addTurn({
        role: 'user',
        text: "Scan my surroundings and tell me what is near me.",
        isFinal: true
    });
  };

  const micButtonTitle = connected
    ? muted
      ? 'Unmute microphone'
      : 'Mute microphone'
    : 'Connect and start microphone';

  const connectButtonTitle = connected ? 'Stop streaming' : 'Start streaming';
  const videoButtonTitle = videoEnabled ? 'Turn off camera' : 'Turn on camera';
  const speakerButtonTitle = isVolumeMuted ? 'Unmute speaker' : 'Mute speaker';
  const radarButtonTitle = "Scan surroundings (Near Me)";

  return (
    <section className="control-tray">
      {/* Hidden elements for media capture */}
      <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <nav className={cn('actions-nav')}>
        <button
          className={cn('action-button mic-button')}
          onClick={handleMicClick}
          title={micButtonTitle}
        >
          {!muted ? (
            <span className="material-symbols-outlined filled">mic</span>
          ) : (
            <span className="material-symbols-outlined filled">mic_off</span>
          )}
        </button>

        <button
          className={cn('action-button', { active: videoEnabled })}
          onClick={toggleVideo}
          title={videoButtonTitle}
          disabled={!connected}
        >
          <span className="material-symbols-outlined filled">
            {videoEnabled ? 'videocam' : 'videocam_off'}
          </span>
        </button>

        <button
          className={cn('action-button')}
          onClick={toggleSpeaker}
          title={speakerButtonTitle}
          disabled={!connected}
        >
          <span className="material-symbols-outlined filled">
            {isVolumeMuted ? 'volume_off' : 'volume_up'}
          </span>
        </button>

        <button
          className={cn('action-button', { active: isRadarActive })}
          onClick={handleRadarScan}
          title={radarButtonTitle}
          disabled={!connected}
        >
           <span className="material-symbols-outlined filled">radar</span>
        </button>

        {children}
      </nav>

      <div className={cn('connection-container', { connected })}>
        <div className="connection-button-container">
          <button
            ref={connectButtonRef}
            className={cn('action-button connect-toggle', { connected })}
            onClick={connected ? disconnect : connect}
            title={connectButtonTitle}
          >
            <span className="material-symbols-outlined filled">
              {connected ? 'pause' : 'play_arrow'}
            </span>
          </button>
        </div>
        <span className="text-indicator">Streaming</span>
      </div>
    </section>
  );
}

export default memo(ControlTray);
