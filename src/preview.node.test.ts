// @vitest-environment node
import type { StoryContext } from 'storybook/internal/types';
import { describe, expect, it } from 'vitest';

import * as preview from './preview';

describe('beforeEach in a DOM-less environment', () => {
  it('does nothing instead of crashing when there is no URL to mock', () => {
    const context = { parameters: { query: { mock: 'Hello world!' } } } as unknown as StoryContext;

    expect(preview.beforeEach(context)).toBeUndefined();
  });
});
