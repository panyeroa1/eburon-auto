import { FunctionCall } from '../state';
import { FunctionResponseScheduling, Type } from '@google/genai';

export const vpsManagementTools: FunctionCall[] = [
  {
    name: 'vps_deploy_compose',
    description: 'Deploy an allowlisted app on the VPS using docker compose.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        app_id: { type: Type.STRING },
        git_ref: { type: Type.STRING, description: 'branch|tag|sha' },
        compose_file: { type: Type.STRING, description: 'relative path inside repo' },
        env_profile: { type: Type.STRING, description: 'optional compose profile' },
        force_rebuild: { type: Type.BOOLEAN }
      },
      required: ['app_id', 'git_ref', 'compose_file']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'vps_restart_service',
    description: 'Restart an allowlisted service (docker compose restart).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        app_id: { type: Type.STRING },
        service: { type: Type.STRING, description: 'service name in compose' }
      },
      required: ['app_id']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'vps_get_status',
    description: 'Get status for an allowlisted app (docker compose ps).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        app_id: { type: Type.STRING }
      },
      required: ['app_id']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'vps_run_command',
    description: 'Execute a shell command on the VPS (168.231.78.113) as root using the configured password.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        command: { type: Type.STRING, description: 'The shell command to execute.' },
      },
      required: ['command']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  }
];
