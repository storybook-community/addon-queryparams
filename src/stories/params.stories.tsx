import preview from '#.storybook/preview';
import React from 'react';
import { expect } from 'storybook/test';

const meta = preview.meta({
  title: 'Example/Params',
  component: () => {
    const urlParams = new URLSearchParams(document.location.search);
    const mockedParam = urlParams.get('mock');
    return <div>Mocked value: {String(mockedParam)}</div>;
  },
  parameters: {
    query: {
      mock: 'Hello world!',
    },
  },
});

export const Playground = meta.story({
  play: async ({ canvas }) => {
    await expect(new URLSearchParams(window.location.search).get('mock')).toBe('Hello world!');
    await expect(await canvas.findByText('Mocked value: Hello world!')).toBeInTheDocument();
  },
});

export const ClearedParam = meta.story({
  parameters: {
    query: {
      // `null` removes a parameter, even one set at the meta level, so this story renders "null".
      mock: null,
    },
  },
  play: async ({ canvas }) => {
    await expect(new URLSearchParams(window.location.search).has('mock')).toBe(false);
    await expect(await canvas.findByText('Mocked value: null')).toBeInTheDocument();
  },
});
