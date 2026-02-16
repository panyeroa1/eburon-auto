/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import './WelcomeScreen.css';
import { useTools, Template } from '../../../lib/state';

const welcomeContent: Record<Template, { title: string; description: string; prompts: string[] }> = {
  'customer-support': {
    title: 'Customer Support',
    description: 'Handle customer inquiries and see how function calls can automate tasks.',
    prompts: [
      "I'd like to return an item.",
      "What's the status of my order?",
      'Can I speak to a representative?',
    ],
  },
  'personal-assistant': {
    title: 'Personal Assistant',
    description: 'Manage your schedule, send emails, and set reminders.',
    prompts: [
      'Create a calendar event for a meeting tomorrow at 10am.',
      'Send an email to jane@example.com.',
      'Set a reminder to buy milk.',
    ],
  },
  'navigation-system': {
    title: 'Navigation System',
    description: 'Find routes, nearby places, and get traffic information.',
    prompts: [
      'Find a route to the nearest coffee shop.',
      'Are there any parks nearby?',
      "What's the traffic like on the way to the airport?",
    ],
  },
  'browser-automation': {
    title: 'Browser Automation',
    description: 'Control a virtual browser to navigate websites and interact with elements.',
    prompts: [
      'Go to google.com and search for "Gemini API"',
      'Take a screenshot of the homepage',
      'Click the "Login" button',
    ],
  },
  'vps-management': {
    title: 'VPS Management',
    description: 'Deploy and manage applications on a VPS using Docker Compose.',
    prompts: [
      'Deploy the eburon-imagegen app from the main branch',
      'Restart the api service for eburon-imagegen',
      'Get the status of eburon-imagegen',
    ],
  },
  'creative-studio': {
    title: 'Creative Studio',
    description: 'Generate and edit images using external AI providers.',
    prompts: [
      'Generate a cyberpunk city using HuggingFace',
      'Create a portrait of a cat in the style of Van Gogh',
    ],
  },
  'orbit-max': {
    title: 'OrbitMax',
    description: 'Autonomous orchestrator for the Eburon model family. Handles everything.',
    prompts: [
      'Deploy eburon-imagegen main with docker/compose.prod.yml now.',
      'Make a 9:16 promo for Eburon ImageGen.',
      'Go to google.com and search for "Gemini API"',
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
            <select value={template} onChange={(e) => setTemplate(e.target.value as Template)} aria-label="Select a template">
              <option value="customer-support">Customer Support</option>
              <option value="personal-assistant">Personal Assistant</option>
              <option value="navigation-system">Navigation System</option>
              <option value="browser-automation">Browser Automation</option>
              <option value="vps-management">VPS Management</option>
              <option value="creative-studio">Creative Studio</option>
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
