import { composeStory } from '@storybook/react-vite';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import * as previewAnnotations from './preview';

// Each composeStory().run() drains the cleanups of the previous run, but the last run of a test
// leaves its query parameters in place until the next one; start every test from a known URL.
const INITIAL_URL = window.location.href;

beforeEach(() => {
  history.replaceState(null, '', INITIAL_URL);
});

const QueryEcho = () => {
  const urlParams = new URLSearchParams(document.location.search);
  return <div>Mocked value: {String(urlParams.get('mock'))}</div>;
};

const meta = {
  component: QueryEcho,
  parameters: {
    query: {
      mock: 'Hello world!',
    },
  },
};

describe('portable stories', () => {
  it('applies query parameters when a story runs outside Storybook, e.g. through the Vitest addon', async () => {
    const Story = composeStory(
      {
        play: async ({ canvasElement }) => {
          const urlParams = new URLSearchParams(document.location.search);
          expect(urlParams.get('mock')).toBe('Hello world!');
          expect(canvasElement.textContent).toContain('Mocked value: Hello world!');
        },
      },
      meta,
      previewAnnotations,
    );

    await Story.run();
  });

  it('cleans up the query parameters of the previous story before the next one runs', async () => {
    const WithParams = composeStory({}, meta, previewAnnotations);
    const WithoutParams = composeStory(
      {
        play: async ({ canvasElement }) => {
          const urlParams = new URLSearchParams(document.location.search);
          expect(urlParams.get('mock')).toBeNull();
          expect(canvasElement.textContent).toContain('Mocked value: null');
        },
      },
      { component: QueryEcho },
      previewAnnotations,
    );

    await WithParams.run();
    expect(new URLSearchParams(document.location.search).get('mock')).toBe('Hello world!');

    // Portable stories run beforeEach cleanups before the next story runs.
    await WithoutParams.run();
  });
});
