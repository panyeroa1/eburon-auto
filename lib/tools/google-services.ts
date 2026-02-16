/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FunctionResponseScheduling, Type } from '@google/genai';
import { FunctionCall } from '../state';

export const googleServiceTools: FunctionCall[] = [
  {
    name: 'google_calendar_read',
    description: 'List events from the user\'s Google Calendar.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: 'Date to check (YYYY-MM-DD). Defaults to today.' },
        limit: { type: Type.INTEGER, description: 'Max number of events to return.' }
      },
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'google_calendar_create',
    description: 'Create a new event in Google Calendar.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        startTime: { type: Type.STRING, description: 'ISO 8601 string' },
        endTime: { type: Type.STRING, description: 'ISO 8601 string' },
        attendees: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['summary', 'startTime', 'endTime']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'gmail_read',
    description: 'Read recent emails from Gmail.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Search query (e.g. "from:boss", "is:unread")' },
        limit: { type: Type.INTEGER }
      },
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'gmail_send',
    description: 'Send an email via Gmail.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        to: { type: Type.STRING },
        subject: { type: Type.STRING },
        body: { type: Type.STRING }
      },
      required: ['to', 'subject', 'body']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'google_docs_create',
    description: 'Create a new Google Doc.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        content: { type: Type.STRING }
      },
      required: ['title']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'google_sheets_create',
    description: 'Create a new Google Sheet.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        headers: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['title']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'google_slides_create',
    description: 'Create a new Google Slides presentation.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        slideCount: { type: Type.INTEGER }
      },
      required: ['title']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'google_keep_create',
    description: 'Create a new note in Google Keep.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        textContent: { type: Type.STRING }
      },
      required: ['textContent']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'google_drive_search',
    description: 'Search for files in Google Drive.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING },
        fileType: { type: Type.STRING, description: 'e.g. "spreadsheet", "document", "pdf"' }
      },
      required: ['query']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'youtube_search',
    description: 'Search for videos on YouTube.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING }
      },
      required: ['query']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'google_translate',
    description: 'Translate text using Google Translate.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING, description: 'The text to translate.' },
        targetLanguage: { type: Type.STRING, description: 'The target language code (e.g., "es", "fr", "ja").' }
      },
      required: ['text', 'targetLanguage']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  }
];
