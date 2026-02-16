/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FunctionResponseScheduling, Type } from '@google/genai';
import { FunctionCall } from '../state';

export const browserAutomationTools: FunctionCall[] = [
  {
    name: 'browser_navigate',
    description: 'Navigates the browser to the specified URL.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        url: {
          type: Type.STRING,
          description: 'The URL to navigate to.',
        },
      },
      required: ['url'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'browser_click',
    description: 'Clicks on an element specified by the selector.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        selector: {
          type: Type.STRING,
          description: 'The CSS selector of the element to click.',
        },
      },
      required: ['selector'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'browser_fill',
    description: 'Fills an input element specified by the selector with a value.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        selector: {
          type: Type.STRING,
          description: 'The CSS selector of the input element.',
        },
        value: {
          type: Type.STRING,
          description: 'The value to type into the input.',
        },
      },
      required: ['selector', 'value'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'browser_screenshot',
    description: 'Takes a screenshot of the current page.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'browser_content',
    description: 'Gets the text content of the current page.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'browser_press_keys',
    description: 'Presses a key or combination of keys on a specific element.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        selector: {
          type: Type.STRING,
          description: 'The CSS selector of the element to focus before pressing keys.',
        },
        keys: {
          type: Type.STRING,
          description: 'The key or combination of keys to press (e.g., "Enter", "Control+A").',
        },
      },
      required: ['selector', 'keys'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'browser_hover',
    description: 'Hovers over an element specified by the selector.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        selector: {
          type: Type.STRING,
          description: 'The CSS selector of the element to hover over.',
        },
      },
      required: ['selector'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'browser_get_element',
    description: 'Gets details (text content, attributes) of an element specified by the selector.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        selector: {
          type: Type.STRING,
          description: 'The CSS selector of the element to retrieve.',
        },
      },
      required: ['selector'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
];