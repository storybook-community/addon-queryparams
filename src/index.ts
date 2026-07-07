import { definePreviewAddon } from 'storybook/internal/csf';

import * as addonAnnotations from './preview';
import type { QueryParams } from './preview';
import type { PARAM_KEY } from './constants';

export type { QueryParams };

export default () =>
  definePreviewAddon<{
    parameters: {
      [PARAM_KEY]?: QueryParams;
    };
  }>(addonAnnotations);
