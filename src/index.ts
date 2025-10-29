import { definePreviewAddon } from 'storybook/internal/csf';

import * as addonAnnotations from './preview';
import type { PARAM_KEY } from './constants';

export default () =>
  definePreviewAddon<{
    parameters: {
      [PARAM_KEY]?: string | Record<string, string>;
    };
  }>(addonAnnotations);
