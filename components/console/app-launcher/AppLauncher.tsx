/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import './AppLauncher.css';
import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';
import { useLogStore } from '@/lib/state';

interface AppConfig {
  id: string;
  label: string;
  icon: string;
  prompt: string;
  colorClass: string;
}

const APPS: AppConfig[] = [
  { id: 'search', label: 'Search', icon: 'search', prompt: 'I need to search the web for something.', colorClass: 'search' },
  { id: 'maps', label: 'Maps', icon: 'map', prompt: 'Open Google Maps and find where I am.', colorClass: 'maps' },
  { id: 'gmail', label: 'Gmail', icon: 'mail', prompt: 'Check my Gmail for unread messages.', colorClass: 'gmail' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar_today', prompt: 'What is on my Calendar today?', colorClass: 'calendar' },
  { id: 'drive', label: 'Drive', icon: 'add_to_drive', prompt: 'Search my Google Drive for recent files.', colorClass: 'drive' },
  { id: 'docs', label: 'Docs', icon: 'description', prompt: 'Create a new Google Doc.', colorClass: 'docs' },
  { id: 'sheets', label: 'Sheets', icon: 'table_chart', prompt: 'Create a new spreadsheet for tracking expenses.', colorClass: 'sheets' },
  { id: 'slides', label: 'Slides', icon: 'slideshow', prompt: 'Create a presentation about our quarterly goals.', colorClass: 'slides' },
  { id: 'keep', label: 'Keep', icon: 'lightbulb', prompt: 'Take a note: Buy milk and eggs.', colorClass: 'keep' },
  { id: 'slack', label: 'Slack', icon: 'forum', prompt: 'Send a message to the #general channel on Slack.', colorClass: 'slack' },
  { id: 'code', label: 'Code', icon: 'terminal', prompt: 'Use the local model to write a Python script.', colorClass: 'code' },
  { id: 'youtube', label: 'YouTube', icon: 'smart_display', prompt: 'Search YouTube for tech news.', colorClass: 'youtube' },
  { id: 'translate', label: 'Translate', icon: 'translate', prompt: 'I want to translate something.', colorClass: 'translate' },
  { id: 'photos', label: 'Photos', icon: 'photo_library', prompt: 'Show me my recent photos.', colorClass: 'photos' },
  { id: 'meet', label: 'Meet', icon: 'video_camera_front', prompt: 'Start a Google Meet.', colorClass: 'meet' },
  { id: 'vps', label: 'VPS', icon: 'dns', prompt: 'Check the status of my VPS deployment.', colorClass: 'orbit' },
  { id: 'studio', label: 'Studio', icon: 'palette', prompt: 'I want to generate an image.', colorClass: 'orbit' },
];

export default function AppLauncher() {
  const { client, connected, connect } = useLiveAPIContext();
  const { addTurn } = useLogStore();

  const handleAppClick = (app: AppConfig) => {
    if (!connected) {
      connect();
      // We can't send immediately if not connected, but user flow usually implies connecting first.
      return;
    }

    // Send the prompt to the model
    client.send([{ text: app.prompt }]);
    
    // Optimistically show in UI
    addTurn({
      role: 'user',
      text: app.prompt,
      isFinal: true
    });
  };

  return (
    <div className="app-launcher">
      <div className="launcher-header">
        <h2>OrbitMax</h2>
        <p>Google Workspace & Service Hub</p>
      </div>
      <div className="apps-grid">
        {APPS.map((app) => (
          <button 
            key={app.id} 
            className={`app-item ${app.colorClass}`}
            onClick={() => handleAppClick(app)}
          >
            <div className="app-icon">
              <span className="material-symbols-outlined">{app.icon}</span>
            </div>
            <span className="app-label">{app.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
