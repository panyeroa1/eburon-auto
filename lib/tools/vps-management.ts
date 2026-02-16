import { FunctionCall } from '../state';
import { FunctionResponseScheduling } from '@google/genai';

export const vpsManagementTools: FunctionCall[] = [
  {
    name: 'vps_deploy_compose',
    description: 'Deploy an allowlisted app on the VPS using docker compose.',
    parameters: {
      type: 'OBJECT',
      properties: {
        app_id: { type: 'STRING' },
        git_ref: { type: 'STRING', description: 'branch|tag|sha' },
        compose_file: { type: 'STRING', description: 'relative path inside repo' },
        env_profile: { type: 'STRING', description: 'optional compose profile' },
        force_rebuild: { type: 'BOOLEAN' }
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
      type: 'OBJECT',
      properties: {
        app_id: { type: 'STRING' },
        service: { type: 'STRING', description: 'service name in compose' }
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
      type: 'OBJECT',
      properties: {
        app_id: { type: 'STRING' }
      },
      required: ['app_id']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  }
];
