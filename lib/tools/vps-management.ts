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
    name: 'vps_rollback_release',
    description: 'Rollback an app to a previous git reference (re-deploys old ref).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        app_id: { type: Type.STRING },
        git_ref: { type: Type.STRING, description: 'The specific git hash or tag to rollback to.' }
      },
      required: ['app_id', 'git_ref']
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
    name: 'vps_get_logs',
    description: 'Fetch recent logs for a service or app.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        app_id: { type: Type.STRING },
        service: { type: Type.STRING, description: 'Service name (optional, defaults to all).' },
        lines: { type: Type.INTEGER, description: 'Number of lines to retrieve (default 50).' }
      },
      required: ['app_id']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'vps_system_stats',
    description: 'Get VPS system statistics (CPU, Memory, Disk, Uptime).',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'vps_read_file',
    description: 'Read the content of a specific file on the VPS (useful for checking configs).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        file_path: { type: Type.STRING, description: 'Absolute path to the file.' }
      },
      required: ['file_path']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'vps_list_directory',
    description: 'List files and directories in a specific path.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        path: { type: Type.STRING, description: 'Directory path to list.' }
      },
      required: ['path']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'vps_run_command',
    description: 'Execute a shell command on the VPS (168.231.78.113) as root using the configured password. Use with caution.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        command: { type: Type.STRING, description: 'The shell command to execute.' },
      },
      required: ['command']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'vps_execute_command',
    description: 'Execute an arbitrary command on the VPS with arguments.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        command: { type: Type.STRING, description: 'The command executable.' },
        arguments: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING }, 
          description: 'Arguments for the command.' 
        }
      },
      required: ['command']
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  }
];