/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { vpsManagementTools } from './vps-management';
import { creativeStudioTools } from './creative-studio';
import { memoryTools } from '../memory';
import { localModelTools } from './local-models';
import { radarTools } from './radar';
import { mapsNavigationTools } from './maps-navigation';
import { googleServiceTools } from './google-services';
import { slackIntegrationTools } from './slack-integration';
import { FunctionCall } from '../state';

export const orbitMaxTools: FunctionCall[] = [
  ...vpsManagementTools,
  ...creativeStudioTools,
  ...memoryTools,
  ...localModelTools,
  ...radarTools,
  ...mapsNavigationTools,
  ...googleServiceTools,
  ...slackIntegrationTools,
];