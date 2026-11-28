import preview from '#.storybook/preview';
import React from 'react';
import { expect } from 'storybook/test';

const meta = preview.meta({
  title: 'Example/Params-Function',
  component: () => {
    const urlParams = new URLSearchParams(document.location.search);
    return (
      <div>
        Mocked params:
        {['story', 'mock'].map((key) => (
          <div key={key}>
            <strong>{key}</strong>: {String(urlParams.get(key))}
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    // A function receives the story context, so the query parameters can depend on the story.
    query: (context) => ({
      story: context.name,
      mock: 'Hello world from callback!',
    }),
  },
});

export const Playground = meta.story({
  play: async ({ canvas }) => {
    const params = new URLSearchParams(window.location.search);
    await expect(params.get('story')).toBe('Playground');
    await expect(params.get('mock')).toBe('Hello world from callback!');
    await expect(await canvas.findByText('Hello world from callback!', { exact: false })).toBeInTheDocument();
  },
});
