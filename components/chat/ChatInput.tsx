/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef } from 'react';
import { useLiveAPIContext } from '../../contexts/LiveAPIContext';
import { useLogStore } from '../../lib/state';

export default function ChatInput() {
  const { client, connected } = useLiveAPIContext();
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!text.trim() || !connected) return;

    client.send([{ text: text.trim() }]);

    // Manually add the user's message to the log store so it appears in the console immediately
    useLogStore.getState().addTurn({
      role: 'user',
      text: text.trim(),
      isFinal: true,
    });

    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-input-container">
      <div className={`chat-input-box ${!connected ? 'disabled' : ''}`}>
        {/* Rebranded prompt from gemini> to orbit> */}
        <span className="chat-input-prompt">orbit&gt;</span>

        <textarea
          ref={inputRef}
          className="chat-input-field"
          placeholder={connected ? 'Type a message...' : 'Connect to start chatting'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!connected}
          rows={1}
        />

        <button
          className={`send-button ${!text.trim() || !connected ? 'disabled' : ''}`}
          onClick={handleSubmit}
        >
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>
    </div>
  );
}
