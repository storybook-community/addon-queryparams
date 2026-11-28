// @vitest-environment node
import type { StoryContext } from 'storybook/internal/types';
import { describe, expect, it, vi } from 'vitest';

import * as preview from './preview';

describe('beforeEach in a DOM-less environment', () => {
  it('does nothing instead of crashing when there is no URL to mock', () => {
    const context = { parameters: { query: { mock: 'Hello world!' } } } as unknown as StoryContext;

    expect(preview.beforeEach(context)).toBeUndefined();
  });

  it('does not call a query function when there is no URL to mock', () => {
    const query = vi.fn(() => ({ mock: 'Hello world!' }));
    const context = { parameters: { query } } as unknown as StoryContext;

    expect(preview.beforeEach(context)).toBeUndefined();
    expect(query).not.toHaveBeenCalled();
  });
});
