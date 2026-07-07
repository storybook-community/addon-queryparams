import preview from '#.storybook/preview';
import React from 'react';

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

export const Playground = meta.story({});

export const ClearedParam = meta.story({
  parameters: {
    query: {
      // `null` removes a parameter, even one set at the meta level, so this story renders "null".
      mock: null,
    },
  },
});
