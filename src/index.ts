import { definePreviewAddon } from 'storybook/internal/csf';

import * as addonAnnotations from './preview';
import type { QueryParams, QueryParamsParameter } from './preview';
import type { PARAM_KEY } from './constants';

export type { QueryParams, QueryParamsParameter };

export default () =>
  definePreviewAddon<{
    parameters: {
      [PARAM_KEY]?: QueryParamsParameter;
    };
  }>(addonAnnotations);
