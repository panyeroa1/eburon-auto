/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import './WelcomeScreen.css';
import { useTools, Template } from '../../../lib/state';

const welcomeContent: Record<Template, { title: string; description: string; prompts: string[] }> = {
  'orbit-max': {
    title: 'OrbitMax',
    description: 'Autonomous orchestrator for the Eburon model family. Handles everything.',
    prompts: [
      'Deploy eburon-imagegen main with docker/compose.prod.yml now.',
      'Make a 9:16 promo for Eburon ImageGen.',
      'Scan my surroundings and tell me what is near me.',
    ],
  },
};

const WelcomeScreen: React.FC = () => {
  const { template, setTemplate } = useTools();
  const { title, description, prompts } = welcomeContent[template];
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="title-container">
          <span className="welcome-icon">mic</span>
          <div className="title-selector">
            {/* 
               Since there is only one template now, we render a static span or disabled select.
               Keeping it as a single option select for minimal UI disruption.
            */}
            <select value={template} onChange={(e) => setTemplate(e.target.value as Template)} aria-label="Select a template" disabled>
              <option value="orbit-max">OrbitMax</option>
            </select>
            <span className="icon">arrow_drop_down</span>
          </div>
        </div>
        <p>{description}</p>
        <div className="example-prompts">
          {prompts.map((prompt, index) => (
            <div key={index} className="prompt">{prompt}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
