/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { customerSupportTools } from './customer-support';
import { personalAssistantTools } from './personal-assistant';
import { navigationSystemTools } from './navigation-system';
import { browserAutomationTools } from './browser-automation';
import { vpsManagementTools } from './vps-management';
import { creativeStudioTools } from './creative-studio';
import { memoryTools } from '../memory';
import { FunctionCall } from '../state';

export const orbitMaxTools: FunctionCall[] = [
  ...customerSupportTools,
  ...personalAssistantTools,
  ...navigationSystemTools,
  ...browserAutomationTools,
  ...vpsManagementTools,
  ...creativeStudioTools,
  ...memoryTools,
];
